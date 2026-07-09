import type { RefObject } from "react";
import type { AnalysisResponse, ExternalResult, PrivacyMode } from "@/lib/clientFlow";
import { formatUserProfile, type UserProfile } from "@/lib/models";
import { mockUserProfile } from "@/lib/mocks";
import { MessageText } from "./MessageText";

type SummaryPanelProps = {
  analysis: AnalysisResponse | null;
  externalResult: ExternalResult | null;
  resultPrivacy: PrivacyMode | null;
  privateResponseTime: string;
  hasAnswer: boolean;
  isSubmitting: boolean;
  isSendingExternal: boolean;
  onApproveExternalSend: () => void;
  responseRef: RefObject<HTMLElement | null>;
  userProfile?: UserProfile;
};

export function SummaryPanel({
  analysis,
  externalResult,
  resultPrivacy,
  privateResponseTime,
  hasAnswer,
  isSubmitting,
  isSendingExternal,
  onApproveExternalSend,
  responseRef,
  userProfile = mockUserProfile
}: SummaryPanelProps) {
  if (analysis?.kind !== "external_summary") return null;

  const resultPrivacyLabel =
    resultPrivacy === "private" ? "Private selected" : resultPrivacy === "public" ? "Public selected" : "";
  const title = [privateResponseTime, "Publish approval required", resultPrivacyLabel]
    .filter(Boolean)
    .join(" | ");
  const summaryText = analysis.summary.replace(
    /^Anonymized medical question for external analysis:\n\n/,
    ""
  );

  return (
    <section
      className="grid gap-4 rounded-2xl border border-bubblegum-kisses/30 bg-bubblegum-kisses/10 p-5 shadow-[0_18px_55px_rgba(40,45,69,0.08)]"
      ref={hasAnswer ? undefined : responseRef}
    >
      <h2 className="text-lg font-black text-red-potion">{title}</h2>
      <section className="rounded-xl border border-ink/10 bg-white p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-ink/45">
          User profile sent with summary
        </p>
        <div className="grid gap-2 text-sm font-bold text-ink/70 sm:grid-cols-2">
          {formatUserProfile(userProfile).map((item) => (
            <span className="rounded-lg bg-soft-linen px-3 py-2" key={item}>
              {item}
            </span>
          ))}
        </div>
      </section>
      {externalResult ? (
        <div className="flex flex-wrap gap-2">
          {externalResult.targets.map((target) => (
            <span className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-black text-ink/60" key={target}>
              {target}
            </span>
          ))}
        </div>
      ) : (
        <button
          className="min-h-11 w-fit rounded-lg bg-ink px-4 text-sm font-black text-white transition hover:bg-ink/90 focus:outline-none focus:ring-4 focus:ring-royal-yellow/50 disabled:cursor-wait disabled:opacity-70"
          type="button"
          onClick={onApproveExternalSend}
          disabled={isSubmitting || isSendingExternal}
        >
          {isSendingExternal ? "Sending..." : "Approve community draft"}
        </button>
      )}
      <MessageText text={summaryText} />
      <div className="flex flex-wrap gap-2">
        {analysis.redactions.map((item) => (
          <span className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-black text-ink/60" key={item}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
