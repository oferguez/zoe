"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeEncryptedQuestion,
  createHistoryItem,
  encryptForAnalysisService,
  mockHistory,
  readMedicalDocuments,
  sendToExternalTargets,
  type AnalysisResponse,
  type EncryptedEnvelope,
  type ExternalResult,
  type HistoryItem,
  type PrivacyMode
} from "@/lib/clientFlow";

function formatMessageTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isLongMessage(text: string) {
  return text.length > 260 || text.split("\n").length > 4;
}

function MessageText({ text }: { text: string }) {
  const isLong = isLongMessage(text);

  return (
    <div className={`messageBox${isLong ? " isLong" : ""}`} tabIndex={isLong ? 0 : undefined}>
      <pre>{text}</pre>
      {isLong ? <span className="readMore">read more...</span> : null}
    </div>
  );
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [privacy, setPrivacy] = useState<PrivacyMode>("private");
  const [envelope, setEnvelope] = useState<EncryptedEnvelope | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [externalResult, setExternalResult] = useState<ExternalResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [answer, setAnswer] = useState("");
  const [resultPrivacy, setResultPrivacy] = useState<PrivacyMode | null>(null);
  const [resultQuestion, setResultQuestion] = useState("");
  const [privateResponseTime, setPrivateResponseTime] = useState("");
  const [externalAnswerTime, setExternalAnswerTime] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingExternal, setIsSendingExternal] = useState(false);
  const responseRef = useRef<HTMLElement | null>(null);

  const fileSummary = useMemo(() => {
    if (!files.length) return "No documents selected";
    return files.map((file) => `${file.name} (${Math.ceil(file.size / 1024)} KB)`).join(", ");
  }, [files]);

  const yourHistory = history.filter((item) => item.owner === "you");
  const publicHistory = history.filter((item) => item.owner === "other" && item.privacy === "public");
  const resultPrivacyLabel =
    resultPrivacy === "private" ? "Private selected" : resultPrivacy === "public" ? "Public selected" : "";
  const answerKind = analysis?.kind === "quick_answer" ? "Quick Answer" : "External Answer";
  const answerTitle = [externalResult ? externalAnswerTime : privateResponseTime, answerKind, resultPrivacyLabel]
    .filter(Boolean)
    .join(" | ");
  const answerText = answer.replace(/^(Quick answer|External answer)\n\n/, "");
  const summaryTitle = [privateResponseTime, "Publish Approval Required", resultPrivacyLabel]
    .filter(Boolean)
    .join(" | ");
  const summaryText =
    analysis?.kind === "external_summary"
      ? analysis.summary.replace(/^Anonymized medical question for external analysis:\n\n/, "")
      : "";
  const isWorking = isSubmitting || isSendingExternal;

  useEffect(() => {
    if (!analysis && !answer) return;
    responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [analysis, answer]);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedQuestion = question;
    const submittedPrivacy = privacy;

    setError("");
    setAnswer("");
    setAnalysis(null);
    setExternalResult(null);
    setEnvelope(null);
    setResultPrivacy(null);
    setResultQuestion("");
    setPrivateResponseTime("");
    setExternalAnswerTime("");
    setIsSubmitting(true);
    setIsSendingExternal(false);

    try {
      const documents = await readMedicalDocuments(files);
      const encrypted = await encryptForAnalysisService({
        question: submittedQuestion,
        privacy: submittedPrivacy,
        documents
      });
      setEnvelope(encrypted.envelope);

      const serviceResponse = await analyzeEncryptedQuestion(encrypted.envelope, encrypted.key);
      setAnalysis(serviceResponse);
      setResultPrivacy(submittedPrivacy);
      setResultQuestion(submittedQuestion);
      setPrivateResponseTime(formatMessageTime());

      if (serviceResponse.kind === "quick_answer") {
        setAnswer(serviceResponse.answer);
        setHistory((items) => [
          createHistoryItem({
            question: submittedQuestion,
            privacy: submittedPrivacy,
            resultType: "quick",
            answer: serviceResponse.answer
          }),
          ...items
        ]);
        return;
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Question processing failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function approveExternalSend() {
    if (analysis?.kind !== "external_summary" || !resultPrivacy) return;

    setError("");
    setIsSendingExternal(true);

    try {
      const result = await sendToExternalTargets(analysis.summary, resultPrivacy);
      setExternalResult(result);
      setAnswer(result.answer);
      setExternalAnswerTime(formatMessageTime());
      setHistory((items) => [
        createHistoryItem({
          question: resultQuestion,
          privacy: resultPrivacy,
          resultType: "external",
          answer: result.answer
        }),
        ...items
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "External sending failed.");
    } finally {
      setIsSendingExternal(false);
    }
  }

  function startNewQuestion() {
    setQuestion("");
    setFiles([]);
    setFileInputKey((key) => key + 1);
    setPrivacy("private");
    setEnvelope(null);
    setAnalysis(null);
    setExternalResult(null);
    setAnswer("");
    setResultPrivacy(null);
    setResultQuestion("");
    setPrivateResponseTime("");
    setExternalAnswerTime("");
    setError("");
    setIsSubmitting(false);
    setIsSendingExternal(false);
  }

  return (
    <main className="shell">
      <section className="workspace" aria-label="Question workspace">
        <div className="intro">
          <p className="eyebrow">Client-side medical intake</p>
          <h1>Zoe Assist</h1>
          <p>
            A frontend-only prototype that encrypts the query package before handing it to a
            mock analysis service.
          </p>
        </div>

        {answer ? (
          <section className="panel result" ref={responseRef}>
            <div className="responseHeader">
              <h2>{answerTitle}</h2>
              <button className="secondary" type="button" onClick={startNewQuestion} disabled={isWorking}>
                New question
              </button>
            </div>
            <MessageText text={answerText} />
            {analysis ? <div className="trace">{analysis.trace.join(" / ")}</div> : null}
          </section>
        ) : null}

        {analysis?.kind === "external_summary" ? (
          <section className="panel summaryPanel" ref={answer ? undefined : responseRef}>
            <div className="responseHeader">
              <h2>{summaryTitle}</h2>
              {!answer ? (
                <button className="secondary" type="button" onClick={startNewQuestion} disabled={isWorking}>
                  New question
                </button>
              ) : null}
            </div>
            {externalResult ? (
              <div className="chips">
                {externalResult.targets.map((target) => (
                  <span key={target}>{target}</span>
                ))}
              </div>
            ) : (
              <button
                className="primary"
                type="button"
                onClick={approveExternalSend}
                disabled={isWorking}
              >
                {isSendingExternal ? "Sending..." : "Approve Further Sending"}
              </button>
            )}
            <MessageText text={summaryText} />
            <div className="chips">
              {analysis.redactions.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
        ) : null}

        <form className="panel intake" onSubmit={submitQuestion}>
          <label className="field">
            <span>Medical question</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a medical question"
              rows={7}
              required
            />
          </label>

          <div className="privacyGroup" aria-label="Question privacy">
            <label className={privacy === "private" ? "selected" : ""}>
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={privacy === "private"}
                onChange={() => setPrivacy("private")}
              />
              <span>Private</span>
              <small>External public targets are skipped.</small>
            </label>
            <label className={privacy === "public" ? "selected" : ""}>
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={privacy === "public"}
                onChange={() => setPrivacy("public")}
              />
              <span>Public</span>
              <small>Anonymized version may be sent to public forums.</small>
            </label>
          </div>

          <label className="fileDrop">
            <input
              key={fileInputKey}
              type="file"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />
            <span>Attach documents</span>
            <small>{fileSummary}</small>
          </label>

          <button className="primary" type="submit" disabled={isWorking}>
            {isSubmitting ? "Analyzing..." : "Send to Private Healthcare Assistant"}
          </button>
        </form>

        {error ? <div className="notice error">{error}</div> : null}

        {envelope ? (
          <section className="panel statusPanel">
            <p className="eyebrow">Encrypted handoff</p>
            <h2>Package sent to analysis service</h2>
            <div className="chips">
              <span>{envelope.algorithm}</span>
              <span>{envelope.documentCount} documents</span>
              <span>{Math.ceil(envelope.payloadBytes / 1024)} KB payload</span>
              <span>{Math.ceil(envelope.ciphertext.length / 1024)} KB ciphertext</span>
            </div>
          </section>
        ) : null}

        <aside className="panel historyPanel">
          <div>
            <p className="eyebrow">History</p>
            <h2>Your prior questions</h2>
          </div>
          <div className="historyList">
            {yourHistory.map((item) => (
              <article key={item.id}>
                <div className="historyMeta">
                  <span>{item.privacy}</span>
                  <span>{item.resultType}</span>
                </div>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>

          <div>
            <p className="eyebrow">Public forum</p>
            <h2>Public questions from others</h2>
          </div>
          <div className="historyList">
            {publicHistory.map((item) => (
              <article key={item.id}>
                <div className="historyMeta">
                  <span>public</span>
                  <span>{item.resultType}</span>
                </div>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
