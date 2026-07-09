export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export const APPROVAL_MARKER = "APPROVAL NEEDED:";

const SESSION_STORAGE_KEY = "eliza.privateChatSessionId";

// Shared across the /private chat and any other feature (e.g. "Save to vault") that talks to
// the agent, so they all land in the same OpenClaw session/memory rather than fragmenting it.
export function getChatSessionId(): string {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

export function extractApprovalDraft(content: string): string | null {
  if (!content.includes(APPROVAL_MARKER)) return null;
  return content.split(APPROVAL_MARKER)[1]?.trim() ?? "";
}

export async function sendChatMessage(messages: ChatMessage[], sessionId: string): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openclaw/default",
      messages,
      stream: false,
      user: sessionId
    })
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content;
  if (typeof answer !== "string") {
    throw new Error("Unexpected response shape from /api/chat");
  }
  return answer;
}
