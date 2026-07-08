import { getAppConfig, type LlmProvider } from "./config";
import { type UploadedDocument, documentPromptExcerpt } from "./documents";

export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export type LargeModelInput = {
  approvedQuestion: string;
  anonymizedDocuments: Array<{
    label: string;
    type: string;
    size: number;
    text: string;
  }>;
};

export type SmallModelRoute = {
  status: "needs_documents" | "local_answer" | "pending_approval";
  rationale?: string;
  requestedDocuments?: string[];
};

async function chatCompletion(args: {
  apiUrl: string;
  apiKey?: string;
  model: string;
  messages: ChatMessage[];
}) {
  if (!args.apiKey) {
    throw new Error("LLM provider is configured but its API key is missing.");
  }

  const response = await fetch(args.apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${args.apiKey}`
    },
    body: JSON.stringify({
      model: args.model,
      messages: args.messages,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${text.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return payload.choices?.[0]?.message?.content?.trim() || "No answer returned.";
}

function parseJsonObject(input: string) {
  const trimmed = input.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
}

export async function smallModelRoute(
  question: string,
  documents: UploadedDocument[]
): Promise<SmallModelRoute | null> {
  const config = getAppConfig();
  if (config.smallLlm.provider !== "openai-compatible" || !config.smallLlm.apiKey) {
    return null;
  }

  const documentSummary = documents.length
    ? documents
        .map(
          (document, index) =>
            `${index + 1}. ${document.name}, ${document.type}, ${document.size} bytes, text_extracted=${Boolean(document.text)}`
        )
        .join("\n")
    : "No documents attached.";

  const content = await chatCompletion({
    apiUrl: config.smallLlm.apiUrl,
    apiKey: config.smallLlm.apiKey,
    model: config.smallLlm.model,
    messages: [
      {
        role: "system",
        content:
          "Classify the intake route. Return JSON only: {\"status\":\"needs_documents|local_answer|pending_approval\",\"rationale\":\"short reason\",\"requestedDocuments\":[\"optional\"]}. Use needs_documents when supporting files are needed before a safe answer. Use local_answer only for low-risk general questions. Use pending_approval when external LLM review should be user-approved."
      },
      {
        role: "user",
        content: `Question:\n${question}\n\nDocuments:\n${documentSummary}`
      }
    ]
  });

  const parsed = parseJsonObject(content);
  if (
    parsed?.status === "needs_documents" ||
    parsed?.status === "local_answer" ||
    parsed?.status === "pending_approval"
  ) {
    return {
      status: parsed.status,
      rationale: typeof parsed.rationale === "string" ? parsed.rationale : undefined,
      requestedDocuments: Array.isArray(parsed.requestedDocuments)
        ? parsed.requestedDocuments.filter((item): item is string => typeof item === "string")
        : undefined
    };
  }

  return null;
}

export async function localAnswer(question: string) {
  const config = getAppConfig();
  if (config.smallLlm.provider === "openai-compatible" && config.smallLlm.apiKey) {
    return chatCompletion({
      apiUrl: config.smallLlm.apiUrl,
      apiKey: config.smallLlm.apiKey,
      model: config.smallLlm.model,
      messages: [
        {
          role: "system",
          content:
            "Answer only low-risk general questions. Do not diagnose, prescribe, or interpret personal medical results. If clinical judgment is needed, say escalation is required."
        },
        { role: "user", content: question }
      ]
    });
  }

  return [
    "This looks suitable for a local, general response.",
    "",
    "I can answer at a high level, but I cannot diagnose, prescribe, or interpret personal medical results. If this involves symptoms, treatment choices, medication dosing, pregnancy, emergency signs, or lab/imaging results, use the escalation path and include the relevant documents.",
    "",
    `Question received: ${question}`
  ].join("\n");
}

export async function largeModelAnswer(input: LargeModelInput) {
  const config = getAppConfig();
  if (config.largeLlm.provider === "openai-compatible") {
    const documentBlock = input.anonymizedDocuments
      .map(
        (document) =>
          `Document: ${document.label}\nType: ${document.type}\nSize: ${document.size} bytes\n${document.text}`
      )
      .join("\n\n---\n\n");

    return chatCompletion({
      apiUrl: config.largeLlm.apiUrl,
      apiKey: config.largeLlm.apiKey,
      model: config.largeLlm.model,
      messages: [
        {
          role: "system",
          content:
            "You answer using the anonymized question and anonymized document excerpts. State uncertainty clearly. For medical topics, provide informational guidance and recommend professional care for diagnosis or treatment."
        },
        {
          role: "user",
          content: `${input.approvedQuestion}\n\nAnonymized documents:\n${documentBlock || "No extracted document text."}`
        }
      ]
    });
  }

  return [
    "Mock external LLM answer",
    "",
    "The approval and anonymization flow completed. Configure LARGE_LLM_PROVIDER=openai-compatible with an API key and model to send the approved anonymized package to a real provider.",
    "",
    `Approved prompt length: ${input.approvedQuestion.length} characters`,
    `Anonymized documents: ${input.anonymizedDocuments.length}`
  ].join("\n");
}

export function composeExternalQuestion(question: string, documents: UploadedDocument[]) {
  const documentContext = documents.length
    ? documents
        .map((document, index) => {
          return `Document ${index + 1}: ${document.name} (${document.type}, ${document.size} bytes)\n${documentPromptExcerpt(document)}`;
        })
        .join("\n\n")
    : "No documents attached.";

  return [
    "Please review the user's question and the available document context.",
    "Provide a concise answer, list any assumptions, and call out when a clinician or domain expert should be consulted.",
    "",
    `User question:\n${question}`,
    "",
    `Document context:\n${documentContext}`
  ].join("\n");
}

export function isExternalProvider(provider: LlmProvider) {
  return provider === "openai-compatible";
}
