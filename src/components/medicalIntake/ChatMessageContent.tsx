import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessageContent({ content }: { content: string }) {
  return (
    <div className="grid gap-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-6">{children}</p>,
          h1: ({ children }) => <h3 className="mt-1 text-base font-black">{children}</h3>,
          h2: ({ children }) => <h3 className="mt-1 text-base font-black">{children}</h3>,
          h3: ({ children }) => (
            <h4 className="mt-1 text-xs font-black uppercase tracking-[0.08em] opacity-70">{children}</h4>
          ),
          ul: ({ children }) => <ul className="grid gap-1 pl-4 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="grid gap-1 pl-4 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="leading-6">{children}</li>,
          hr: () => <hr className="my-1 border-t border-current/10" />,
          strong: ({ children }) => <strong className="font-black">{children}</strong>,
          code: ({ children }) => (
            <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-current/15 px-2 py-1 text-left font-black">{children}</th>
          ),
          td: ({ children }) => <td className="border-b border-current/10 px-2 py-1 align-top">{children}</td>,
          a: ({ children, href }) => (
            <a className="underline underline-offset-2" href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
