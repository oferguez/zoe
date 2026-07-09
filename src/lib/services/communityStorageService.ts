import { COMMUNITY_POSTS_STORAGE_KEY, type CommunityPost } from "@/lib/clientFlow";
import { readJson, removeStorageItem, writeJson } from "@/lib/services/browserStorage";

function isCommunityPost(value: unknown): value is CommunityPost {
  if (!value || typeof value !== "object") return false;
  const post = value as Partial<CommunityPost>;
  return (
    typeof post.id === "string" &&
    typeof post.author === "string" &&
    typeof post.title === "string" &&
    typeof post.timeAgo === "string" &&
    typeof post.status === "string" &&
    typeof post.durationLabel === "string" &&
    typeof post.summary === "string" &&
    typeof post.question === "string" &&
    typeof post.aiGuidance === "object" &&
    typeof post.authorProfile === "object" &&
    Array.isArray(post.tags) &&
    Array.isArray(post.triggerLabels) &&
    Array.isArray(post.comments)
  );
}

function isMalformedSavedPost(post: CommunityPost) {
  const summary = post.summary.toLowerCase();
  return (
    post.summary.length > 900 ||
    summary.includes("patient profile:") ||
    summary.includes("original generated note:") ||
    summary.includes("mobile number") ||
    summary.includes("email:")
  );
}

export function readSavedCommunityPosts() {
  const storedPosts = readJson<unknown>(COMMUNITY_POSTS_STORAGE_KEY);
  if (!storedPosts) return [];

  const cleanedPosts = Array.isArray(storedPosts)
    ? storedPosts.filter(isCommunityPost).filter((post) => !isMalformedSavedPost(post))
    : [];

  if (cleanedPosts.length) {
    writeJson(COMMUNITY_POSTS_STORAGE_KEY, cleanedPosts);
  } else {
    removeStorageItem(COMMUNITY_POSTS_STORAGE_KEY);
  }

  return cleanedPosts;
}
