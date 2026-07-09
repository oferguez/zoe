export const SUMMARY_DRAFT_STORAGE_KEY = "fibrocare.summaryDraft";
export const PRIVATE_SUMMARIES_STORAGE_KEY = "fibrocare.privateSummaries";
export const COMMUNITY_POSTS_STORAGE_KEY = "fibrocare.communityPosts";
export const QUESTIONNAIRE_STORAGE_KEY = "fibrocare.questionnaireAnswers";
export const CHAT_SESSION_ID_STORAGE_KEY = "fibrocare.chatSessionId";
export const CHAT_TRANSCRIPT_STORAGE_KEY = "fibrocare.chatTranscript";

export * from "./models/clientFlow";
export * from "./models/chat";
export * from "./questionnaire/fibroLogic";
export * from "./mocks";
export type {
  CommunityActor,
  CommunityActorRole,
  CommunityAiGuidance,
  CommunityAiGuidanceAction,
  CommunityAiGuidanceResource,
  CommunityComment,
  CommunityDraftSource,
  CommunityPost,
  CommunityPostStatus
} from "./models/community";
export {
  createCommunityPostFromDraft,
  createFibroPatternGuidance,
  createGeneralPainGuidance,
  createUnclearPatternGuidance
} from "./services/communityService";
export {
  analyzeEncryptedQuestion,
  encryptForAnalysisService,
  sendToExternalTargets
} from "./services/analysisService";
export { readMedicalDocuments } from "./services/documentService";
