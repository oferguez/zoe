export type LlmProvider = "heuristic" | "mock" | "openai-compatible";

export type AppConfig = {
  appName: string;
  appSecret: string;
  documentEncryptionKey?: string;
  decisionProvider: "heuristic" | "openai-compatible";
  requireExternalApproval: boolean;
  localAnswerMaxChars: number;
  caseTtlMinutes: number;
  maxDocuments: number;
  maxDocumentBytes: number;
  highRiskKeywords: string[];
  documentRequestKeywords: string[];
  smallLlm: {
    provider: LlmProvider;
    apiUrl: string;
    apiKey?: string;
    model: string;
  };
  largeLlm: {
    provider: LlmProvider;
    apiUrl: string;
    apiKey?: string;
    model: string;
  };
};

const DEFAULT_HIGH_RISK = [
  "diagnosis",
  "prescription",
  "dosage",
  "symptoms",
  "chest pain",
  "pregnant",
  "suicidal",
  "emergency",
  "medication",
  "lab results",
  "blood test",
  "mri",
  "scan",
  "pathology"
];

const DEFAULT_DOCUMENT_REQUESTS = [
  "lab",
  "result",
  "report",
  "scan",
  "mri",
  "ct",
  "xray",
  "blood",
  "test",
  "history",
  "medication",
  "prescription",
  "discharge"
];

function envString(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function envBoolean(name: string, fallback: boolean) {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return ["1", "true", "yes", "on"].includes(raw);
}

function envList(name: string, fallback: string[]) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const values = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return values.length ? values : fallback;
}

function decisionProvider(): AppConfig["decisionProvider"] {
  return envString("DECISION_PROVIDER", "heuristic") === "openai-compatible"
    ? "openai-compatible"
    : "heuristic";
}

function llmProvider(name: string, fallback: LlmProvider): LlmProvider {
  const value = envString(name, fallback);
  if (value === "openai-compatible" || value === "mock" || value === "heuristic") {
    return value;
  }
  return fallback;
}

export function getAppConfig(): AppConfig {
  return {
    appName: envString("APP_NAME", "Zoe Assist"),
    appSecret: envString("APP_SECRET", "dev-only-change-me"),
    documentEncryptionKey: envString("DOCUMENT_ENCRYPTION_KEY") || undefined,
    decisionProvider: decisionProvider(),
    requireExternalApproval: envBoolean("REQUIRE_EXTERNAL_APPROVAL", true),
    localAnswerMaxChars: envNumber("LOCAL_ANSWER_MAX_CHARS", 420),
    caseTtlMinutes: envNumber("CASE_TTL_MINUTES", 30),
    maxDocuments: envNumber("MAX_DOCUMENTS", 5),
    maxDocumentBytes: envNumber("MAX_DOCUMENT_BYTES", 1024 * 1024),
    highRiskKeywords: envList("HIGH_RISK_KEYWORDS", DEFAULT_HIGH_RISK),
    documentRequestKeywords: envList("DOCUMENT_REQUEST_KEYWORDS", DEFAULT_DOCUMENT_REQUESTS),
    smallLlm: {
      provider: llmProvider("SMALL_LLM_PROVIDER", "heuristic"),
      apiUrl: envString("SMALL_LLM_API_URL", "https://api.openai.com/v1/chat/completions"),
      apiKey: envString("SMALL_LLM_API_KEY") || undefined,
      model: envString("SMALL_LLM_MODEL", "gpt-4o-mini")
    },
    largeLlm: {
      provider: llmProvider("LARGE_LLM_PROVIDER", "mock"),
      apiUrl: envString("LARGE_LLM_API_URL", "https://api.openai.com/v1/chat/completions"),
      apiKey: envString("LARGE_LLM_API_KEY") || undefined,
      model: envString("LARGE_LLM_MODEL", "gpt-4.1")
    }
  };
}
