"use client";

import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IntakeForm } from "@/components/medicalIntake/IntakeForm";
import { QUESTIONNAIRE_STORAGE_KEY, type PrivacyMode } from "@/lib/clientFlow";
import type { FibroLogicInput } from "@/lib/models";
import {
  mockGeneralChronicPainQuestionnaire,
  mockPositiveFibroFogQuestionnaire
} from "@/lib/mocks";
import { buildQuestionnairePrompt } from "@/lib/questionnaire/buildQuestionnairePrompt";
import { evaluateFibroLogic } from "@/lib/questionnaire/fibroLogic";
import { writeJson } from "@/lib/services/browserStorage";
import {
  createSummaryDraftFromQuestion,
  describeFiles
} from "@/lib/services/questionnaireSubmissionService";

export default function QuestionnairePage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState<PrivacyMode>("public");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileSummary = useMemo(() => {
    return describeFiles(files);
  }, [files]);

  async function createSummaryDraft(submittedQuestion: string, submittedPrivacy: PrivacyMode) {
    setError("");
    setIsSubmitting(true);

    try {
      await createSummaryDraftFromQuestion({
        question: submittedQuestion,
        privacy: submittedPrivacy,
        files
      });
      router.push("/summary");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Question processing failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createSummaryDraft(question, privacy);
  }

  async function useMockScenario(answers: FibroLogicInput, submittedPrivacy: PrivacyMode) {
    writeJson(QUESTIONNAIRE_STORAGE_KEY, answers);
    const mockQuestion = buildQuestionnairePrompt(answers, evaluateFibroLogic(answers));
    setQuestion(mockQuestion);
    setPrivacy(submittedPrivacy);
    await createSummaryDraft(mockQuestion, submittedPrivacy);
  }

  return (
    <main className="min-h-dvh bg-linen-white px-4 py-6 text-ink md:px-8">
      <section className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-[940px] gap-8 bg-white px-8 py-6 shadow-[0_24px_80px_rgba(40,45,69,0.08)] md:px-14">
        <div className="grid grid-cols-[3rem_1fr_3rem] items-center">
          <Link
            href="/"
            className="text-6xl leading-none text-ink/80 transition hover:text-red-potion focus:outline-none focus:ring-4 focus:ring-royal-yellow/50"
            aria-label="Back to home"
          >
            ‹
          </Link>
          {/* <span className="justify-self-center text-xl font-black italic leading-none text-royal-yellow">
            eliza
          </span> */}

          <div className="justify-self-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Back to home">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cornflower-blue/12">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/75" />
            </span>
            <span className="text-sm font-black uppercase tracking-[0.22em] text-ink/55">eliza</span>
          </Link>
        </div>

        </div>

        <section className="grid gap-3 rounded-[1.25rem] border border-cornflower-blue/20 bg-cornflower-blue/10 p-4">
          <div className="grid gap-1">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cornflower-blue">
              Demo mode
            </p>
            <p className="text-sm font-semibold leading-6 text-ink/65">
              Skip manual entry for the presentation. These buttons load registered mock user data
              and generate the summary immediately.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              className="min-h-12 rounded-xl bg-ink px-4 text-left text-sm font-black text-white transition hover:bg-ink/90 focus:outline-none focus:ring-4 focus:ring-cornflower-blue/25 disabled:cursor-wait disabled:opacity-60"
              type="button"
              onClick={() => useMockScenario(mockPositiveFibroFogQuestionnaire, "private")}
              disabled={isSubmitting}
            >
              Use mock: possible fibro fog
            </button>
            <button
              className="min-h-12 rounded-xl border border-ink/15 bg-white px-4 text-left text-sm font-black text-ink transition hover:border-ink/30 hover:bg-soft-linen focus:outline-none focus:ring-4 focus:ring-cornflower-blue/25 disabled:cursor-wait disabled:opacity-60"
              type="button"
              onClick={() => useMockScenario(mockGeneralChronicPainQuestionnaire, "public")}
              disabled={isSubmitting}
            >
              Use mock: general chronic pain
            </button>
          </div>
        </section>

        <IntakeForm
          question={question}
          privacy={privacy}
          fileSummary={fileSummary}
          isSubmitting={isSubmitting}
          isSendingExternal={false}
          onQuestionChange={setQuestion}
          onPrivacyChange={setPrivacy}
          onFilesChange={setFiles}
          onSubmit={submitQuestion}
        />

        {error ? (
          <div className="rounded-2xl border border-red-potion/20 bg-red-potion/10 px-4 py-3 text-sm font-semibold text-red-potion">
            {error}
          </div>
        ) : null}
      </section>
    </main>
  );
}
