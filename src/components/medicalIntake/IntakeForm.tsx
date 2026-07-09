import { useEffect, useMemo, useState, type FormEventHandler, type MouseEvent } from "react";
import { QUESTIONNAIRE_STORAGE_KEY, type PrivacyMode } from "@/lib/clientFlow";
import {
  BooleanSegment,
  MultiSelectGrid,
  ShortText,
  SingleSelectGrid
} from "@/components/medicalIntake/IntakeControls";
import type { FibroLogicInput } from "@/lib/models";
import { buildQuestionnairePrompt } from "@/lib/questionnaire/buildQuestionnairePrompt";
import { evaluateFibroLogic } from "@/lib/questionnaire/fibroLogic";
import { readJson, writeJson } from "@/lib/services/browserStorage";
import {
  canContinueStep,
  cognitiveOptions,
  concernOptions,
  deriveIntakeAnswers,
  documentOptions,
  getQuestionSteps,
  hasUrgentSymptoms,
  helpsOptions,
  impactOptions,
  initialAnswers,
  painQualities,
  painRegions,
  redFlagOptions,
  toggleValue,
  treatmentOptions,
  triggerOptions
} from "@/lib/questionnaire/intakeFlow";

type IntakeFormProps = {
  question: string;
  privacy: PrivacyMode;
  fileSummary: string;
  isSubmitting: boolean;
  isSendingExternal: boolean;
  onQuestionChange: (question: string) => void;
  onPrivacyChange: (privacy: PrivacyMode) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

const optionBase =
  "min-h-[58px] rounded-[1.1rem] px-4 text-left text-base font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-royal-yellow/45";
const selectedOption = "border-[3px] border-ink bg-paper text-ink";
const unselectedOption = "border-[3px] border-transparent bg-soft-linen text-ink/75";

export function IntakeForm({
  privacy,
  fileSummary,
  isSubmitting,
  isSendingExternal,
  onQuestionChange,
  onPrivacyChange,
  onFilesChange,
  onSubmit
}: IntakeFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [logicAnswers, setLogicAnswers] = useState<FibroLogicInput>(initialAnswers);

  useEffect(() => {
    const parsed = readJson<Partial<FibroLogicInput>>(QUESTIONNAIRE_STORAGE_KEY);
    if (!parsed) return;
    setLogicAnswers((answers) => ({
      ...answers,
      ...parsed,
      profile: {
        ...answers.profile,
        ...parsed.profile
      }
    }));
  }, []);

  const steps = useMemo(() => getQuestionSteps(logicAnswers), [logicAnswers]);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const currentIndex = steps.findIndex((step) => step.id === currentStep.id);
  const isLastStep = currentIndex === steps.length - 1;
  const canContinue = canContinueStep(currentStep.id, logicAnswers);
  const canSubmit = isLastStep && canContinue;
  const progress = ((currentIndex + 1) / steps.length) * 100;
  const logicResult = useMemo(() => evaluateFibroLogic(logicAnswers), [logicAnswers]);
  const shouldShowUrgentWarning = hasUrgentSymptoms(logicAnswers);
  const compiledQuestion = useMemo(
    () => buildQuestionnairePrompt(logicAnswers, logicResult),
    [logicAnswers, logicResult]
  );

  useEffect(() => {
    onQuestionChange(compiledQuestion);
  }, [compiledQuestion, onQuestionChange]);

  useEffect(() => {
    writeJson(QUESTIONNAIRE_STORAGE_KEY, logicAnswers);
  }, [logicAnswers]);

  useEffect(() => {
    setStepIndex((index) => Math.min(index, steps.length - 1));
  }, [steps.length]);

  function updateLogicAnswer(update: Partial<FibroLogicInput>) {
    setLogicAnswers((answers) => deriveIntakeAnswers(answers, update));
  }

  function goBack() {
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function goNext() {
    setStepIndex((index) => Math.min(steps.length - 1, index + 1));
  }

  function submitOrContinue(event: MouseEvent<HTMLButtonElement>) {
    if (!canContinue) {
      event.preventDefault();
      return;
    }
    if (canSubmit) return;
    event.preventDefault();
    goNext();
  }

  function optionClass(selected: boolean) {
    return `${optionBase} ${selected ? selectedOption : unselectedOption}`;
  }

  return (
    <form className="grid min-h-[680px] grid-rows-[auto_auto_1fr_auto] gap-7" onSubmit={onSubmit}>
      <div className="h-[7px] rounded-full bg-soft-linen" aria-hidden="true">
        <div className="h-full rounded-full bg-royal-yellow transition-all" style={{ width: `${progress}%` }} />
      </div>

      <section className="grid gap-5 pt-8">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-cornflower-blue">
          Chronic pain intake
        </p>
        <h1 className="max-w-[34rem] text-2xl font-black leading-[1.07] text-ink md:text-4xl">
          {currentStep.title}
        </h1>
        <p className="text-l font-medium leading-8 text-ink/70 md:text-xl">{currentStep.helper}</p>
      </section>

      <section className="grid content-start gap-5" aria-live="polite">
        {currentStep.id === "concerns" ? (
          <MultiSelectGrid
            options={concernOptions}
            values={logicAnswers.concerns}
            onToggle={(value) => updateLogicAnswer({ concerns: toggleValue(logicAnswers.concerns, value) })}
            optionClass={optionClass}
          />
        ) : null}

        {currentStep.id === "painRegions" ? (
          <MultiSelectGrid
            options={painRegions}
            values={logicAnswers.painRegions}
            onToggle={(value) => updateLogicAnswer({ painRegions: toggleValue(logicAnswers.painRegions, value) })}
            optionClass={optionClass}
            columns="md:grid-cols-2"
          />
        ) : null}

        {currentStep.id === "painPattern" ? (
          <div className="grid gap-6">
            <BooleanSegment
              label="Is the pain on both sides of your body?"
              value={logicAnswers.bothSides}
              onChange={(value) => updateLogicAnswer({ bothSides: value })}
              optionClass={optionClass}
            />
            <BooleanSegment
              label="Is the pain both above and below your waist?"
              value={logicAnswers.aboveBelowWaist}
              onChange={(value) => updateLogicAnswer({ aboveBelowWaist: value })}
              optionClass={optionClass}
            />
            <SingleSelectGrid
              label="Does the pain move around?"
              options={[
                ["yes", "Yes"],
                ["sometimes", "Sometimes"],
                ["no", "No"]
              ]}
              value={logicAnswers.painMoves}
              onChange={(value) => updateLogicAnswer({ painMoves: value as FibroLogicInput["painMoves"] })}
              optionClass={optionClass}
            />
          </div>
        ) : null}

        {currentStep.id === "duration" ? (
          <SingleSelectGrid
            options={[
              ["under_month", "Less than 1 month"],
              ["one_to_three_months", "1 to 3 months"],
              ["over_three_months", "More than 3 months"],
              ["over_one_year", "More than 1 year"]
            ]}
            value={logicAnswers.duration}
            onChange={(value) => updateLogicAnswer({ duration: value as FibroLogicInput["duration"] })}
            optionClass={optionClass}
          />
        ) : null}

        {currentStep.id === "injuryContext" ? (
          <div className="grid gap-5">
            <SingleSelectGrid
              label="Closest trigger"
              options={[
                ["After sport or exercise", "After sport or exercise"],
                ["After a fall or injury", "After a fall or injury"],
                ["After illness", "After illness"],
                ["No clear trigger", "No clear trigger"]
              ]}
              value={logicAnswers.injuryContext}
              onChange={(value) => updateLogicAnswer({ injuryContext: value })}
              optionClass={optionClass}
            />
            <ShortText
              label="Optional short note"
              value={logicAnswers.context}
              onChange={(value) => updateLogicAnswer({ context: value })}
              placeholder="Example: ankle pain after football two days ago."
            />
          </div>
        ) : null}

        {currentStep.id === "painCharacteristics" ? (
          <div className="grid gap-6">
            <MultiSelectGrid
              label="How would you describe it?"
              options={painQualities}
              values={logicAnswers.painQualities}
              onToggle={(value) => updateLogicAnswer({ painQualities: toggleValue(logicAnswers.painQualities, value) })}
              optionClass={optionClass}
              columns="md:grid-cols-2"
            />
            <label className="grid gap-3 rounded-[1.25rem] bg-soft-linen p-5 text-base font-black text-ink">
              Pain severity today: {logicAnswers.painSeverity}/10
              <input
                className="accent-cornflower-blue"
                type="range"
                min="0"
                max="10"
                value={logicAnswers.painSeverity}
                onChange={(event) => updateLogicAnswer({ painSeverity: Number(event.target.value) })}
              />
            </label>
            <SingleSelectGrid
              label="How often do you experience pain?"
              options={[
                ["occasionally", "Occasionally"],
                ["daily", "Daily"],
                ["constantly", "Constantly"],
                ["flare_ups", "Flare-ups"]
              ]}
              value={logicAnswers.painFrequency}
              onChange={(value) => updateLogicAnswer({ painFrequency: value as FibroLogicInput["painFrequency"] })}
              optionClass={optionClass}
            />
          </div>
        ) : null}

        {currentStep.id === "fatigue" ? (
          <div className="grid gap-6">
            <SingleSelectGrid
              label="Do you feel exhausted even after sleeping?"
              options={[
                ["never", "Never"],
                ["sometimes", "Sometimes"],
                ["often", "Often"],
                ["daily", "Every day"]
              ]}
              value={logicAnswers.fatigueFrequency}
              onChange={(value) => updateLogicAnswer({ fatigueFrequency: value as FibroLogicInput["fatigueFrequency"] })}
              optionClass={optionClass}
            />
            <SingleSelectGrid
              label="How much does fatigue affect daily activities?"
              options={[
                ["not_at_all", "Not at all"],
                ["a_little", "A little"],
                ["moderately", "Moderately"],
                ["significantly", "Significantly"]
              ]}
              value={logicAnswers.fatigueImpact}
              onChange={(value) => updateLogicAnswer({ fatigueImpact: value as FibroLogicInput["fatigueImpact"] })}
              optionClass={optionClass}
            />
          </div>
        ) : null}

        {currentStep.id === "sleep" ? (
          <div className="grid gap-6">
            <MultiSelectGrid
              options={["I sleep well", "I wake frequently", "I struggle to fall asleep", "I never feel refreshed"]}
              values={logicAnswers.sleepQuality}
              onToggle={(value) => updateLogicAnswer({ sleepQuality: toggleValue(logicAnswers.sleepQuality, value) })}
              optionClass={optionClass}
            />
            <SingleSelectGrid
              label="Approximately how many hours?"
              options={[
                ["Less than 4 hours", "Less than 4"],
                ["4-6 hours", "4-6"],
                ["6-8 hours", "6-8"],
                ["More than 8 hours", "More than 8"]
              ]}
              value={logicAnswers.sleepHours}
              onChange={(value) => updateLogicAnswer({ sleepHours: value })}
              optionClass={optionClass}
            />
          </div>
        ) : null}

        {currentStep.id === "brainFog" ? (
          <div className="grid gap-6">
            <MultiSelectGrid
              options={cognitiveOptions}
              values={logicAnswers.cognitiveSymptoms}
              onToggle={(value) => updateLogicAnswer({ cognitiveSymptoms: toggleValue(logicAnswers.cognitiveSymptoms, value) })}
              optionClass={optionClass}
            />
            <SingleSelectGrid
              label="How often does this affect you?"
              options={[
                ["rarely", "Rarely"],
                ["sometimes", "Sometimes"],
                ["often", "Often"],
                ["daily", "Daily"]
              ]}
              value={logicAnswers.cognitiveFrequency}
              onChange={(value) => updateLogicAnswer({ cognitiveFrequency: value as FibroLogicInput["cognitiveFrequency"] })}
              optionClass={optionClass}
            />
          </div>
        ) : null}

        {currentStep.id === "dailyImpact" ? (
          <div className="grid gap-6">
            <MultiSelectGrid
              options={impactOptions}
              values={logicAnswers.dailyImpact}
              onToggle={(value) => updateLogicAnswer({ dailyImpact: toggleValue(logicAnswers.dailyImpact, value) })}
              optionClass={optionClass}
              columns="md:grid-cols-2"
            />
            <ShortText
              label="Most difficult activity, optional"
              value={logicAnswers.hardestActivity}
              onChange={(value) => updateLogicAnswer({ hardestActivity: value })}
              placeholder="Example: walking upstairs, working a full day, cooking dinner."
            />
          </div>
        ) : null}

        {currentStep.id === "triggers" ? (
          <div className="grid gap-6">
            <MultiSelectGrid
              label="Makes symptoms worse"
              options={triggerOptions}
              values={logicAnswers.triggers}
              onToggle={(value) => updateLogicAnswer({ triggers: toggleValue(logicAnswers.triggers, value) })}
              optionClass={optionClass}
              columns="md:grid-cols-2"
            />
            <MultiSelectGrid
              label="Helps symptoms"
              options={helpsOptions}
              values={logicAnswers.helps}
              onToggle={(value) => updateLogicAnswer({ helps: toggleValue(logicAnswers.helps, value) })}
              optionClass={optionClass}
              columns="md:grid-cols-2"
            />
          </div>
        ) : null}

        {currentStep.id === "treatments" ? (
          <div className="grid gap-6">
            <MultiSelectGrid
              options={treatmentOptions}
              values={logicAnswers.treatments}
              onToggle={(value) => updateLogicAnswer({ treatments: toggleValue(logicAnswers.treatments, value) })}
              optionClass={optionClass}
              columns="md:grid-cols-2"
            />
            <ShortText
              label="Anything that helped, optional"
              value={logicAnswers.treatmentEffect}
              onChange={(value) => updateLogicAnswer({ treatmentEffect: value })}
              placeholder="Example: heat helps for a short time, stretching helps a little."
            />
          </div>
        ) : null}

        {currentStep.id === "documents" ? (
          <div className="grid gap-5">
            <MultiSelectGrid
              options={documentOptions}
              values={logicAnswers.documentTypes}
              onToggle={(value) => updateLogicAnswer({ documentTypes: toggleValue(logicAnswers.documentTypes, value) })}
              optionClass={optionClass}
              columns="md:grid-cols-2"
            />
            {!logicAnswers.documentTypes.includes("None") ? (
              <label className="grid min-h-40 cursor-pointer content-center gap-3 rounded-[1.35rem] border-[3px] border-dashed border-ink/20 bg-soft-linen px-5 py-6 text-lg text-ink">
                <input type="file" multiple onChange={(event) => onFilesChange(Array.from(event.target.files || []))} />
                <span className="font-black">Attach files, optional</span>
                <small className="text-base text-ink/60">{fileSummary}</small>
              </label>
            ) : null}
          </div>
        ) : null}

        {currentStep.id === "medicalHistory" ? (
          <div className="grid gap-5">
            <ShortText
              label="Diagnosis related to these symptoms, optional"
              value={logicAnswers.diagnoses}
              onChange={(value) => updateLogicAnswer({ diagnoses: value })}
              placeholder="Example: no diagnosis yet, hypermobility, arthritis, long COVID."
            />
            <ShortText
              label="Current medication, optional"
              value={logicAnswers.medications}
              onChange={(value) => updateLogicAnswer({ medications: value })}
              placeholder="Example: paracetamol sometimes, amitriptyline 10mg."
            />
          </div>
        ) : null}

        {currentStep.id === "redFlags" ? (
          <div className="grid gap-5">
            <MultiSelectGrid
              options={redFlagOptions}
              values={logicAnswers.redFlags}
              onToggle={(value) => updateLogicAnswer({ redFlags: toggleValue(logicAnswers.redFlags, value) })}
              optionClass={optionClass}
              columns="md:grid-cols-2"
            />
            {shouldShowUrgentWarning ? (
              <aside className="rounded-[1.15rem] border border-red-potion/25 bg-red-potion/10 p-4 text-base leading-7 text-ink/75">
                <strong className="block text-red-potion">Medical review may be needed</strong>
                Some selected symptoms can need prompt assessment. Consider contacting your GP, NHS 111,
                or emergency services if symptoms are severe, sudden, or worsening.
              </aside>
            ) : null}
          </div>
        ) : null}

        {currentStep.id === "privacy" ? (
          <div className="grid gap-5" aria-label="Question privacy">
            <label className={`${optionBase} grid content-center ${privacy === "private" ? selectedOption : unselectedOption}`}>
              <span className="flex gap-4">
                <input type="radio" name="privacy" value="private" checked={privacy === "private"} onChange={() => onPrivacyChange("private")} />
                <span>
                  Private GP summary
                  <span className="block text-sm font-medium text-ink/55">Print or save as PDF after review.</span>
                </span>
              </span>
            </label>
            <label className={`${optionBase} grid content-center ${privacy === "public" ? selectedOption : unselectedOption}`}>
              <span className="flex gap-4">
                <input type="radio" name="privacy" value="public" checked={privacy === "public"} onChange={() => onPrivacyChange("public")} />
                <span>
                  Anonymous community post
                  <span className="block text-sm font-medium text-ink/55">Create a safe draft for community support.</span>
                </span>
              </span>
            </label>
          </div>
        ) : null}

        {logicResult.confidence === "high" ? (
          <aside className="rounded-[1.15rem] border border-bubblegum-kisses/35 bg-bubblegum-kisses/10 p-4 text-base leading-7 text-ink/70">
            <strong className="block text-red-potion">Possible chronic widespread pain pattern</strong>
            These answers match the prototype fibromyalgia-pattern branch. This is not a diagnosis;
            it helps prepare a clearer GP discussion.
          </aside>
        ) : null}
      </section>

      <div className="grid gap-3">
        <button
          className="min-h-20 w-full rounded-[1rem] bg-royal-yellow px-5 text-xl font-black text-ink transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-royal-yellow/45 active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/35 disabled:hover:brightness-100"
          type={canSubmit ? "submit" : "button"}
          onClick={submitOrContinue}
          disabled={isSubmitting || isSendingExternal || !canContinue}
        >
          {isSubmitting ? "Checking your answers privately..." : canSubmit ? "Generate summary" : "Continue"}
        </button>
        {canSubmit ? (
          <p className="text-center text-sm font-semibold leading-5 text-ink/50">
            Personal details like your name, address, and contact info are removed on this device
            before anything is sent for AI analysis.
          </p>
        ) : null}
        {stepIndex > 0 ? (
          <button className="text-base font-bold text-ink/55 transition hover:text-ink" type="button" onClick={goBack}>
            Back
          </button>
        ) : null}
      </div>
    </form>
  );
}
