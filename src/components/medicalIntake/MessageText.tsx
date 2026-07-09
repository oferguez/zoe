function isLongMessage(text: string) {
  return text.length > 260 || text.split("\n").length > 4;
}

export function MessageText({ text }: { text: string }) {
  const isLong = isLongMessage(text);

  return (
    <div
      className="relative rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm leading-6 text-ink"
      tabIndex={isLong ? 0 : undefined}
    >
      <pre className={`${isLong ? "max-h-36 overflow-hidden focus:max-h-none" : ""} whitespace-pre-wrap break-words font-sans`}>
        {text}
      </pre>
      {isLong ? (
        <span className="mt-2 block text-xs font-black text-red-potion">read more...</span>
      ) : null}
    </div>
  );
}
