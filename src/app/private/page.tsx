"use client";

import { useEffect, useRef, useState } from "react";
import {
  COMMUNITY_POSTS_STORAGE_KEY,
  createCommunityPostFromDraft,
  type CommunityPost
} from "@/lib/clientFlow";
import { readJsonArray, writeJsonArray } from "@/lib/services/browserStorage";
import {
  extractApproval,
  getChatSessionId,
  sendChatMessage,
  type ChatMessage
} from "@/lib/services/chatService";
import { ApprovalPrompt } from "@/components/chat/ApprovalPrompt";

const TRANSCRIPT_STORAGE_KEY = "eliza.privateChatTranscript";

export default function PrivateZonePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resolvedApprovals, setResolvedApprovals] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const sessionId = useRef<string>("");

  // Restore the session id and visible transcript on mount — without this, switching tabs
  // (which unmounts this page) wiped the chat history even though the agent's own memory
  // (keyed by sessionId) persisted fine server-side the whole time.
  useEffect(() => {
    sessionId.current = getChatSessionId();
    setMessages(readJsonArray<ChatMessage>(TRANSCRIPT_STORAGE_KEY));
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    writeJsonArray(TRANSCRIPT_STORAGE_KEY, messages);
  }, [messages, hasHydrated]);

  async function send(text: string) {
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setIsSending(true);
    try {
      const answer = await sendChatMessage(nextMessages, sessionId.current);
      setMessages([...nextMessages, { role: "assistant", content: answer }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Sorry, I couldn't reach eliza just now. Please try again." }
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    void send(text);
  }

  function handleApproval(messageIndex: number, draftText: string, decision: "approve" | "reject") {
    setResolvedApprovals((prev) => new Set(prev).add(messageIndex));

    if (decision === "approve") {
      const post: CommunityPost = createCommunityPostFromDraft({
        id: crypto.randomUUID(),
        privacy: "public",
        sourceQuestion: draftText,
        summary: draftText
      });
      const existingPosts = readJsonArray<CommunityPost>(COMMUNITY_POSTS_STORAGE_KEY);
      writeJsonArray(COMMUNITY_POSTS_STORAGE_KEY, [post, ...existingPosts]);
      setStatus("Posted to the community feed.");
    } else {
      setStatus("");
    }

    void send(decision === "approve" ? "Approved." : "Rejected.");
  }

  return (
    <main className="min-h-dvh bg-fog-gray/20 px-4 py-6 text-ink md:px-8">
      <section className="mx-auto grid min-h-[calc(100dvh-9rem)] w-full max-w-[720px] gap-6 rounded-[1.75rem] bg-white px-6 py-6 shadow-[0_24px_80px_rgba(40,45,69,0.08)] md:px-10">
        <div className="grid gap-1">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-magenta-pop">
            Private zone
          </p>
          <h1 className="text-2xl font-black text-ink md:text-3xl">Talk to eliza</h1>
          <p className="text-sm font-medium text-ink/60">
            This conversation stays private. If eliza can&apos;t confidently answer, it will draft a
            question and ask your approval before anything is shared with the community.
          </p>
        </div>

        <div className="grid gap-4 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="rounded-[1.25rem] bg-soft-linen px-5 py-4 text-sm font-semibold text-ink/60">
              Hello. Ask a health question, or describe something you&apos;d like eliza to remember.
            </p>
          ) : null}

          {messages.map((message, index) => {
            const approval = message.role === "assistant" ? extractApproval(message.content) : null;
            const isLastMessage = index === messages.length - 1;

            return (
              <div
                key={index}
                className={`max-w-[85%] rounded-[1.25rem] px-5 py-4 text-sm font-semibold leading-6 ${
                  message.role === "user"
                    ? "ml-auto bg-ink text-white"
                    : "bg-soft-linen text-ink"
                }`}
              >
                {approval !== null ? approval.beforeText : message.content}
                {approval !== null && isLastMessage && !resolvedApprovals.has(index) ? (
                  <div className="mt-3">
                    <ApprovalPrompt
                      draftText={approval.draftText}
                      disabled={isSending}
                      onApprove={() => handleApproval(index, approval.draftText, "approve")}
                      onReject={() => handleApproval(index, approval.draftText, "reject")}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}

          {isSending ? (
            <p className="rounded-[1.25rem] bg-soft-linen px-5 py-4 text-sm font-semibold text-ink/45">
              eliza is thinking…
            </p>
          ) : null}
        </div>

        {status ? (
          <p className="rounded-full bg-cornflower-blue/10 px-4 py-2 text-sm font-black text-ink/70">
            {status}
          </p>
        ) : null}

        <form className="flex items-center gap-3" onSubmit={handleSubmit}>
          <input
            className="min-h-12 flex-1 rounded-full border-2 border-ink/10 bg-white px-5 text-sm font-semibold text-ink outline-none focus:border-cornflower-blue/40"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask eliza a question…"
            disabled={isSending}
          />
          <button
            type="submit"
            className="min-h-12 rounded-full bg-ink px-6 text-sm font-black text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSending || !input.trim()}
          >
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
