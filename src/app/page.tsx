import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh bg-oat-cream px-5 py-8 text-ink md:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-14 px-0 py-4 md:py-6">
        <section className="relative overflow-hidden rounded-[2.25rem] bg-linen-white px-6 py-8 shadow-[0_22px_70px_rgba(40,45,69,0.07)] md:rounded-[3rem] md:px-10 md:py-12">
          <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-cornflower-blue/20" />
          <div className="absolute -bottom-20 left-16 h-44 w-44 rounded-full bg-royal-yellow/10" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-8">
            <div>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-red-potion/10 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-red-potion">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-potion" aria-hidden="true" />
                  Private by default
                </span>

                <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-bold text-ink/60">
                  GP-ready summary · Community sharing
                </span>
              </div>

              <div className="grid gap-4">
                <h1 className="max-w-2xl text-3xl font-black leading-[1.04] text-ink md:text-5xl">
                  Are you experiencing chronic pain?
                </h1>

                <p className="max-w-xl text-base font-medium leading-7 text-ink/70 md:text-lg">
                  A short, adaptive set of questions turns your answers into a
                  clear, GP-ready summary. Keep it private, or share it
                  anonymously with the community — you decide.
                </p>
              </div>

              <div className="mt-7 grid gap-3">
                <Link
                  href="/questionnaire"
                  className="group inline-flex min-h-14 w-fit items-center justify-center gap-3 rounded-full bg-ink px-5 pr-4 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-ink/90 focus:outline-none focus:ring-4 focus:ring-cornflower-blue/30 active:translate-y-0 md:min-h-15 md:px-6 md:pr-4 md:text-base"
                >
                  Start questionnaire
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-royal-yellow text-xl font-light leading-none text-ink transition group-hover:scale-105">
                    +
                  </span>
                </Link>

                <p className="text-xs font-bold text-ink/45">
                  Takes about 8–10 minutes
                </p>
              </div>

              <Link
                href="/community"
                className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cornflower-blue transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-cornflower-blue/25"
              >
                Not ready? See posts from our community
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <aside
              className="hidden shrink-0 self-start rounded-3xl border border-cornflower-blue/15 bg-white/70 p-5 lg:block"
              aria-label="How eliza works"
            >
              <h2 className="mb-4 text-sm font-black text-ink">How it works</h2>
              <ol className="grid gap-4">
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cornflower-blue/12 text-xs font-black text-cornflower-blue">
                    1
                  </span>
                  <p className="text-sm font-semibold leading-5 text-ink/75">
                    Answer guided questions that adapt to your symptoms
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cornflower-blue/12 text-xs font-black text-cornflower-blue">
                    2
                  </span>
                  <p className="text-sm font-semibold leading-5 text-ink/75">
                    Get a clear summary, written in plain language for a GP
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cornflower-blue/12 text-xs font-black text-cornflower-blue">
                    3
                  </span>
                  <p className="text-sm font-semibold leading-5 text-ink/75">
                    Choose what happens next — private, or shared anonymously
                  </p>
                </li>
              </ol>
            </aside>
          </div>
        </section>
      </section>
    </main>
  );
}
