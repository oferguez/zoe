"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  COMMUNITY_POSTS_STORAGE_KEY,
  SUMMARY_DRAFT_STORAGE_KEY,
  createCommunityPostFromDraft,
  type CommunityPost,
  type SummaryDraft
} from "@/lib/clientFlow";
import type { SummaryReviewItem } from "@/lib/models";
import { mockUserProfile } from "@/lib/mocks";
import {
  readJson,
  readJsonArray,
  writeJson,
  writeJsonArray
} from "@/lib/services/browserStorage";
import {
  buildGpSummaryReport,
  buildKeptSummary,
  buildSummaryReviewItems
} from "@/lib/services/summaryService";
import { buildReportFilename, downloadTextReport } from "@/lib/services/reportDownloadService";
import { buildPublicSummaryDto } from "@/lib/services/dtoSummaryService";
import { CommunityPostCard } from "@/components/medicalIntake/CommunityPostCard";
import { getChatSessionId, sendChatMessage } from "@/lib/services/chatService";

export default function SummaryPage() {
  const [draft, setDraft] = useState<SummaryDraft | null>(null);
  const [reviewItems, setReviewItems] = useState<SummaryReviewItem[]>([]);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<"review" | "export">("review");
  const [isSavingToVault, setIsSavingToVault] = useState(false);

  useEffect(() => {
    const stored = readJson<SummaryDraft>(SUMMARY_DRAFT_STORAGE_KEY);
    if (!stored) return;
    setDraft(stored);
    setReviewItems(buildSummaryReviewItems(stored));
  }, []);

  const keptSummary = useMemo(() => {
    if (!draft) return "";
    return buildKeptSummary(reviewItems, draft);
  }, [draft, reviewItems]);

  const publicSummary = useMemo(() => {
    if (!draft) return null;
    return buildPublicSummaryDto(draft, mockUserProfile);
  }, [draft]);

  function persistReviewedDraft() {
    if (!draft) return null;
    const updated = {
      ...draft,
      summary: keptSummary
    };
    writeJson(SUMMARY_DRAFT_STORAGE_KEY, updated);
    setDraft(updated);
    return updated;
  }

  function publishToCommunity() {
    const updated = persistReviewedDraft();
    if (!updated) return;
    const communityPosts = readJsonArray<CommunityPost>(COMMUNITY_POSTS_STORAGE_KEY);
    writeJsonArray(COMMUNITY_POSTS_STORAGE_KEY, [createCommunityPostFromDraft(updated), ...communityPosts]);
    setStatus("Shared anonymously to the local community feed.");
  }

  function downloadReport() {
    const updated = persistReviewedDraft();
    if (!updated) return;
    const report = buildGpSummaryReport(updated, reviewItems, mockUserProfile);
    downloadTextReport({
      filename: buildReportFilename(mockUserProfile, updated.createdAt),
      text: report
    });
    setStatus("Downloaded report.");
  }

  async function saveToVault() {
    const updated = persistReviewedDraft();
    if (!updated) return;
    const report = buildGpSummaryReport(updated, reviewItems, mockUserProfile);
    setIsSavingToVault(true);
    try {
      await sendChatMessage(
        [
          {
            role: "user",
            content: `Please store this in my medical records vault:\n\n${report}`
          }
        ],
        getChatSessionId()
      );
      setStatus("Sent to eliza to save in your private vault.");
    } catch {
      setStatus("Couldn't reach eliza to save this. Please try again.");
    } finally {
      setIsSavingToVault(false);
    }
  }

  function removeItem(id: string) {
    setReviewItems((items) => items.filter((item) => item.id !== id));
  }

  function findItem(id: string) {
    return reviewItems.find((item) => item.id === id) || null;
  }

  if (!draft) {
    return (
      <main className="grid min-h-dvh place-items-center bg-white px-5 text-ink">
        <section className="grid max-w-lg gap-5 rounded-[1.5rem] border border-ink/10 bg-white p-8 shadow-[0_24px_80px_rgba(40,45,69,0.08)]">
          <h1 className="text-3xl font-black">No summary yet</h1>
          <p className="text-ink/65">
            Complete the questionnaire first so eliza can generate a draft summary.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 font-black text-white"
          >
            Start questionnaire
          </Link>
        </section>
      </main>
    );
  }

  const highlightItem = findItem("symptoms") || findItem("summary");
  const durationItem = findItem("duration");
  const triggerItem = findItem("trigger");
  const helpsItem = findItem("helps");
  const urgentItem = findItem("urgent");
  const groupedIds = new Set(
    [highlightItem?.id, durationItem?.id, triggerItem?.id, helpsItem?.id, urgentItem?.id].filter(Boolean)
  );
  const detailItems = reviewItems.filter((item) => !groupedIds.has(item.id));

  return (
    <main className="min-h-dvh bg-white px-5 py-6 text-ink md:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-16">
        {mode === "review" ? (
          <section className="mx-auto grid w-full max-w-3xl gap-9">
            <div className="grid gap-4">
              <span className="w-fit rounded-full bg-cornflower-blue/10 px-4 py-2 text-sm font-black text-ink">
                Private
              </span>
              <h1 className="text-4xl font-black leading-[1.05] text-ink md:text-5xl">
                Here&apos;s what I&apos;ve picked out
              </h1>
              <p className="max-w-2xl text-lg font-semibold leading-8 text-ink/60">
                Remove anything that doesn&apos;t look right. Only what you keep from here gets
                used for sharing, saving, or download.
              </p>
            </div>

            {reviewItems.length ? (
              <article className="rounded-3xl border border-cornflower-blue/12 bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,45,69,0.06)] md:p-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-cornflower-blue/12 text-xl font-black text-cornflower-blue">
                      {mockUserProfile.preferredName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm text-ink/60">
                      <p className="font-black text-ink">{mockUserProfile.preferredName}</p>
                      <p>
                        {mockUserProfile.ageRange} • {mockUserProfile.sexOrGender}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-cornflower-blue/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cornflower-blue">
                    Draft summary
                  </span>
                </div>

                {highlightItem ? (
                  <ReviewHighlight label="Summary" item={highlightItem} onRemove={removeItem} />
                ) : null}

                {durationItem || triggerItem || helpsItem ? (
                  <div className="mb-6 grid gap-5 border-b border-ink/10 pb-6 md:grid-cols-3">
                    {durationItem ? (
                      <ReviewField label="Duration" item={durationItem} onRemove={removeItem} />
                    ) : null}
                    {triggerItem ? (
                      <ReviewField label="Triggers noticed" item={triggerItem} onRemove={removeItem} />
                    ) : null}
                    {helpsItem ? (
                      <ReviewField label="What helps" item={helpsItem} onRemove={removeItem} />
                    ) : null}
                  </div>
                ) : null}

                {urgentItem ? (
                  <ReviewHighlight
                    label="Safety note"
                    item={urgentItem}
                    onRemove={removeItem}
                    tone="danger"
                  />
                ) : null}

                {detailItems.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {detailItems.map((item) => (
                      <ReviewDetail key={item.id} item={item} onRemove={removeItem} />
                    ))}
                  </div>
                ) : null}
              </article>
            ) : (
              <p className="rounded-3xl border border-ink/10 bg-soft-linen p-6 text-base font-semibold text-ink/60">
                You removed everything from this draft. Go back to the questionnaire to add details.
              </p>
            )}

            <p className="max-w-2xl text-sm font-semibold leading-7 text-ink/45">
              by tapping the continute button. Your info will be process internally to generate a GP-ready summary or post. You can always come back to this page to edit what you keep.
            </p>
            <button
              className="min-h-16 rounded-[1.1rem] bg-ink px-6 text-lg font-black text-white transition hover:bg-ink/90 focus:outline-none focus:ring-4 focus:ring-cornflower-blue/20 disabled:cursor-not-allowed disabled:bg-ink/20"
              type="button"
              onClick={() => setMode("export")}
              disabled={!reviewItems.length}
            >
              Looks right, continue
            </button>

            <Link
              href="/questionnaire"
              className="justify-self-center text-sm font-black text-ink/45 transition hover:text-ink"
            >
              Edit questionnaire answers
            </Link>
          </section>
        ) : (
          <section className="mx-auto grid w-full max-w-4xl gap-12">
            <div className="grid gap-4">
              <span className="w-fit rounded-full bg-cornflower-blue/10 px-4 py-2 text-sm font-black text-ink">
                Private
              </span>
              <h1 className="text-4xl font-black leading-[1.05] text-ink md:text-5xl">
                What would you like to do with this?
              </h1>
              <p className="max-w-3xl text-lg font-semibold leading-8 text-ink/60">
                You&apos;re always in control of where this goes. Pick one, or come back to this
                anytime.
              </p>
            </div>

            {publicSummary ? (
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cornflower-blue">
                    Preview — how this post will look
                  </p>
                  <span className="rounded-full bg-red-potion/10 px-3 py-1 text-xs font-black text-red-potion">
                    Private data removed
                  </span>
                </div>

                <CommunityPostCard post={publicSummary.post} interactive={false} />

                {publicSummary.redactedFields.length ? (
                  <div className="grid gap-2 rounded-[1.5rem] border-2 border-cornflower-blue/15 bg-linen-white/70 p-6 md:p-8">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/45">
                      Removed before this leaves your device
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {publicSummary.redactedFields.map((field) => (
                        <span
                          key={field.field}
                          className="rounded-full border border-red-potion/20 bg-white px-3 py-1 text-xs font-bold text-ink/60"
                        >
                          {field.field}:{" "}
                          <span className="text-red-potion line-through decoration-2">
                            {field.originalValue}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-5">
              <ExportAction
                title="Share anonymously with the community"
                body="No name attached. Visible to community members, specialists, and community AI agents."
                buttonLabel="Share"
                marker="three"
                onClick={publishToCommunity}
              />
              
              <ExportAction
                title="Download a report"
                body="Formatted to bring along to a GP or specialist appointment."
                buttonLabel="Download"
                marker="arrow"
                onClick={downloadReport}
              />

              <ExportAction
                title="Save to vault"
                body="Sends this report to eliza to keep, encrypted, in your private medical records vault. Nothing is shared."
                buttonLabel={isSavingToVault ? "Saving…" : "Save"}
                marker="lock"
                onClick={saveToVault}
                disabled={isSavingToVault}
              />

            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                className="text-sm font-black text-ink/45 transition hover:text-ink"
                type="button"
                onClick={() => setMode("review")}
              >
                Back to review
              </button>
              {status ? (
                <p className="rounded-full bg-cornflower-blue/10 px-4 py-2 text-sm font-black text-ink/65">
                  {status}
                </p>
              ) : null}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="text-lg leading-none text-ink/30 transition hover:text-red-potion"
      type="button"
      onClick={onClick}
      aria-label={`Remove ${label}`}
    >
      ×
    </button>
  );
}

function ReviewHighlight({
  label,
  item,
  onRemove,
  tone = "neutral"
}: {
  label: string;
  item: SummaryReviewItem;
  onRemove: (id: string) => void;
  tone?: "neutral" | "danger";
}) {
  const toneClasses =
    tone === "danger" ? "border border-red-potion/30 bg-red-potion/10" : "bg-linen-white/75";
  const titleClasses = tone === "danger" ? "text-red-potion" : "text-ink";

  return (
    <section className={`mb-6 rounded-2xl p-5 ${toneClasses}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className={`font-black ${titleClasses}`}>{label}</h3>
        <RemoveButton label={label} onClick={() => onRemove(item.id)} />
      </div>
      <p className="text-base font-semibold leading-7 text-ink/85">{item.value}</p>
    </section>
  );
}

function ReviewField({
  label,
  item,
  onRemove
}: {
  label: string;
  item: SummaryReviewItem;
  onRemove: (id: string) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-black text-cornflower-blue">{label}</h3>
        <RemoveButton label={label} onClick={() => onRemove(item.id)} />
      </div>
      <p className="text-sm font-semibold leading-6 text-ink/75">{item.value}</p>
    </section>
  );
}

function ReviewDetail({
  item,
  onRemove
}: {
  item: SummaryReviewItem;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-cornflower-blue/12 bg-linen-white/45 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <strong className="text-sm text-ink">{item.label}</strong>
        <RemoveButton label={item.label} onClick={() => onRemove(item.id)} />
      </div>
      <p className="break-words text-sm font-medium leading-6 text-ink/70">{item.value}</p>
    </section>
  );
}

function ExportAction({
  title,
  body,
  buttonLabel,
  marker,
  onClick,
  disabled = false
}: {
  title: string;
  body: string;
  buttonLabel: string;
  marker: "three" | "lock" | "arrow" | "agent";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <article className={`grid gap-5 rounded-[1.5rem] border-2 border-ink/10 bg-white p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8 ${disabled ? "opacity-55" : ""}`}>
      <span className={`grid h-16 w-16 place-items-center rounded-full text-xl font-black ${disabled ? "bg-ink/5 text-ink/35" : "bg-cornflower-blue/10 text-ink/70"}`}>
        {marker === "three" ? <span className="text-2xl leading-none">∴</span> : null}
        {marker === "lock" ? <span className="text-lg leading-none">LOCK</span> : null}
        {marker === "arrow" ? <span className="text-3xl leading-none">↓</span> : null}
        {marker === "agent" ? <span className="text-2xl leading-none">✦</span> : null}
      </span>
      <div className="grid gap-1">
        <h2 className="text-xl font-black text-ink md:text-2xl">{title}</h2>
        <p className="text-base font-semibold leading-7 text-ink/60 md:text-lg">{body}</p>
      </div>
      <button
        className="min-h-12 rounded-full border-2 border-ink/10 px-7 text-base font-black text-ink transition hover:border-ink/25 hover:bg-soft-linen focus:outline-none focus:ring-4 focus:ring-cornflower-blue/20 disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/35 disabled:hover:border-ink/10 disabled:hover:bg-transparent md:min-h-14"
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        {buttonLabel}
      </button>
    </article>
  );
}
