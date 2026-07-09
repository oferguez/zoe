export type PrivacyMode = "public" | "private";

export type MedicalDocument = {
  name: string;
  type: string;
  size: number;
  extractedText: string;
  contentBase64: string;
};

export type ServicePayload = {
  question: string;
  privacy: PrivacyMode;
  documents: MedicalDocument[];
};

export type EncryptedEnvelope = {
  algorithm: "AES-GCM";
  iv: string;
  ciphertext: string;
  documentCount: number;
  payloadBytes: number;
};

export type AnalysisResponse =
  | {
      kind: "quick_answer";
      answer: string;
      trace: string[];
    }
  | {
      kind: "external_summary";
      summary: string;
      redactions: string[];
      trace: string[];
    };

export type ExternalResult = {
  answer: string;
  targets: string[];
};

export type SummaryDraft = {
  id: string;
  createdAt: string;
  privacy: PrivacyMode;
  sourceQuestion: string;
  summary: string;
  redactions: string[];
  trace: string[];
};
