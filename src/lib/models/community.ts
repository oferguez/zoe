export type CommunityActorRole = "patient" | "clinical expert" | "openai generated" | "community";

export type CommunityActor = {
  id: string;
  displayName: string;
  role: CommunityActorRole;
  avatarInitial: string;
  location?: string;
  ageRange?: string;
};

export type CommunityComment = {
  id: string;
  author: string;
  authorRole: CommunityActorRole;
  role: "clinical expert" | "openai generated" | "community";
  body: string;
  createdAtLabel: string;
};

export type CommunityAiGuidanceResource = {
  id: string;
  label: string;
  source: string;
  href: string;
};

export type CommunityAiGuidanceAction = {
  id: string;
  icon: "pace" | "sleep" | "movement" | "hydration" | "support" | "urgent";
  label: string;
  href?: string;
};

export type CommunityAiGuidance = {
  id: string;
  disclaimer: string;
  basedOn: {
    title: string;
    body: string;
  };
  discussWithGp: string[];
  selfCare: CommunityAiGuidanceAction[];
  trustedResources: CommunityAiGuidanceResource[];
  seeAllResourcesHref: string;
};

export type CommunityPostStatus =
  | "awaiting help"
  | "ai guidance ready"
  | "clinician replied"
  | "needs more context";

export type CommunityPost = {
  id: string;
  author: string;
  authorProfile: CommunityActor;
  timeAgo: string;
  status: CommunityPostStatus;
  title: string;
  summary: string;
  tags: string[];
  durationLabel: string;
  triggerLabels: string[];
  question: string;
  aiGuidance: CommunityAiGuidance;
  comments: CommunityComment[];
};

export type CommunityDraftSource = {
  id: string;
  privacy: "public" | "private";
  sourceQuestion: string;
  summary: string;
};

export const anonymousPatient: CommunityActor = {
  id: "actor-anonymous-patient",
  displayName: "Anonymous member",
  role: "patient",
  avatarInitial: "A",
  location: "United Kingdom",
  ageRange: "40-49"
};
