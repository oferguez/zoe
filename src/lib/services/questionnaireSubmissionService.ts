import {
  SUMMARY_DRAFT_STORAGE_KEY,
  analyzeEncryptedQuestion,
  encryptForAnalysisService,
  readMedicalDocuments,
  type PrivacyMode,
  type SummaryDraft
} from "@/lib/clientFlow";
import { writeJson } from "@/lib/services/browserStorage";

// TODO(backend): this is where the questionnaire hands off on submit. Real flow should be:
// readMedicalDocuments -> local Privacy Guard redaction -> POST /api/analyze (sanitized context
// only) -> OpenAI -> structured ElizaReport. Right now encryptForAnalysisService/
// analyzeEncryptedQuestion in analysisService.ts fake that with client-side crypto and a regex
// redactor, no network call happens. Wire the real analysisService.ts (see Doc/toDo.md) here.
export async function createSummaryDraftFromQuestion({
  question,
  privacy,
  files
}: {
  question: string;
  privacy: PrivacyMode;
  files: File[];
}) {
  const documents = await readMedicalDocuments(files);
  const encrypted = await encryptForAnalysisService({
    question,
    privacy,
    documents
  });
  const serviceResponse = await analyzeEncryptedQuestion(encrypted.envelope, encrypted.key);
  const summary = serviceResponse.kind === "external_summary" ? serviceResponse.summary : serviceResponse.answer;

  const draft: SummaryDraft = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    privacy,
    sourceQuestion: question,
    summary,
    redactions: serviceResponse.kind === "external_summary" ? serviceResponse.redactions : [],
    trace: serviceResponse.trace
  };

  writeJson(SUMMARY_DRAFT_STORAGE_KEY, draft);
  return draft;
}

export function describeFiles(files: File[]) {
  if (!files.length) return "No documents selected";
  return files.map((file) => `${file.name} (${Math.ceil(file.size / 1024)} KB)`).join(", ");
}
