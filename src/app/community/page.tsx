import { CommunityFeed } from "@/components/medicalIntake/CommunityFeed";
import { mockCommunityPosts } from "@/lib/mocks/communityMocks";

export default function CommunityPage() {
  return (
    <main className="min-h-dvh bg-oat-cream px-5 py-8 text-ink md:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-5 px-0 py-4 md:py-6">
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
    </main>
  );
}
