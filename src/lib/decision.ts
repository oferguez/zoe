import { getAppConfig } from "./config";
import { composeExternalQuestion, localAnswer, smallModelRoute } from "./llm";
import { type UploadedDocument } from "./documents";

export type DecisionOutcome =
  | {
      status: "needs_documents";
      message: string;
      requestedDocuments: string[];
      decisionTrace: string[];
    }
  | {
      status: "local_answer";
      answer: string;
      decisionTrace: string[];
    }
  | {
      status: "pending_approval";
      composedQuestion: string;
      rationale: string;
      decisionTrace: string[];
    };

type DecisionInput = {
  question: string;
  documents: UploadedDocument[];
};

function containsAny(input: string, terms: string[]) {
  const lower = input.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function looksPersonalMedical(question: string) {
  const lower = question.toLowerCase();
  return (
    /\b(i|my|me|mine|we|our|child|mother|father|wife|husband|partner)\b/.test(lower) &&
    /\b(pain|symptom|diagnos|dose|medication|medicine|result|lab|blood|scan|report|treatment|doctor|hospital)\b/.test(lower)
  );
}

function requestedDocuments() {
  return [
    "Recent lab or imaging reports",
    "Medication and dosage list",
    "Relevant discharge summaries or clinician notes"
  ];
}

async function heuristicDecision(input: DecisionInput): Promise<DecisionOutcome> {
  const config = getAppConfig();
  const trace: string[] = ["decision_provider=heuristic"];
  const hasDocuments = input.documents.length > 0;
  const highRisk = containsAny(input.question, config.highRiskKeywords) || looksPersonalMedical(input.question);
  const documentsWouldHelp = containsAny(input.question, config.documentRequestKeywords);

  if (highRisk) trace.push("high_risk_or_personal_medical=true");
  if (documentsWouldHelp) trace.push("document_context_helpful=true");
  if (hasDocuments) trace.push(`documents=${input.documents.length}`);

  if (!hasDocuments && (documentsWouldHelp || highRisk)) {
    return {
      status: "needs_documents",
      message:
        "This question would be safer with supporting documents before answering or escalating.",
      requestedDocuments: requestedDocuments(),
      decisionTrace: trace
    };
  }

  if (!highRisk && input.question.length <= config.localAnswerMaxChars && !hasDocuments) {
    trace.push("local_answer_threshold=true");
    return {
      status: "local_answer",
      answer: await localAnswer(input.question),
      decisionTrace: trace
    };
  }

  trace.push("external_approval_required=true");
  return {
    status: "pending_approval",
    composedQuestion: composeExternalQuestion(input.question, input.documents),
    rationale:
      "The question appears to need document-aware or higher-capability reasoning. The user must approve the outgoing prompt before any external relay.",
    decisionTrace: trace
  };
}

async function openAiCompatibleDecision(input: DecisionInput): Promise<DecisionOutcome> {
  const modelRoute = await smallModelRoute(input.question, input.documents);
  if (modelRoute) {
    const trace = [
      "decision_provider=openai-compatible",
      `small_model_route=${modelRoute.status}`
    ];

    if (modelRoute.status === "needs_documents") {
      return {
        status: "needs_documents",
        message: modelRoute.rationale || "The small routing model requested more context.",
        requestedDocuments: modelRoute.requestedDocuments?.length
          ? modelRoute.requestedDocuments
          : requestedDocuments(),
        decisionTrace: trace
      };
    }

    if (modelRoute.status === "local_answer") {
      return {
        status: "local_answer",
        answer: await localAnswer(input.question),
        decisionTrace: trace
      };
    }

    return {
      status: "pending_approval",
      composedQuestion: composeExternalQuestion(input.question, input.documents),
      rationale:
        modelRoute.rationale ||
        "The small routing model selected external review with user approval.",
      decisionTrace: trace
    };
  }

  const fallback = await heuristicDecision(input);
  return {
    ...fallback,
    decisionTrace: ["decision_provider=openai-compatible-unavailable", ...fallback.decisionTrace]
  };
}

export async function decide(input: DecisionInput): Promise<DecisionOutcome> {
  const config = getAppConfig();
  if (config.decisionProvider === "openai-compatible") {
    return openAiCompatibleDecision(input);
  }

  return heuristicDecision(input);
}
