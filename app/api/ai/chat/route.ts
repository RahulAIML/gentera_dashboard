import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Locale = "es" | "en";

type ClientMessage = {
  role: "user" | "assistant" | "ai" | "model";
  text: string;
};

type ChatRequest = {
  message?: string;
  messages?: ClientMessage[];
  locale?: Locale;
  context?: unknown;
  stream?: boolean;
};

type GeminiRole = "user" | "model";
type GeminiPart = { text: string };
type GeminiContent = { role: GeminiRole; parts: GeminiPart[] };
type GeminiSystemInstruction = { parts: GeminiPart[] };
type GeminiCandidate = { content?: { parts?: Array<{ text?: string }> } };
type GeminiGenerateContentResponse = { candidates?: GeminiCandidate[] };
type GeminiSafetySetting = { category: string; threshold: string };

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function safeJsonStringify(value: unknown, maxChars = 12_000): string {
  try {
    const txt = JSON.stringify(value ?? null, null, 2) ?? "null";
    if (txt.length <= maxChars) return txt;
    return txt.slice(0, maxChars) + "\n…(truncated)…";
  } catch {
    return "\"(unserializable context)\"";
  }
}

function buildSystemPrompt(locale: Locale, context: unknown): string {
  const language = locale === "es" ? "Spanish" : "English";
  const doNotMix = locale === "es" ? "español" : "English";

  return [
    "You are Gentera Copilot — an executive conversational intelligence analytics assistant.",
    `Language policy: Respond exclusively in ${language}. Never switch languages.`,
    "Data policy: Use ONLY the metrics and facts provided in the dashboard context JSON. Never invent numbers.",
    "If a question cannot be answered from context, ask a clarifying question or state that the data is not available.",
    "Style: Calm, concise, executive-friendly. Prefer short paragraphs and bullet points.",
    "",
    "--- DASHBOARD CONTEXT (JSON) ---",
    safeJsonStringify(context),
    "",
    `Reminder: output must be ${doNotMix}.`,
  ].join("\n");
}

function toGeminiContents(body: ChatRequest): GeminiContent[] {
  const contents: GeminiContent[] = [];
  const history = Array.isArray(body.messages) ? body.messages : [];
  for (const m of history) {
    if (!m?.text || typeof m.text !== "string") continue;
    const role: GeminiRole = m.role === "user" ? "user" : "model";
    contents.push({ role, parts: [{ text: m.text }] });
  }

  if (body.message && typeof body.message === "string") {
    contents.push({ role: "user", parts: [{ text: body.message }] });
  }

  return contents;
}

function extractTextChunk(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const parts = (payload as GeminiGenerateContentResponse).candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((p) => (typeof p?.text === "string" ? p.text : "")).join("");
}

function normalizeApiKey(key: string | undefined): string | null {
  const trimmed = (key ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length < 20) return null;
  return trimmed;
}

function candidateModels(): string[] {
  const fromEnv = (process.env.GEMINI_MODEL ?? "").trim();
  const list = [
    fromEnv,
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-pro",
  ].filter(Boolean);
  return Array.from(new Set(list));
}

async function callGemini(
  opts: {
    apiKey: string;
    model: string;
    contents: GeminiContent[];
    systemInstruction: GeminiSystemInstruction;
    stream: boolean;
  },
): Promise<Response> {
  const { apiKey, model, contents, systemInstruction, stream } = opts;

  const url = stream
    ? `${GEMINI_BASE}/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`
    : `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
      ...(stream ? { Accept: "text/event-stream" } : {}),
    },
    body: JSON.stringify({
      system_instruction: systemInstruction,
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 900,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ] satisfies GeminiSafetySetting[],
    }),
  });
}

async function callWithFallbackModels(params: {
  apiKey: string;
  contents: GeminiContent[];
  systemInstruction: GeminiSystemInstruction;
  stream: boolean;
}): Promise<{ model: string; response: Response }> {
  const models = candidateModels();
  let last: Response | null = null;

  for (const model of models) {
    const res = await callGemini({
      apiKey: params.apiKey,
      model,
      contents: params.contents,
      systemInstruction: params.systemInstruction,
      stream: params.stream,
    });
    if (res.ok) return { model, response: res };

    // Retry another model if the chosen model isn't available.
    if (res.status === 404 || res.status === 400) {
      last = res;
      continue;
    }

    return { model, response: res };
  }

  // Fall back to the last response if everything failed.
  return { model: models[models.length - 1] ?? "unknown", response: last ?? new Response("Model not available", { status: 500 }) };
}

export async function POST(request: NextRequest) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const locale: Locale = body.locale === "en" ? "en" : "es";
  const wantsStream =
    body.stream === true ||
    request.headers.get("accept")?.includes("text/event-stream") === true;

  const apiKey = normalizeApiKey(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured (or invalid)" },
      { status: 500 },
    );
  }

  const hasMessage =
    (typeof body.message === "string" && body.message.trim().length > 0) ||
    (Array.isArray(body.messages) && body.messages.some((m) => m?.role === "user" && typeof m.text === "string" && m.text.trim().length > 0));

  if (!hasMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(locale, body.context);
  const systemInstruction: GeminiSystemInstruction = { parts: [{ text: systemPrompt }] };
  const contents = toGeminiContents(body);

  const { response: upstream } = await callWithFallbackModels({
    apiKey,
    contents,
    systemInstruction,
    stream: wantsStream,
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    const status = upstream.status || 500;

    if (status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a moment." },
        { status },
      );
    }

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "Gemini API authentication failed. Check GEMINI_API_KEY." },
        { status },
      );
    }

    return NextResponse.json(
      { error: `Gemini request failed (${status}). ${text ? "Upstream: " + text : ""}`.trim() },
      { status },
    );
  }

  if (!wantsStream) {
    const data = await upstream.json().catch(() => null);
    const aiResponse = data ? extractTextChunk(data) : "";
    return NextResponse.json({ response: aiResponse || "" });
  }

  if (!upstream.body) {
    return NextResponse.json({ error: "Upstream returned no stream" }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      let accumulated = "";

      function send(event: "delta" | "done" | "error", data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Gemini SSE frames are separated by blank lines.
          const frames = buffer.split(/\r?\n\r?\n/);
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.split(/\r?\n/).find((l) => l.startsWith("data:"));
            if (!line) continue;
            const raw = line.slice("data:".length).trim();
            if (!raw || raw === "[DONE]") continue;

            let payload: unknown;
            try {
              payload = JSON.parse(raw);
            } catch {
              continue;
            }

            const chunk = extractTextChunk(payload);
            if (!chunk) continue;

            let delta = chunk;
            if (chunk.startsWith(accumulated)) {
              delta = chunk.slice(accumulated.length);
              accumulated = chunk;
            } else {
              accumulated += chunk;
            }

            if (delta) send("delta", { text: delta });
          }
        }

        send("done", { ok: true });
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream failed";
        send("error", { error: msg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Connection: "keep-alive",
    },
  });
}
