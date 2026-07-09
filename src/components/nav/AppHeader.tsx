"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs: Array<{ label: string; href: string; match: (pathname: string) => boolean }> = [
  {
    label: "Onboarding",
    href: "/",
    match: (pathname) =>
      pathname === "/" || pathname.startsWith("/questionnaire") || pathname.startsWith("/summary")
  },
  {
    label: "PRIVATE ZONE",
    href: "/private",
    match: (pathname) => pathname.startsWith("/private")
  },
  {
    label: "COMMUNITY ZONE",
    href: "/community",
    match: (pathname) => pathname.startsWith("/community")
  }
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 py-6 print:hidden md:px-10">
      <Link href="/" className="flex items-center gap-3 self-start" aria-label="Back to home">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-cornflower-blue/12">
          <span className="h-2.5 w-2.5 rounded-full bg-cornflower-blue" />
        </span>
        <span className="text-sm font-black uppercase tracking-[0.22em] text-ink/55">eliza</span>
      </Link>

      <nav aria-label="Primary" className="flex w-fit items-center gap-1 rounded-full bg-fog-gray/35 p-1.5">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-full border-2 border-magenta-pop bg-white px-5 py-2 text-sm font-black text-ink"
                  : "rounded-full border-2 border-transparent px-5 py-2 text-sm font-bold text-ink/50 transition hover:text-ink/75"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
