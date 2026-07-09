import type { MedicalDocument } from "@/lib/models/clientFlow";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function isTextLike(file: File) {
  const lowerName = file.name.toLowerCase();
  return (
    file.type.startsWith("text/") ||
    ["application/json", "application/xml", "application/csv"].includes(file.type) ||
    [".txt", ".md", ".csv", ".json", ".xml", ".log"].some((suffix) =>
      lowerName.endsWith(suffix)
    )
  );
}

export async function readMedicalDocuments(files: File[]): Promise<MedicalDocument[]> {
  const decoder = new TextDecoder("utf-8", { fatal: false });

  return Promise.all(
    files.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      return {
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        extractedText: isTextLike(file)
          ? decoder.decode(bytes).slice(0, 5000)
          : "[Binary document attached. Text extraction is not configured in this frontend mock.]",
        contentBase64: bytesToBase64(bytes)
      };
    })
  );
}

export function encodeBytesToBase64(bytes: Uint8Array) {
  return bytesToBase64(bytes);
}

export function decodeBase64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
