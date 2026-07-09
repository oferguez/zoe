import type { UserProfile } from "@/lib/models/userProfile";

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "patient"
  );
}

export function buildReportFilename(userProfile: UserProfile, createdAt: string) {
  const namePart = slugify(userProfile.preferredName);
  const datePart = new Date(createdAt).toISOString().slice(0, 10);
  return `${namePart}-${datePart}-eliza-gp-summary.txt`;
}

export function downloadTextReport({
  filename,
  text
}: {
  filename: string;
  text: string;
}) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
