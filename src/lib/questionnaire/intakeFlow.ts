import type { FibroLogicInput, IntakeStep, StepId } from "@/lib/models";
import { mockUserProfile } from "@/lib/mocks";

export const concernOptions = [
  "Widespread pain",
  "Muscle pain",
  "Joint pain",
  "Fatigue",
  "Poor sleep",
  "Brain fog / memory problems",
  "Stiffness",
  "Other"
];

export const painRegions = [
  "Neck",
  "Shoulders",
  "Upper back",
  "Lower back",
  "Chest",
  "Arms",
  "Hands",
  "Hips",
  "Legs",
  "Feet"
];

export const painQualities = ["Aching", "Burning", "Stabbing", "Tender", "Deep muscle pain", "Throbbing", "Stiffness"];
export const cognitiveOptions = [
  "Difficulty concentrating",
  "Forgetting conversations",
  "Losing words",
  "Slow thinking",
  "Difficulty following conversations",
  "None"
];
export const impactOptions = ["Work", "Exercise", "Walking", "Household tasks", "Driving", "Social activities", "Relationships", "Sleep"];
export const triggerOptions = ["Stress", "Poor sleep", "Cold weather", "Exercise", "Sitting too long", "Standing too long", "Unknown"];
export const helpsOptions = ["Heat", "Stretching", "Rest", "Exercise", "Medication", "Massage", "Nothing"];
export const treatmentOptions = ["Physiotherapy", "GP", "Rheumatologist", "Pain clinic", "Medication", "Exercise", "Heat therapy", "None"];
export const documentOptions = ["Blood test", "MRI", "X-ray", "Ultrasound", "GP letter", "Hospital letter", "None"];
export const redFlagOptions = [
  "Sudden weakness",
  "Loss of bladder control",
  "Loss of bowel control",
  "Fever",
  "Chest pain",
  "Rapid unexplained weight loss",
  "None"
];

export const initialAnswers: FibroLogicInput = {
  profile: {
    ...mockUserProfile
  },
  concerns: [],
  hasPain: null,
  painScope: null,
  painRegions: [],
  bothSides: null,
  aboveBelowWaist: null,
  painMoves: null,
  painArea: "",
  injuryContext: "",
  duration: null,
  painQualities: [],
  painSeverity: 5,
  painFrequency: null,
  fatigue: null,
  fatigueFrequency: null,
  fatigueImpact: null,
  poorSleep: null,
  sleepQuality: [],
  sleepHours: "",
  brainFog: null,
  cognitiveSymptoms: [],
  cognitiveFrequency: null,
  triggers: [],
  helps: [],
  dailyImpact: [],
  hardestActivity: "",
  treatments: [],
  treatmentEffect: "",
  documentTypes: [],
  diagnoses: "",
  medications: "",
  redFlags: [],
  context: ""
};

export function includesAny(values: string[], needles: string[]) {
  return values.some((value) => needles.includes(value));
}

export function toggleValue(values: string[], value: string) {
  if (value === "None") return values.includes("None") ? [] : ["None"];
  const withoutNone = values.filter((item) => item !== "None");
  return withoutNone.includes(value)
    ? withoutNone.filter((item) => item !== value)
    : [...withoutNone, value];
}

export function getQuestionSteps(answers: FibroLogicInput): IntakeStep[] {
  const steps: IntakeStep[] = [
    {
      id: "concerns",
      title: "What would you like help with today?",
      helper: "You can select multiple concerns. This helps eliza focus on the most relevant information for your GP summary."
    }
  ];

  if (!answers.concerns.length) return steps;

  const hasPainConcern = includesAny(answers.concerns, [
    "Widespread pain",
    "Muscle pain",
    "Joint pain",
    "Stiffness"
  ]);
  const hasFatigueConcern = answers.concerns.includes("Fatigue");
  const hasBrainFogConcern = answers.concerns.includes("Brain fog / memory problems");

  if (hasPainConcern) {
    steps.push(
      {
        id: "painRegions",
        title: "Where do you feel pain?",
        helper: "Tap the areas that apply. Multiple areas help eliza understand whether this is widespread or localized pain."
      },
      {
        id: "painPattern",
        title: "Does the pain follow a widespread pattern?",
        helper: "These quick checks help separate general chronic pain from a possible chronic widespread pain profile."
      },
      {
        id: "duration",
        title: "How long have these symptoms been present?",
        helper: "Duration changes the summary. Recent pain should not be framed like long-term widespread pain."
      }
    );

    if (answers.duration && !["over_three_months", "over_one_year"].includes(answers.duration)) {
      steps.push({
        id: "injuryContext",
        title: "Did anything trigger the pain?",
        helper: "Choose the closest context. You can add one short note if needed."
      });
    }

    steps.push({
      id: "painCharacteristics",
      title: "What is the pain like?",
      helper: "Mostly taps here: quality, severity, and how often it happens."
    });
  }

  if (hasFatigueConcern || hasPainConcern) {
    steps.push({
      id: "fatigue",
      title: "How is your energy?",
      helper: "Fibromyalgia-like patterns often include exhaustion that feels out of proportion."
    });
  }

  steps.push({
    id: "sleep",
    title: "How would you describe your sleep?",
    helper: "Sleep quality is useful for both chronic pain and fatigue summaries."
  });

  if (hasBrainFogConcern || hasPainConcern || answers.fatigue === true) {
    steps.push({
      id: "brainFog",
      title: "Have you noticed cognitive symptoms?",
      helper: "We avoid diagnosing fibro fog, but these details help prepare a clearer GP summary."
    });
  }

  steps.push(
    {
      id: "dailyImpact",
      title: "Which areas of life are affected?",
      helper: "Choose the areas that changed most. One optional short note is enough."
    },
    {
      id: "triggers",
      title: "What makes symptoms worse or better?",
      helper: "Select common triggers and things that help. This avoids a long written symptom diary."
    },
    {
      id: "treatments",
      title: "What have you already tried?",
      helper: "This helps avoid repeating advice and gives your GP a quicker picture."
    },
    {
      id: "documents",
      title: "Do you have medical documents?",
      helper: "Select document types first. Uploading files is optional for this prototype."
    },
    {
      id: "medicalHistory",
      title: "Any diagnosis or medication to include?",
      helper: "Optional. Keep this short and avoid personal identifiers like full name, address, or NHS number."
    },
    {
      id: "redFlags",
      title: "Any urgent symptoms today?",
      helper: "These are safety checks. If any apply, eliza will highlight that medical review may be needed."
    },
    {
      id: "privacy",
      title: "How should we publish this?",
      helper: "Choose private GP summary or anonymous community post."
    }
  );

  return steps;
}

export function deriveIntakeAnswers(answers: FibroLogicInput, update: Partial<FibroLogicInput>) {
  const next = { ...answers, ...update };
  const painConcern = includesAny(next.concerns, ["Widespread pain", "Muscle pain", "Joint pain", "Stiffness"]);
  next.hasPain = painConcern || next.painRegions.length > 0;
  next.painScope =
    next.painRegions.length > 3 || next.concerns.includes("Widespread pain") || (next.bothSides && next.aboveBelowWaist)
      ? "whole_body"
      : next.painRegions.length > 0
        ? "specific_area"
        : null;
  next.fatigue = next.fatigueFrequency ? next.fatigueFrequency !== "never" : next.concerns.includes("Fatigue") || null;
  next.poorSleep = next.sleepQuality.length ? !next.sleepQuality.includes("I sleep well") : null;
  next.brainFog = next.cognitiveSymptoms.length ? !next.cognitiveSymptoms.includes("None") : next.concerns.includes("Brain fog / memory problems") || null;
  next.painArea = next.painRegions.join(", ");
  next.triggers = next.triggers.filter(Boolean);
  return next;
}

export function hasUrgentSymptoms(answers: FibroLogicInput) {
  return answers.redFlags.some((flag) => flag !== "None");
}

export function canContinueStep(stepId: StepId, answers: FibroLogicInput) {
  if (stepId === "concerns") return answers.concerns.length > 0;
  return true;
}
