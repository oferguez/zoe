import { NextResponse } from "next/server";
import { createCase } from "@/lib/caseStore";
import { decide } from "@/lib/decision";
import { parseUploadedDocuments } from "@/lib/documents";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const question = String(formData.get("question") || "").trim();

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const documents = await parseUploadedDocuments(formData);
    const decision = await decide({ question, documents });

    if (decision.status === "pending_approval") {
      const storedCase = createCase(question, documents);
      return NextResponse.json({
        ...decision,
        caseId: storedCase.id,
        expiresAt: storedCase.expiresAt,
        documents: documents.map((document) => ({
          id: document.id,
          name: document.name,
          type: document.type,
          size: document.size,
          encrypted: true
        }))
      });
    }

    return NextResponse.json(decision);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Intake failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
