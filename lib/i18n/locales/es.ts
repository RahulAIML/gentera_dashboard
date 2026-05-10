// Structural dictionary type — all leaf values must be strings
export interface Dict {
  nav: {
    dashboard:      string;
    trends:         string;
    simulations:    string;
    conversational: string;
    coaching:       string;
    leaderboard:    string;
    org:            string;
    activities:     string;
  };
  kpi: {
    totalSimulations: string;
    uniqueUsers:      string;
    avgScore:         string;
    passRate:         string;
    activeDays:       string;
    totalActivities:  string;
  };
  filters: {
    dateRange:  string;
    activities: string;
    diagnosis:  string;
    reset:      string;
    all:        string;
    passed:     string;
    failed:     string;
    quick:      string;
    presets: {
      last7d:    string;
      last30d:   string;
      last3m:    string;
      last6m:    string;
      thisMonth: string;
      allTime:   string;
    };
  };
  charts: {
    scoreTrend:        string;
    interactionFunnel: string;
    scoreDistribution: string;
    activityBreakdown: string;
    leaderboard:       string;
  };
  table: {
    id:         string;
    user:       string;
    activity:   string;
    date:       string;
    score:      string;
    diagnosis:  string;
    approved:   string;
    failed:     string;
    viewDetails: string;
  };
  ai: {
    copilot:     string;
    insights:    string;
    performance: string;
    coaching:    string;
    trends:      string;
    close:       string;
    generating:  string;
    noInsights:  string;
  };
  auth: {
    login:          string;
    signup:         string;
    email:          string;
    password:       string;
    submit:         string;
    forgotPassword: string;
    resetPassword:  string;
    backToLogin:    string;
    noAccount:      string;
    hasAccount:     string;
    demoFill:       string;
  };
  common: {
    loading:  string;
    noData:   string;
    error:    string;
    back:     string;
    export:   string;
    previous: string;
    next:     string;
    page:     string;
    of:       string;
    showing:  string;
    results:  string;
    search:   string;
  };
  scope: {
    title:           string;
    executive:       string;
    executiveSub:    string;
    supervisor:      string;
    admin:           string;
    participant:     string;
    selectScope:     string;
    allOrg:          string;
    teamSize:        string;
    participants:    string;
    admins:          string;
    supervisors:     string;
    noData:          string;
    viewingAs:       string;
    switchView:      string;
    organization:    string;
    hierarchy:       string;
  };
}

export const es: Dict = {
  nav: {
    dashboard:      "Resumen",
    trends:         "Tendencias",
    simulations:    "Simulaciones",
    conversational: "Conversacional",
    coaching:       "Coaching IA",
    leaderboard:    "Leaderboard",
    org:            "Organización",
    activities:     "Actividades",
  },
  kpi: {
    totalSimulations: "Simulaciones",
    uniqueUsers:      "Usuarios Activos",
    avgScore:         "Puntaje Promedio",
    passRate:         "Tasa Aprobación",
    activeDays:       "Días Activos",
    totalActivities:  "Actividades",
  },
  filters: {
    dateRange:  "Rango de fechas",
    activities: "Actividades",
    diagnosis:  "Diagnóstico",
    reset:      "Limpiar",
    all:        "Todos",
    passed:     "Aprobados",
    failed:     "No aprobados",
    quick:      "Rápido",
    presets: {
      last7d:    "Últimos 7 días",
      last30d:   "Últimos 30 días",
      last3m:    "Últimos 3 meses",
      last6m:    "Últimos 6 meses",
      thisMonth: "Este mes",
      allTime:   "Todo el tiempo",
    },
  },
  charts: {
    scoreTrend:        "Tendencia de Puntaje",
    interactionFunnel: "Embudo de Interacciones",
    scoreDistribution: "Distribución de Puntajes",
    activityBreakdown: "Desglose por Actividad",
    leaderboard:       "Ranking de Asesores",
  },
  table: {
    id:         "ID",
    user:       "Usuario",
    activity:   "Actividad",
    date:       "Fecha",
    score:      "Puntaje",
    diagnosis:  "Diagnóstico",
    approved:   "Aprobado",
    failed:     "No aprobado",
    viewDetails:"Ver detalles",
  },
  ai: {
    copilot:     "Copiloto IA",
    insights:    "Insights",
    performance: "Rendimiento",
    coaching:    "Coaching",
    trends:      "Tendencias",
    close:       "Cerrar",
    generating:  "Generando insights…",
    noInsights:  "Sin insights disponibles para el período seleccionado.",
  },
  auth: {
    login:          "Iniciar sesión",
    signup:         "Crear cuenta",
    email:          "Correo electrónico",
    password:       "Contraseña",
    submit:         "Continuar",
    forgotPassword: "¿Olvidaste tu contraseña?",
    resetPassword:  "Restablecer contraseña",
    backToLogin:    "Volver al inicio de sesión",
    noAccount:      "¿No tienes cuenta?",
    hasAccount:     "¿Ya tienes cuenta?",
    demoFill:       "Rellenar con demo",
  },
  scope: {
    title:        "Vista organizacional",
    executive:    "Vista Ejecutiva",
    executiveSub: "Toda la organización Gentera",
    supervisor:   "Supervisor",
    admin:        "Admin",
    participant:  "Participante",
    selectScope:  "Seleccionar vista",
    allOrg:       "Toda la organización",
    teamSize:     "Tamaño de equipo",
    participants: "Participantes",
    admins:       "Admins",
    supervisors:  "Supervisores",
    noData:       "Sin datos para esta vista",
    viewingAs:    "Viendo como",
    switchView:   "Cambiar vista",
    organization: "Organización Gentera",
    hierarchy:    "Jerarquía",
  },
  common: {
    loading:    "Cargando…",
    noData:     "Sin datos",
    error:      "Error al cargar datos",
    back:       "Regresar",
    export:     "Exportar",
    previous:   "Anterior",
    next:       "Siguiente",
    page:       "Página",
    of:         "de",
    showing:    "Mostrando",
    results:    "resultados",
    search:     "Buscar",
  },
};
