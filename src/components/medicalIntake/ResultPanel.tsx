import type { RefObject } from "react";
import type { AnalysisResponse, ExternalResult, PrivacyMode } from "@/lib/clientFlow";
import { MessageText } from "./MessageText";

type ResultPanelProps = {
  answer: string;
  analysis: AnalysisResponse | null;
  externalResult: ExternalResult | null;
  resultPrivacy: PrivacyMode | null;
  privateResponseTime: string;
  externalAnswerTime: string;
  responseRef: RefObject<HTMLElement | null>;
};

export function ResultPanel({
  answer,
  analysis,
  externalResult,
  resultPrivacy,
  privateResponseTime,
  externalAnswerTime,
  responseRef
}: ResultPanelProps) {
  if (!answer) return null;

  const resultPrivacyLabel =
    resultPrivacy === "private" ? "Private selected" : resultPrivacy === "public" ? "Public selected" : "";
  const answerKind = analysis?.kind === "quick_answer" ? "Quick private answer" : "External answer";
  const title = [externalResult ? externalAnswerTime : privateResponseTime, answerKind, resultPrivacyLabel]
    .filter(Boolean)
    .join(" | ");
  const answerText = answer.replace(/^(Quick answer|External answer)\n\n/, "");

  return (
    <section className="grid gap-4 rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_18px_55px_rgba(40,45,69,0.08)]" ref={responseRef}>
      <h2 className="text-lg font-black text-ink">{title}</h2>
      <MessageText text={answerText} />
      {analysis ? <div className="text-xs font-semibold leading-5 text-ink/50">{analysis.trace.join(" / ")}</div> : null}
    </section>
  );
}
