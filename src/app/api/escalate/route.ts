import { NextResponse } from "next/server";
import { anonymizeText, mergeSummaries, redactionPreview } from "@/lib/anonymize";
import { readCase } from "@/lib/caseStore";
import { largeModelAnswer } from "@/lib/llm";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      caseId?: string;
      approvedQuestion?: string;
    };

    if (!body.caseId || !body.approvedQuestion?.trim()) {
      return NextResponse.json(
        { error: "caseId and approvedQuestion are required." },
        { status: 400 }
      );
    }

    const storedCase = readCase(body.caseId);
    if (!storedCase) {
      return NextResponse.json(
        { error: "Case expired or was not found. Please submit again." },
        { status: 404 }
      );
    }

    const question = anonymizeText(body.approvedQuestion.trim());
    const documents = storedCase.documents.map((document, index) => {
      const anonymized = anonymizeText(
        document.text ||
          `[${document.name}: binary document encrypted at rest; text extraction not configured.]`
      );

      return {
        label: `Document ${index + 1}`,
        type: document.type,
        size: document.size,
        text: anonymized.text,
        summary: anonymized.summary
      };
    });

    const answer = await largeModelAnswer({
      approvedQuestion: question.text,
      anonymizedDocuments: documents.map(({ summary, ...document }) => document)
    });

    const summary = mergeSummaries([
      question.summary,
      ...documents.map((document) => document.summary)
    ]);

    return NextResponse.json({
      status: "external_answer",
      answer,
      redactionPreview: redactionPreview(summary)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Escalation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
