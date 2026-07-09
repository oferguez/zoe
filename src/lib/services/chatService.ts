const APPROVAL_MARKER = "APPROVAL NEEDED:";

// See Doc/FRONTEND_INTEGRATION.md "The approval-flow convention" - the agent prefixes replies
// it isn't confident about with this literal marker, followed by a forum-post draft.
export function parseAgentReply(answer: string): { content: string; approvalDraft: string | null } {
  if (!answer.includes(APPROVAL_MARKER)) {
    return { content: answer.trim(), approvalDraft: null };
  }
  const [before, after] = answer.split(APPROVAL_MARKER);
  return {
    content: before.trim(),
    approvalDraft: after?.trim() || null
  };
}

export async function sendChatMessage(message: string, sessionId: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId })
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "The chat gateway returned an error.");
  }

  return parseAgentReply(data?.answer as string);
}
