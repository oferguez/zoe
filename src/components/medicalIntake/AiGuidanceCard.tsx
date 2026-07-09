import type { CommunityPost } from "@/lib/clientFlow";

const actionIcons: Record<CommunityPost["aiGuidance"]["selfCare"][number]["icon"], string> = {
  pace: "◷",
  sleep: "☾",
  movement: "↗",
  hydration: "▣",
  support: "♙",
  urgent: "!"
};

export function AiGuidanceCard({ guidance }: { guidance: CommunityPost["aiGuidance"] }) {
  return (
    <aside className="hidden w-64 shrink-0 self-start rounded-3xl border border-cornflower-blue/15 bg-linen-white/70 p-5 shadow-[0_18px_55px_rgba(40,45,69,0.06)] lg:block">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-black text-ink">AI guidance</h2>
        <span className="grid h-5 w-5 place-items-center rounded-full border border-cornflower-blue/30 text-xs text-cornflower-blue">
          i
        </span>
      </div>
      <p className="border-b border-cornflower-blue/15 pb-5 text-sm leading-6 text-ink/75">
        {guidance.disclaimer}
      </p>

      <div className="grid gap-5 py-5 text-sm leading-6 text-ink/75">
        <section className="border-b border-cornflower-blue/15 pb-5">
          <h3 className="mb-2 font-black text-ink">{guidance.basedOn.title}</h3>
          <p>{guidance.basedOn.body}</p>
        </section>
        <section className="border-b border-cornflower-blue/15 pb-5">
          <h3 className="mb-2 font-black text-ink">Consider discussing with your GP</h3>
          <ul className="list-disc space-y-1 pl-4">
            {guidance.discussWithGp.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="border-b border-cornflower-blue/15 pb-5">
          <h3 className="mb-3 font-black text-ink">Self-care while waiting</h3>
          <ul className="grid gap-2">
            {guidance.selfCare.map((action) => {
              const content = (
                <>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cornflower-blue/10 text-sm font-black text-cornflower-blue">
                    {actionIcons[action.icon]}
                  </span>
                  <span>{action.label}</span>
                </>
              );

              return (
                <li className="flex items-start gap-2" key={action.id}>
                  {action.href ? (
                    <a
                      className="flex items-start gap-2 rounded-lg transition hover:text-cornflower-blue focus:outline-none focus:ring-2 focus:ring-cornflower-blue/25"
                      href={action.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <span className="flex items-start gap-2">{content}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h3 className="mb-2 font-black text-ink">Trusted resources</h3>
          <div className="grid gap-2">
            {guidance.trustedResources.map((resource) => (
              <a
                className="grid grid-cols-[4.5rem_1fr] overflow-hidden rounded-xl border border-cornflower-blue/15 bg-white/70 transition hover:border-cornflower-blue/35 hover:bg-white focus:outline-none focus:ring-2 focus:ring-cornflower-blue/25"
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                key={resource.id}
              >
                <span className="grid place-items-center border-r border-cornflower-blue/15 px-2 py-2 text-xs font-black text-cornflower-blue">
                  {resource.source}
                </span>
                <span className="px-3 py-2">{resource.label}</span>
              </a>
            ))}
          </div>
          <a
            className="mt-4 inline-flex items-center gap-2 text-sm font-black text-cornflower-blue transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-cornflower-blue/25"
            href={guidance.seeAllResourcesHref}
            target="_blank"
            rel="noreferrer"
          >
            See all resources <span aria-hidden="true">→</span>
          </a>
        </section>
      </div>
    </aside>
  );
}
