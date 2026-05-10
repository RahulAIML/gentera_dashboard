import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Build context-aware prompt
    const systemPrompt = buildSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser question: ${message}`;

    // Call Gemini API via REST
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);
      return NextResponse.json(
        { error: "Failed to generate response from AI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated";

    return NextResponse.json({ response: aiResponse });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Chat request failed";
    console.error("AI chat error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Build context-aware system prompt based on current page/filters
 */
function buildSystemPrompt(context: any): string {
  const basePrompt = `You are an AI assistant for Gentera Dashboard, helping users understand their sales simulation performance data.
You provide clear, actionable insights focused on:
- Performance trends and patterns
- Interaction-by-interaction coaching feedback
- Team and individual performance analysis
- Recommendations for improvement

Keep responses concise, data-focused, and professional. Use percentages, rankings, and specific metrics when available.`;

  if (!context) return basePrompt;

  const { page, organization, dateRange, selectedEntity } = context;

  let contextPrompt = basePrompt;

  if (page) {
    contextPrompt += `\n\nCurrent page: ${page}`;
  }

  if (organization) {
    contextPrompt += `\nOrganization scope: ${organization}`;
  }

  if (dateRange) {
    contextPrompt += `\nDate range: ${dateRange}`;
  }

  if (selectedEntity) {
    contextPrompt += `\nFocused on: ${selectedEntity}`;
  }

  return contextPrompt;
}
