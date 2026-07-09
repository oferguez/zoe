export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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

export type ApprovalExtraction = {
  beforeText: string;
  draftText: string;
};

// The agent's skill instructions ask for the literal marker "APPROVAL NEEDED:", but the model
// doesn't always follow that exactly (e.g. markdown-bolded "**APPROVAL NEEDED**" with no colon,
// seen in practice). Match loosely — optional markdown bold, optional colon, case-insensitive —
// rather than relying on the model reproducing an exact string every time.
const APPROVAL_MARKER_PATTERN = /\*{0,2}APPROVAL NEEDED\*{0,2}:?/i;

export function extractApproval(content: string): ApprovalExtraction | null {
  const match = content.match(APPROVAL_MARKER_PATTERN);
  if (!match || match.index === undefined) return null;

  const beforeText = content.slice(0, match.index).replace(/-{3,}\s*$/, "").trim();
  let draftText = content.slice(match.index + match[0].length).trim();

  // Drop a leading "---" divider line, and anything from a trailing "---" divider onward
  // (models often add follow-up commentary like "Does this work for you?" after one).
  draftText = draftText.replace(/^-{3,}\s*/, "");
  const trailingDivider = draftText.search(/\n-{3,}/);
  if (trailingDivider !== -1) draftText = draftText.slice(0, trailingDivider).trim();

  // Strip a blockquote/quote wrapper if the model presented the draft as a quoted line.
  draftText = draftText.replace(/^>\s*/gm, "").trim();
  draftText = draftText.replace(/^"([\s\S]*)"$/, "$1").trim();

  return { beforeText, draftText };
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
