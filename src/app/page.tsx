import Link from "next/link";
import { CommunityFeed } from "@/components/medicalIntake/CommunityFeed";
import { mockCommunityPosts } from "@/lib/mocks/communityMocks";

export default function Home() {
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

        <section className="grid gap-5">
          <div className="grid gap-2">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cornflower-blue">
              Community examples
            </p>
            <h2 className="text-2xl font-black text-ink md:text-3xl">
              See how eliza keeps posts structured and safe
            </h2>
            <p className="max-w-2xl text-base font-medium leading-7 text-ink/60">
              These mock posts show how guided answers can become clearer posts with safe AI
              guidance and clinician-style context.
            </p>
          </div>
          <CommunityFeed posts={mockCommunityPosts} />
        </section>
      </section>
    </main>
  );
}
