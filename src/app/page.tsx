"use client";

import { useState } from "react";
import Link from "next/link";
import { CommunityFeed } from "@/components/medicalIntake/CommunityFeed";
import { mockCommunityPosts } from "@/lib/mocks/communityMocks";

type HomeTab = "intake" | "private" | "community";

const tabs: { id: HomeTab; label: string; summary: string; className: string }[] = [
  {
    id: "intake",
    label: "Intake",
    summary: "Guided symptom capture",
    className: "border-ink/10 bg-linen-white text-ink data-[active=true]:bg-white"
  },
  {
    id: "private",
    label: "Private zone",
    summary: "Dark secure workspace",
    className:
      "border-slate-400/20 bg-[#111827] text-white data-[active=true]:bg-[#020617] data-[active=true]:text-white"
  },
  {
    id: "community",
    label: "Community area",
    summary: "Rainbow shared support",
    className:
      "border-white/50 bg-[linear-gradient(135deg,#ffe66d,#ff8cc6,#8bd3ff,#9dffb0)] text-ink data-[active=true]:shadow-[0_16px_40px_rgba(239,139,216,0.28)]"
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<HomeTab>("intake");

  return (
    <main className="min-h-dvh bg-paper px-5 py-8 text-ink md:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-14 px-0 py-4 md:py-6">
        <header className="flex items-center justify-between gap-4 print:hidden">
          <Link href="/" className="flex items-center gap-3" aria-label="Back to home">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cornflower-blue/12">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/75" />
            </span>
            <span className="text-sm font-black uppercase tracking-[0.22em] text-ink/55">eliza</span>
          </Link>
        </header>

        <nav
          className="grid gap-3 rounded-[1.75rem] bg-white/70 p-2 shadow-[0_18px_60px_rgba(40,45,69,0.06)] md:grid-cols-3"
          aria-label="Eliza areas"
        >
          {tabs.map((tab) => (
            <button
              className={`rounded-[1.35rem] border px-5 py-4 text-left transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cornflower-blue/25 ${tab.className}`}
              data-active={activeTab === tab.id}
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="block text-base font-black">{tab.label}</span>
              <span className="mt-1 block text-sm font-semibold opacity-70">{tab.summary}</span>
            </button>
          ))}
        </nav>

        {activeTab === "intake" ? (
          <section className="relative overflow-hidden rounded-[2.25rem] bg-linen-white px-6 py-7 shadow-[0_22px_70px_rgba(40,45,69,0.07)] md:rounded-[3rem] md:px-10 md:py-10">
            <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-cornflower-blue/20" />
            <div className="absolute -bottom-20 left-16 h-44 w-44 rounded-full bg-royal-yellow/10" />

            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div className="grid max-w-2xl gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cornflower-blue">
                    Guided post
                  </span>
                  <span className="rounded-full bg-red-potion/10 px-3 py-1 text-xs font-bold text-red-potion">
                    Private by default
                  </span>
                </div>

                <div className="grid gap-3">
                  <h1 className="max-w-2xl text-3xl font-black leading-[1.04] text-ink md:text-5xl">
                    Are you experiencing chronic pain?
                  </h1>
                  <p className="max-w-xl text-base font-medium leading-7 text-ink/70 md:text-lg">
                    Answer a few guided questions. eliza turns them into a clear summary you can
                    keep private, share anonymously, or bring to a GP.
                  </p>
                </div>
              </div>

              <Link
                href="/questionnaire"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-ink px-6 text-base font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-ink/90 focus:outline-none focus:ring-4 focus:ring-cornflower-blue/30 active:translate-y-0 md:min-h-16 md:px-8"
              >
                Start questionnaire
                <span className="grid h-8 w-8 place-items-center rounded-full bg-royal-yellow text-2xl font-light leading-none text-ink transition group-hover:scale-105">
                  +
                </span>
              </Link>
            </div>
          </section>
        ) : null}

        {activeTab === "private" ? (
          <section className="overflow-hidden rounded-[2.25rem] bg-[#050816] px-6 py-7 text-white shadow-[0_24px_80px_rgba(5,8,22,0.28)] md:rounded-[3rem] md:px-10 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
              <div className="grid gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-cornflower-blue/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cornflower-blue">
                    Private zone
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/75">
                    Encrypted workspace mock
                  </span>
                </div>
                <div className="grid gap-3">
                  <h1 className="max-w-2xl text-3xl font-black leading-[1.04] md:text-5xl">
                    Review your health story before anything leaves your device.
                  </h1>
                  <p className="max-w-2xl text-base font-medium leading-7 text-white/70 md:text-lg">
                    This area represents the secure side of eliza: drafts, private summaries,
                    documents, and approval checkpoints before sharing.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {["Draft summary", "Document vault", "Share approval"].map((label) => (
                    <section className="rounded-2xl border border-white/10 bg-white/[0.07] p-5" key={label}>
                      <p className="text-sm font-black text-white">{label}</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-white/60">
                        Mock private state ready for the next agent integration step.
                      </p>
                    </section>
                  ))}
                </div>
              </div>

              <aside className="rounded-[1.5rem] border border-cornflower-blue/25 bg-cornflower-blue/10 p-5">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-cornflower-blue">
                  Privacy status
                </p>
                <div className="mt-5 grid gap-4">
                  {["Local intake captured", "PHI redaction pending", "No community publish yet"].map(
                    (item) => (
                      <div className="flex items-center gap-3 rounded-2xl bg-black/20 px-4 py-3" key={item}>
                        <span className="h-2.5 w-2.5 rounded-full bg-royal-yellow" />
                        <span className="text-sm font-bold text-white/80">{item}</span>
                      </div>
                    )
                  )}
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {activeTab === "community" ? (
          <section className="grid gap-6 rounded-[2.25rem] bg-[linear-gradient(135deg,#fff3a3_0%,#ffd1e8_32%,#c7ecff_64%,#d8ffd8_100%)] p-5 shadow-[0_24px_80px_rgba(239,139,216,0.2)] md:rounded-[3rem] md:p-8">
            <div className="grid gap-2 rounded-[1.5rem] bg-white/70 p-5 backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-red-potion">
                Community area
              </p>
              <h2 className="text-2xl font-black text-ink md:text-3xl">
                See how eliza keeps posts structured and safe
              </h2>
              <p className="max-w-2xl text-base font-medium leading-7 text-ink/65">
                These mock posts show how guided answers can become clearer posts with safe AI
                guidance and clinician-style context.
              </p>
            </div>
            <CommunityFeed posts={mockCommunityPosts} />
          </section>
        ) : null}
      </section>
    </main>
  );
}
