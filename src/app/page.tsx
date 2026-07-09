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

const CATEGORY_OPTIONS = ["fatigue", "chronic pain", "weight loss"];

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
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [privacy, setPrivacy] = useState<PrivacyMode>("private");
  const [envelope, setEnvelope] = useState<EncryptedEnvelope | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [externalResult, setExternalResult] = useState<ExternalResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [answer, setAnswer] = useState("");
  const [resultCategory, setResultCategory] = useState("");
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
  const resultCategoryLabel = resultCategory ? `Category: ${resultCategory}` : "";
  const resultPrivacyLabel =
    resultPrivacy === "private" ? "Private selected" : resultPrivacy === "public" ? "Public selected" : "";
  const answerKind = analysis?.kind === "quick_answer" ? "Quick Answer" : "External Answer";
  const answerTitle = [
    externalResult ? externalAnswerTime : privateResponseTime,
    answerKind,
    resultCategoryLabel,
    resultPrivacyLabel
  ]
    .filter(Boolean)
    .join(" | ");
  const answerText = answer.replace(/^(Quick answer|External answer)\n\n/, "");
  const summaryTitle = [privateResponseTime, "Publish Approval Required", resultCategoryLabel, resultPrivacyLabel]
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
    const submittedCategory = category.trim() || CATEGORY_OPTIONS[0];
    const submittedPrivacy = privacy;

    setError("");
    setAnswer("");
    setAnalysis(null);
    setExternalResult(null);
    setEnvelope(null);
    setResultCategory("");
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
      setResultCategory(submittedCategory);
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
    setCategory(CATEGORY_OPTIONS[0]);
    setFiles([]);
    setFileInputKey((key) => key + 1);
    setPrivacy("private");
    setEnvelope(null);
    setAnalysis(null);
    setExternalResult(null);
    setAnswer("");
    setResultCategory("");
    setResultPrivacy(null);
    setResultQuestion("");
    setPrivateResponseTime("");
    setExternalAnswerTime("");
    setError("");
    setIsSubmitting(false);
    setIsSendingExternal(false);
  }

  return (
    <main className="min-h-dvh bg-oat-cream px-5 py-8 text-ink md:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-14 px-0 py-4 md:py-6">
        <section className="relative overflow-hidden rounded-[2.25rem] bg-linen-white px-6 py-8 shadow-[0_22px_70px_rgba(40,45,69,0.07)] md:rounded-[3rem] md:px-10 md:py-12">
          <div className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-cornflower-blue/20" />
          <div className="absolute -bottom-20 left-16 h-44 w-44 rounded-full bg-royal-yellow/10" />

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
                Not ready? See posts from our community
                <span aria-hidden="true">→</span>
              </Link>
            </div>

        <form className="panel intake" onSubmit={submitQuestion}>
          <label className="field">
            <span className="fieldHeader">
              <span>Medical question</span>
              <span className="categoryControl">
                <span>Category</span>
                <input
                  className="categoryInput"
                  list="medical-categories"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                />
              </span>
            </span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a medical question"
              rows={7}
              required
            />
            <datalist id="medical-categories">
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
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
