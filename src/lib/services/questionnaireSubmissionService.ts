import {
  SUMMARY_DRAFT_STORAGE_KEY,
  analyzeEncryptedQuestion,
  encryptForAnalysisService,
  readMedicalDocuments,
  type PrivacyMode,
  type SummaryDraft
} from "@/lib/clientFlow";
import { writeJson } from "@/lib/services/browserStorage";

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
