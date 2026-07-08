import { randomUUID } from "crypto";
import { decryptBytes, decryptJson, encryptBytes, encryptJson, type EncryptedPayload } from "./crypto";
import { documentMetadata, isTextLike, type DocumentMetadata, type UploadedDocument } from "./documents";
import { getAppConfig } from "./config";

type StoredDocument = {
  encryptedMetadata: EncryptedPayload;
  encryptedBytes: EncryptedPayload;
};

type StoredCase = {
  id: string;
  createdAt: number;
  expiresAt: number;
  encryptedQuestion: EncryptedPayload;
  documents: StoredDocument[];
};

export type DecryptedCase = {
  id: string;
  question: string;
  documents: Array<DocumentMetadata & { bytes: Uint8Array; text: string | null }>;
};

type GlobalCaseStore = {
  cases: Map<string, StoredCase>;
};

const globalStore = globalThis as typeof globalThis & {
  __zoeCaseStore?: GlobalCaseStore;
};

function store() {
  if (!globalStore.__zoeCaseStore) {
    globalStore.__zoeCaseStore = { cases: new Map() };
  }
  return globalStore.__zoeCaseStore;
}

function pruneExpired() {
  const now = Date.now();
  for (const [id, item] of store().cases.entries()) {
    if (item.expiresAt <= now) {
      store().cases.delete(id);
    }
  }
}

export function createCase(question: string, documents: UploadedDocument[]) {
  pruneExpired();

  const config = getAppConfig();
  const now = Date.now();
  const id = randomUUID();
  const item: StoredCase = {
    id,
    createdAt: now,
    expiresAt: now + config.caseTtlMinutes * 60 * 1000,
    encryptedQuestion: encryptJson({ question }),
    documents: documents.map((document) => ({
      encryptedMetadata: encryptJson(documentMetadata(document)),
      encryptedBytes: encryptBytes(document.bytes)
    }))
  };

  store().cases.set(id, item);
  return {
    id,
    expiresAt: item.expiresAt
  };
}

export function readCase(id: string): DecryptedCase | null {
  pruneExpired();

  const item = store().cases.get(id);
  if (!item) return null;

  const question = decryptJson<{ question: string }>(item.encryptedQuestion).question;
  const documents = item.documents.map((document) => {
    const metadata = decryptJson<DocumentMetadata>(document.encryptedMetadata);
    const bytes = decryptBytes(document.encryptedBytes);
    const text = isTextLike(metadata.type, metadata.name)
      ? new TextDecoder("utf-8", { fatal: false }).decode(bytes)
      : null;

    return {
      ...metadata,
      bytes: new Uint8Array(bytes),
      text
    };
  });

  return {
    id: item.id,
    question,
    documents
  };
}
