"use client";

import { FormEvent, useMemo, useState } from "react";

type IntakeResponse =
  | {
      status: "needs_documents";
      message: string;
      requestedDocuments: string[];
      decisionTrace: string[];
    }
  | {
      status: "local_answer";
      answer: string;
      decisionTrace: string[];
    }
  | {
      status: "pending_approval";
      caseId: string;
      composedQuestion: string;
      rationale: string;
      decisionTrace: string[];
      documents: Array<{ id: string; name: string; type: string; size: number; encrypted: boolean }>;
    };

type EscalationResponse = {
  status: "external_answer";
  answer: string;
  redactionPreview: string[];
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [intake, setIntake] = useState<IntakeResponse | null>(null);
  const [approvedQuestion, setApprovedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [redactions, setRedactions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  const fileSummary = useMemo(() => {
    if (!files.length) return "No documents selected";
    return files.map((file) => `${file.name} (${Math.ceil(file.size / 1024)} KB)`).join(", ");
  }, [files]);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnswer("");
    setRedactions([]);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("question", question);
      files.forEach((file) => formData.append("documents", file));

      const response = await fetch("/api/intake", {
        method: "POST",
        body: formData
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Question intake failed.");

      setIntake(payload);
      if (payload.status === "local_answer") {
        setAnswer(payload.answer);
      }
      if (payload.status === "pending_approval") {
        setApprovedQuestion(payload.composedQuestion);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Question intake failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function approveEscalation() {
    if (!intake || intake.status !== "pending_approval") return;

    setError("");
    setIsEscalating(true);
    try {
      const response = await fetch("/api/escalate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caseId: intake.caseId,
          approvedQuestion
        })
      });
      const payload = (await response.json()) as EscalationResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Escalation failed.");
      setAnswer(payload.answer);
      setRedactions(payload.redactionPreview);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Escalation failed.");
    } finally {
      setIsEscalating(false);
    }
  }

  return (
    <main className="shell">
      <section className="workspace" aria-label="Question workspace">
        <div className="intro">
          <p className="eyebrow">Encrypted intake</p>
          <h1>Zoe Assist</h1>
        </div>

        <form className="panel intake" onSubmit={submitQuestion}>
          <label className="field">
            <span>Question</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask your question"
              rows={7}
              required
            />
          </label>

          <label className="fileDrop">
            <input
              type="file"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />
            <span>Attach documents</span>
            <small>{fileSummary}</small>
          </label>

          <button className="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Routing..." : "Submit"}
          </button>
        </form>

        {error ? <div className="notice error">{error}</div> : null}

        {intake?.status === "needs_documents" ? (
          <section className="panel result">
            <p className="eyebrow">More context needed</p>
            <h2>{intake.message}</h2>
            <div className="chips">
              {intake.requestedDocuments.map((document) => (
                <span key={document}>{document}</span>
              ))}
            </div>
          </section>
        ) : null}

        {intake?.status === "pending_approval" ? (
          <section className="panel approval">
            <div>
              <p className="eyebrow">Approval required</p>
              <h2>Review outgoing prompt</h2>
              <p>{intake.rationale}</p>
            </div>

            <label className="field">
              <span>Approved prompt</span>
              <textarea
                value={approvedQuestion}
                onChange={(event) => setApprovedQuestion(event.target.value)}
                rows={11}
              />
            </label>

            <div className="documentList">
              {intake.documents.map((document) => (
                <span key={document.id}>
                  {document.name} · encrypted · {Math.ceil(document.size / 1024)} KB
                </span>
              ))}
            </div>

            <button className="primary" type="button" onClick={approveEscalation} disabled={isEscalating}>
              {isEscalating ? "Sending..." : "Approve and send"}
            </button>
          </section>
        ) : null}

        {answer ? (
          <section className="panel result">
            <p className="eyebrow">Answer</p>
            <pre>{answer}</pre>
            {redactions.length ? (
              <div className="redactions">
                {redactions.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}
