import type {
  AnalysisResponse,
  EncryptedEnvelope,
  ExternalResult,
  PrivacyMode,
  ServicePayload
} from "@/lib/models/clientFlow";
import { decodeBase64ToBytes, encodeBytesToBase64 } from "@/lib/services/documentService";

const HIGH_CONTEXT_TERMS = [
  "diagnosis",
  "prescription",
  "dosage",
  "dose",
  "medication",
  "lab",
  "blood",
  "scan",
  "mri",
  "ct",
  "xray",
  "result",
  "symptom",
  "pain",
  "pregnant",
  "emergency"
];

export async function encryptForAnalysisService(payload: ServicePayload) {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt"
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded)
  );

  return {
    key,
    envelope: {
      algorithm: "AES-GCM" as const,
      iv: encodeBytesToBase64(iv),
      ciphertext: encodeBytesToBase64(ciphertext),
      documentCount: payload.documents.length,
      payloadBytes: encoded.byteLength
    }
  };
}

async function decryptForMockService(envelope: EncryptedEnvelope, key: CryptoKey) {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decodeBase64ToBytes(envelope.iv) },
    key,
    decodeBase64ToBytes(envelope.ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as ServicePayload;
}

function hasHighContextNeed(payload: ServicePayload) {
  const text = `${payload.question} ${payload.documents
    .map((document) => document.extractedText)
    .join(" ")}`.toLowerCase();

  return HIGH_CONTEXT_TERMS.some((term) => text.includes(term)) || payload.documents.length > 0;
}

function countMatches(input: string, pattern: RegExp) {
  return input.match(pattern)?.length || 0;
}

function anonymize(input: string) {
  let text = input;
  const counts = {
    emails: countMatches(text, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi),
    phones: countMatches(
      text,
      /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g
    ),
    dates: countMatches(text, /\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g),
    medicalIds: countMatches(
      text,
      /\b(?:MRN|medical record|patient id|nhs number)\s*[:#-]?\s*[A-Z0-9-]{4,}\b/gi
    )
  };

  text = text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .replace(
      /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
      "[phone]"
    )
    .replace(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/g, "[date]")
    .replace(
      /\b(?:MRN|medical record|patient id|nhs number)\s*[:#-]?\s*[A-Z0-9-]{4,}\b/gi,
      "[medical-id]"
    );

  return {
    text,
    redactions: [
      `${counts.emails} emails`,
      `${counts.phones} phone numbers`,
      `${counts.dates} dates`,
      `${counts.medicalIds} medical IDs`
    ]
  };
}

// TODO(backend): this whole function is the mock stand-in for the real pipeline in Doc/doc.md:
// tap "Continue" -> local Privacy Guard strips PII (name, DOB, address, NHS number, email, phone)
// -> sanitized clinical context sent to our backend -> backend calls OpenAI -> structured JSON back.
// Today `anonymize()` below is a rough regex pass and everything happens client-side with a fake
// AES-GCM envelope; there is no backend call and no real LLM. See Doc/toDo.md phases 2-3 for the
// intended `analyzeQuestionnaire()` / `/api/analyze` contract this should be replaced with.
export async function analyzeEncryptedQuestion(envelope: EncryptedEnvelope, key: CryptoKey) {
  await new Promise((resolve) => setTimeout(resolve, 450));
  const payload = await decryptForMockService(envelope, key);
  const trace = [
    "frontend encrypted payload with AES-GCM",
    "mock analysis service decrypted payload",
    `privacy=${payload.privacy}`,
    `documents=${payload.documents.length}`
  ];

  if (!hasHighContextNeed(payload) && payload.question.length < 220) {
    return {
      kind: "quick_answer",
      answer: [
        "Quick answer",
        "",
        "This looks like a general medical information question. I can answer at a high level, but this is not a diagnosis or treatment plan.",
        "",
        "For personal symptoms, medication changes, abnormal results, severe pain, chest pain, breathing trouble, fainting, or worsening symptoms, speak with a clinician or urgent care service."
      ].join("\n"),
      trace: [...trace, "route=quick_answer"]
    } satisfies AnalysisResponse;
  }

  const documentText = payload.documents
    .map(
      (document, index) =>
        `Document ${index + 1}: ${document.name}\n${document.extractedText.slice(0, 1200)}`
    )
    .join("\n\n");
  const anonymized = anonymize(
    [`Question: ${payload.question}`, documentText ? `Documents:\n${documentText}` : ""]
      .filter(Boolean)
      .join("\n\n")
  );

  return {
    kind: "external_summary",
    summary: [
      "Anonymized medical question for external analysis:",
      "",
      anonymized.text,
      "",
      `Publication preference: ${payload.privacy}.`
    ].join("\n"),
    redactions: anonymized.redactions,
    trace: [...trace, "route=external_summary"]
  } satisfies AnalysisResponse;
}

export async function sendToExternalTargets(summary: string, privacy: PrivacyMode) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const targets =
    privacy === "public"
      ? ["Large LLM analysis", "Public forum draft"]
      : ["Large LLM analysis", "Public targets skipped"];

  return {
    targets,
    answer: [
      "External answer",
      "",
      "The anonymized question was reviewed by the mock large-model target. The response is informational and should be checked with a qualified clinician for diagnosis, treatment, or medication decisions.",
      "",
      "Suggested next steps:",
      "- Compare the answer against the original clinical document.",
      "- Ask a clinician about abnormal values, medication changes, or symptoms.",
      "- Seek urgent help for severe or rapidly worsening symptoms.",
      "",
      `Anonymized summary length: ${summary.length} characters.`
    ].join("\n")
  } satisfies ExternalResult;
}
