"use client";

import Link from "next/link";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  CHAT_SESSION_ID_STORAGE_KEY,
  CHAT_TRANSCRIPT_STORAGE_KEY,
  type ChatMessage
} from "@/lib/clientFlow";
import { ChatMessageContent } from "@/components/medicalIntake/ChatMessageContent";
import { mockPositiveFibroFogQuestionnaire, mockUserProfile } from "@/lib/mocks";
import { buildRedactedProfile } from "@/lib/mocks/anonymizedSummaryMock";
import { buildQuestionnairePrompt } from "@/lib/questionnaire/buildQuestionnairePrompt";
import { evaluateFibroLogic } from "@/lib/questionnaire/fibroLogic";
import {
  readJson,
  readJsonArray,
  removeStorageItem,
  writeJson,
  writeJsonArray
} from "@/lib/services/browserStorage";
import { sendChatMessage } from "@/lib/services/chatService";

export default function PrivateChatPage() {
  const [sessionId, setSessionId] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const autoStartedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    let storedSessionId = readJson<string>(CHAT_SESSION_ID_STORAGE_KEY);
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID();
      writeJson(CHAT_SESSION_ID_STORAGE_KEY, storedSessionId);
    }
    setSessionId(storedSessionId);
    setMessages(readJsonArray<ChatMessage>(CHAT_TRANSCRIPT_STORAGE_KEY));
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (messages.length) writeJsonArray(CHAT_TRANSCRIPT_STORAGE_KEY, messages);
  }, [messages]);

  // TODO(ai-agent): mockPositiveFibroFogQuestionnaire stands in for the real draft/reviewItems
  // from the summary flow until that handoff is wired (see the TODO on the ExportAction in
  // src/app/summary/page.tsx). Swap this for the actual questionnaire answers once that's done.
  useEffect(() => {
    if (!hasHydrated || !sessionId || messages.length) return;
    if (autoStartedSessionRef.current === sessionId) return;
    autoStartedSessionRef.current = sessionId;

    // Privacy Guard stand-in: strip identifying profile fields before this ever leaves the
    // device. Without this, buildQuestionnairePrompt's "Patient profile:" line would ship the
    // mock user's name, email, phone, address, and NHS number straight to the cloud gateway.
    const sanitizedAnswers = {
      ...mockPositiveFibroFogQuestionnaire,
      profile: buildRedactedProfile(mockPositiveFibroFogQuestionnaire.profile)
    };
    const initialMessage = buildQuestionnairePrompt(sanitizedAnswers, evaluateFibroLogic(sanitizedAnswers));
    sendMessage(initialMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, sessionId, messages.length]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  async function sendMessage(content: string) {
    if (!sessionId || isSending) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content }]);
    setError("");
    setIsSending(true);

    try {
      const reply = await sendChatMessage(content, sessionId);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply.content,
          approvalDraft: reply.approvalDraft
        }
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong reaching eliza.");
    } finally {
      setIsSending(false);
    }
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessage("");
    sendMessage(trimmed);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function respondToApproval(messageId: string, decision: "approved" | "rejected") {
    setMessages((prev) =>
      prev.map((item) => (item.id === messageId ? { ...item, approvalResolved: true } : item))
    );
    sendMessage(decision === "approved" ? "Approved." : "Rejected.");
  }

  function startNewConversation() {
    const newSessionId = crypto.randomUUID();
    writeJson(CHAT_SESSION_ID_STORAGE_KEY, newSessionId);
    removeStorageItem(CHAT_TRANSCRIPT_STORAGE_KEY);
    setSessionId(newSessionId);
    setMessages([]);
    setError("");
  }

  return (
    <main className="min-h-dvh bg-paper px-5 py-8 text-ink md:px-10">
      <section className="mx-auto grid w-full max-w-3xl gap-8 py-4 md:py-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/summary"
              className="grid h-10 w-10 place-items-center text-2xl leading-none text-ink/60 transition hover:text-red-potion"
              aria-label="Back to summary"
            >
              ‹
            </Link>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cornflower-blue/12">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/75" />
            </span>
            <span className="text-sm font-black uppercase tracking-[0.22em] text-ink/55">
              eliza <span className="text-ink/25">·</span> private
            </span>
          </div>
          <div className="flex items-center gap-3">
            {messages.length ? (
              <button
                className="text-xs font-black uppercase tracking-[0.1em] text-ink/40 transition hover:text-ink"
                type="button"
                onClick={startNewConversation}
              >
                New conversation
              </button>
            ) : null}
            <div className="grid h-11 w-11 place-items-center rounded-full bg-cornflower-blue/12 text-lg font-black text-cornflower-blue">
              {mockUserProfile.preferredName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <h1 className="text-4xl font-black leading-[1.05] text-ink md:text-5xl">
          Hello, {mockUserProfile.preferredName}
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          <span className="flex flex-1 items-center gap-2 rounded-full bg-red-potion/10 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-red-potion">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-potion" aria-hidden="true" />
            Private conversation — not shared or posted anywhere
          </span>

          <div className="grid place-items-center gap-1 rounded-2xl border border-ink/10 bg-white px-4 py-2.5">
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-linen-white text-xs font-black text-ink/60">
              v1
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-royal-yellow" aria-hidden="true" />
            </span>
            <span className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-ink/40">eliza 1.0</span>
          </div>
        </div>

        {messages.length ? (
          <div className="grid gap-3">
            {messages.map((item) => (
              <div className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`} key={item.id}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-semibold leading-6 ${
                    item.role === "user" ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink"
                  }`}
                >
                  <ChatMessageContent content={item.content} />

                  {item.approvalDraft && !item.approvalResolved ? (
                    <div className="mt-3 grid gap-2 rounded-xl border border-royal-yellow/45 bg-royal-yellow/12 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-ink/50">
                        Draft for your approval
                      </p>
                      <div className="text-sm font-semibold leading-6 text-ink/85">
                        <ChatMessageContent content={item.approvalDraft} />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="rounded-full bg-ink px-4 py-1.5 text-xs font-black text-white transition hover:bg-ink/90"
                          type="button"
                          onClick={() => respondToApproval(item.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-black text-ink/70 transition hover:border-ink/30"
                          type="button"
                          onClick={() => respondToApproval(item.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/40">
                  eliza is thinking...
                </div>
              </div>
            ) : null}

            <div ref={threadEndRef} />
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-red-potion/20 bg-red-potion/10 px-4 py-3 text-sm font-semibold text-red-potion">
            {error}
          </p>
        ) : null}

        <form
          className="grid gap-4 rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-[0_22px_70px_rgba(40,45,69,0.07)] md:p-8"
          onSubmit={submitMessage}
          ref={formRef}
        >
          <textarea
            className="min-h-24 w-full resize-none border-none bg-transparent text-lg font-semibold text-ink placeholder:text-ink/35 focus:outline-none"
            placeholder="Ask your private AI anything..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <button
              className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 text-xl text-ink/50 transition hover:border-ink/25 hover:text-ink"
              type="button"
              aria-label="Attach a file"
            >
              +
            </button>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-cornflower-blue/10 px-3 py-1.5 text-xs font-black text-cornflower-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-cornflower-blue" aria-hidden="true" />
                Private
              </span>
              <button
                className="grid h-11 w-11 place-items-center rounded-full bg-ink text-lg text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/20"
                type="submit"
                disabled={!message.trim() || isSending}
                aria-label="Send message"
              >
                ↑
              </button>
            </div>
          </div>
        </form>

        <nav className="flex w-fit gap-1 rounded-full border border-ink/10 bg-white p-1" aria-label="Chat visibility">
          <span className="rounded-full bg-ink px-5 py-2 text-sm font-black text-white">Private</span>
          <Link
            href="/#community-examples"
            className="rounded-full px-5 py-2 text-sm font-black text-ink/50 transition hover:text-ink"
          >
            Community
          </Link>
        </nav>
      </section>
    </main>
  );
}
