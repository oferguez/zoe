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
import { downloadTextReport } from "@/lib/services/reportDownloadService";

export default function SummaryPage() {
  const [draft, setDraft] = useState<SummaryDraft | null>(null);
  const [reviewItems, setReviewItems] = useState<SummaryReviewItem[]>([]);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<"review" | "export">("review");

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
    const report = buildGpSummaryReport(updated, keptSummary);
    downloadTextReport({ filename: "eliza-gp-summary.txt", text: report });
    setStatus("Downloaded report.");
  }

  function removeItem(id: string) {
    setReviewItems((items) => items.filter((item) => item.id !== id));
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

  return (
    <main className="min-h-dvh bg-white px-5 py-6 text-ink md:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-16">
        <header className="flex items-center justify-between gap-4 print:hidden">
          <Link href="/" className="flex items-center gap-3" aria-label="Back to home">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-cornflower-blue/10">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/80" />
            </span>
            <span className="text-sm font-black uppercase tracking-[0.22em] text-ink/55">eliza</span>
          </Link>
          <span className="rounded-full bg-cornflower-blue/10 px-4 py-2 text-sm font-black text-ink">
            Private
          </span>
        </header>

        {mode === "review" ? (
          <section className="mx-auto grid w-full max-w-3xl gap-9">
            <div className="grid gap-4">
              <h1 className="text-4xl font-black leading-[1.05] text-ink md:text-5xl">
                Here&apos;s what I&apos;ve picked out
              </h1>
              <p className="max-w-2xl text-lg font-semibold leading-8 text-ink/60">
                Remove anything that doesn&apos;t look right. Only what you keep from here gets
                used for sharing, saving, or download.
              </p>
            </div>

            <div className="grid gap-4">
              {reviewItems.map((item) => (
                <article
                  className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[1.25rem] border-2 border-ink/10 bg-white px-6 py-5"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-ink/45">
                      {item.label}
                    </p>
                    <p className="break-words text-lg font-bold leading-7 text-ink">{item.value}</p>
                  </div>
                  <button
                    className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink/10 text-2xl leading-none text-ink/45 transition hover:border-red-potion/30 hover:text-red-potion"
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.label}`}
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>

            <p className="max-w-2xl text-sm font-semibold leading-7 text-ink/45">
              Not included: file metadata, unrelated lab values, and anything eliza could identify
              as personal information.
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
              <h1 className="text-4xl font-black leading-[1.05] text-ink md:text-5xl">
                What would you like to do with this?
              </h1>
              <p className="max-w-3xl text-lg font-semibold leading-8 text-ink/60">
                You&apos;re always in control of where this goes. Pick one, or come back to this
                anytime.
              </p>
            </div>

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
                title="Save privately"
                body="Coming soon. This will save the report to your account without sharing it."
                buttonLabel="Coming soon"
                marker="lock"
                disabled
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
  marker: "three" | "lock" | "arrow";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <article className={`grid gap-5 rounded-[1.5rem] border-2 border-ink/10 bg-white p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8 ${disabled ? "opacity-55" : ""}`}>
      <span className={`grid h-16 w-16 place-items-center rounded-full text-xl font-black ${disabled ? "bg-ink/5 text-ink/35" : "bg-cornflower-blue/10 text-ink/70"}`}>
        {marker === "three" ? <span className="text-2xl leading-none">∴</span> : null}
        {marker === "lock" ? <span className="text-lg leading-none">LOCK</span> : null}
        {marker === "arrow" ? <span className="text-3xl leading-none">↓</span> : null}
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
