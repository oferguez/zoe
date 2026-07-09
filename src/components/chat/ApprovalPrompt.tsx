export function ApprovalPrompt({
  draftText,
  onApprove,
  onReject,
  disabled
}: {
  draftText: string;
  onApprove: () => void;
  onReject: () => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-4 rounded-[1.25rem] border-2 border-magenta-pop bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-magenta-pop">
        Approval needed before posting
      </p>
      <p className="whitespace-pre-wrap text-base font-semibold leading-7 text-ink">{draftText}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-11 rounded-full bg-ink px-5 text-sm font-black text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onApprove}
          disabled={disabled}
        >
          Approve &amp; post to community
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border-2 border-ink/10 px-5 text-sm font-black text-ink transition hover:border-ink/25 hover:bg-soft-linen disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReject}
          disabled={disabled}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
