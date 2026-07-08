import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getAppConfig } from "./config";

export type EncryptedPayload = {
  algorithm: "aes-256-gcm";
  iv: string;
  tag: string;
  data: string;
};

function encryptionKey() {
  const config = getAppConfig();
  if (config.documentEncryptionKey) {
    const decoded = Buffer.from(config.documentEncryptionKey, "base64");
    if (decoded.length === 32) return decoded;
  }

  return createHash("sha256").update(config.appSecret).digest();
}

export function encryptBytes(input: Uint8Array): EncryptedPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  return {
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64")
  };
}

export function decryptBytes(payload: EncryptedPayload): Buffer {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(payload.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.data, "base64")),
    decipher.final()
  ]);
}

export function encryptJson<T>(input: T): EncryptedPayload {
  return encryptBytes(Buffer.from(JSON.stringify(input), "utf8"));
}

export function decryptJson<T>(payload: EncryptedPayload): T {
  return JSON.parse(decryptBytes(payload).toString("utf8")) as T;
}
