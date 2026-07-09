export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  approvalDraft?: string | null;
  approvalResolved?: boolean;
};
