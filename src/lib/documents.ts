import { randomUUID } from "crypto";
import { getAppConfig } from "./config";

export type UploadedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  bytes: Uint8Array;
  text: string | null;
};

export type DocumentMetadata = {
  id: string;
  name: string;
  type: string;
  size: number;
  textExtracted: boolean;
};

const TEXT_TYPES = [
  "text/",
  "application/json",
  "application/xml",
  "application/csv",
  "application/x-ndjson",
  "application/x-yaml"
];

export function documentMetadata(document: UploadedDocument): DocumentMetadata {
  return {
    id: document.id,
    name: document.name,
    type: document.type || "application/octet-stream",
    size: document.size,
    textExtracted: Boolean(document.text)
  };
}

export function isTextLike(type: string, name: string) {
  const lowerName = name.toLowerCase();
  return (
    TEXT_TYPES.some((prefix) => type.toLowerCase().startsWith(prefix)) ||
    [".txt", ".md", ".csv", ".json", ".xml", ".yaml", ".yml", ".log"].some((suffix) =>
      lowerName.endsWith(suffix)
    )
  );
}

export async function parseUploadedDocuments(formData: FormData): Promise<UploadedDocument[]> {
  const config = getAppConfig();
  const files = formData
    .getAll("documents")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > config.maxDocuments) {
    throw new Error(`Upload at most ${config.maxDocuments} documents.`);
  }

  const documents: UploadedDocument[] = [];
  for (const file of files) {
    if (file.size > config.maxDocumentBytes) {
      throw new Error(`${file.name} exceeds the ${config.maxDocumentBytes} byte limit.`);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const text = isTextLike(file.type, file.name)
      ? new TextDecoder("utf-8", { fatal: false }).decode(bytes)
      : null;

    documents.push({
      id: randomUUID(),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      bytes,
      text
    });
  }

  return documents;
}

export function documentPromptExcerpt(document: UploadedDocument) {
  if (!document.text) {
    return `[${document.name}: encrypted binary document, ${document.type}, ${document.size} bytes. Add a parser before sending content.]`;
  }

  return document.text.slice(0, 6000);
}
