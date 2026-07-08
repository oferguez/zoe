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

export type HistoryItem = {
  id: string;
  owner: "you" | "other";
  privacy: PrivacyMode;
  question: string;
  resultType: "quick" | "external";
  answer: string;
};

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

export const mockHistory: HistoryItem[] = [
  {
    id: "you-1",
    owner: "you",
    privacy: "private",
    question: "Can dehydration cause lightheadedness after a stomach bug?",
    resultType: "quick",
    answer:
      "General answer: dehydration can cause lightheadedness. Seek care for fainting, confusion, chest pain, or inability to keep fluids down."
  },
  {
    id: "you-2",
    owner: "you",
    privacy: "public",
    question: "What should I ask my clinician after routine blood work?",
    resultType: "external",
    answer:
      "Ask what values are outside range, whether they match symptoms, and when repeat testing is appropriate."
  },
  {
    id: "other-1",
    owner: "other",
    privacy: "public",
    question: "What are common non-emergency reasons for mild fatigue?",
    resultType: "quick",
    answer:
      "Public example: sleep, stress, hydration, nutrition, and recent illness can contribute. Persistent symptoms should be discussed with a clinician."
  },
  {
    id: "other-2",
    owner: "other",
    privacy: "public",
    question: "How should I prepare questions before a follow-up visit?",
    resultType: "external",
    answer:
      "Public example: bring medications, recent results, symptom timeline, and the top three concerns you want addressed."
  }
];

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function isTextLike(file: File) {
  const lowerName = file.name.toLowerCase();
  return (
    file.type.startsWith("text/") ||
    ["application/json", "application/xml", "application/csv"].includes(file.type) ||
    [".txt", ".md", ".csv", ".json", ".xml", ".log"].some((suffix) =>
      lowerName.endsWith(suffix)
    )
  );
}

export async function readMedicalDocuments(files: File[]) {
  const decoder = new TextDecoder("utf-8", { fatal: false });

  return Promise.all(
    files.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      return {
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        extractedText: isTextLike(file)
          ? decoder.decode(bytes).slice(0, 5000)
          : "[Binary document attached. Text extraction is not configured in this frontend mock.]",
        contentBase64: bytesToBase64(bytes)
      };
    })
  );
}

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
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(ciphertext),
      documentCount: payload.documents.length,
      payloadBytes: encoded.byteLength
    }
  };
}

async function decryptForMockService(envelope: EncryptedEnvelope, key: CryptoKey) {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(envelope.iv) },
    key,
    base64ToBytes(envelope.ciphertext)
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

export function createHistoryItem(args: {
  question: string;
  privacy: PrivacyMode;
  resultType: HistoryItem["resultType"];
  answer: string;
}) {
  return {
    id: `you-${crypto.randomUUID()}`,
    owner: "you" as const,
    privacy: args.privacy,
    question: args.question,
    resultType: args.resultType,
    answer: args.answer
  };
}
