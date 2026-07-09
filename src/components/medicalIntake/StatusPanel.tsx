import type { EncryptedEnvelope } from "@/lib/clientFlow";

export function StatusPanel({ envelope }: { envelope: EncryptedEnvelope | null }) {
  if (!envelope) return null;

  return (
    <section className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-xs font-black text-red-potion">Encrypted handoff</p>
      <h2 className="text-lg font-black text-ink">Package sent to analysis service</h2>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-soft-linen px-3 py-1 text-xs font-black text-ink/60">{envelope.algorithm}</span>
        <span className="rounded-full bg-soft-linen px-3 py-1 text-xs font-black text-ink/60">{envelope.documentCount} documents</span>
        <span className="rounded-full bg-soft-linen px-3 py-1 text-xs font-black text-ink/60">{Math.ceil(envelope.payloadBytes / 1024)} KB payload</span>
        <span className="rounded-full bg-soft-linen px-3 py-1 text-xs font-black text-ink/60">{Math.ceil(envelope.ciphertext.length / 1024)} KB ciphertext</span>
      </div>
    </section>
  );
}
