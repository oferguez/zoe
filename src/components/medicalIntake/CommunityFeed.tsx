"use client";

import { useEffect, useState } from "react";
import { AiGuidanceCard } from "@/components/medicalIntake/AiGuidanceCard";
import type { CommunityPost } from "@/lib/clientFlow";
import { readSavedCommunityPosts } from "@/lib/services/communityStorageService";

function CommentRole({ role }: { role: CommunityPost["comments"][number]["role"] }) {
  const label =
    role === "clinical expert"
      ? "Clinical expert"
      : role === "openai generated"
        ? "AI guidance"
        : "Community";
  const tone =
    role === "clinical expert"
      ? "bg-royal-yellow/35 text-ink"
      : role === "openai generated"
        ? "bg-cornflower-blue/12 text-cornflower-blue"
        : "bg-cornflower-blue/15 text-cornflower-blue";

  return <span className={`rounded-full px-2 py-1 text-[0.68rem] font-black ${tone}`}>{label}</span>;
}

export function CommunityFeed({ posts }: { posts: CommunityPost[] }) {
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    setLocalPosts(readSavedCommunityPosts());
  }, []);

  const visiblePosts = [...localPosts, ...posts];
  const featuredGuidance = visiblePosts[0]?.aiGuidance;

  return (
    <section className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:items-start" aria-label="Community posts">
      {featuredGuidance ? <AiGuidanceCard guidance={featuredGuidance} /> : null}

      <div className="grid gap-10">
        {visiblePosts.map((post) => (
          <article
            className="rounded-3xl border border-cornflower-blue/12 bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,45,69,0.06)] md:p-8"
            key={post.id}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-cornflower-blue/12 text-xl font-black text-cornflower-blue">
                  {post.authorProfile.avatarInitial}
                </div>
                <div className="text-sm text-ink/60">
                  <p className="font-black text-ink">{post.author}</p>
                  <p>
                    {post.timeAgo} • {post.authorProfile.location} • {post.authorProfile.ageRange}
                  </p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-cornflower-blue">
                    {post.status}
                  </p>
                </div>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 text-xl leading-none text-ink/55"
                type="button"
                aria-label="More post options"
              >
                ...
              </button>
            </div>

            <h2 className="mb-5 text-2xl font-black leading-tight text-ink">
              {post.title}
            </h2>

            <section className="mb-6 rounded-2xl bg-linen-white/75 p-5">
              <h3 className="mb-2 font-black text-ink">Summary</h3>
              <p className="text-base font-semibold leading-7 text-ink/85">{post.summary}</p>
            </section>

            <div className="mb-6 grid gap-5 border-b border-ink/10 pb-6 md:grid-cols-3">
              <section>
                <h3 className="mb-3 font-black text-cornflower-blue">Symptoms</h3>
                <ul className="grid gap-2 text-sm font-semibold text-ink/75">
                  {post.tags.map((tag) => (
                    <li key={tag}>● {tag}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="mb-3 font-black text-cornflower-blue">Duration</h3>
                <p className="text-sm font-semibold leading-6 text-ink/75">
                  {post.durationLabel}
                </p>
              </section>
              <section>
                <h3 className="mb-3 font-black text-cornflower-blue">Triggers noticed</h3>
                <ul className="list-disc space-y-1 pl-4 text-sm font-semibold text-ink/75">
                  {post.triggerLabels.map((trigger) => (
                    <li key={trigger}>{trigger}</li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="mb-6 rounded-2xl border border-royal-yellow/45 bg-royal-yellow/12 p-5">
              <h3 className="mb-2 font-black text-ink">My question</h3>
              <p className="font-semibold leading-7 text-ink/85">{post.question}</p>
            </section>

            <div className="grid gap-3">
              {post.comments.map((comment) => (
                <section className="rounded-2xl border border-cornflower-blue/12 bg-linen-white/45 p-4" key={comment.id}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-ink">{comment.author}</strong>
                    <CommentRole role={comment.role} />
                  </div>
                  <p className="text-sm font-medium leading-6 text-ink/70">{comment.body}</p>
                </section>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-ink/10 pt-4 text-sm font-bold text-ink/60">
              <button className="rounded-lg bg-soft-linen px-4 py-2" type="button">
                ♡ 12
              </button>
              <button className="rounded-lg bg-soft-linen px-4 py-2" type="button">
                Comment
              </button>
              <button className="rounded-lg bg-soft-linen px-4 py-2" type="button">
                Save
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
