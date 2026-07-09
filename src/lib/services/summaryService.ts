import type { SummaryReviewItem } from "@/lib/models/summary";
import type { SummaryDraft } from "@/lib/clientFlow";

export function cleanDraftText(summary: string) {
  return summary
    .replace(/^Anonymized medical question for external analysis:\n\n/, "")
    .replace(/Publication preference: .+$/m, "")
    .trim();
}

function readPromptField(source: string, field: string) {
  const line = source
    .split("\n")
    .find((item) => item.toLowerCase().startsWith(`${field.toLowerCase()}:`));
  return line?.slice(field.length + 1).trim() || "";
}

function useful(value: string) {
  return Boolean(value && value !== "Not specified" && value !== "None" && value !== "None, None");
}

export function buildSummaryReviewItems(draft: SummaryDraft): SummaryReviewItem[] {
  const source = draft.sourceQuestion || "";
  const profile = readPromptField(source, "Patient profile");
  const pain = [
    readPromptField(source, "Main concerns"),
    readPromptField(source, "Pain regions"),
    readPromptField(source, "Pain qualities")
  ].filter(useful);
  const duration = readPromptField(source, "Duration");
  const triggers = readPromptField(source, "Triggers");
  const helps = readPromptField(source, "Things that help");
  const impact = readPromptField(source, "Impact areas");
  const treatments = readPromptField(source, "Treatments or support tried");
  const medication = readPromptField(source, "Current medication");
  const diagnoses = readPromptField(source, "Diagnosis history");
  const urgent = readPromptField(source, "Urgent symptoms selected");

  const items: Array<SummaryReviewItem | null> = [
    useful(profile)
      ? {
          id: "profile",
          label: "Patient profile",
          value: profile
        }
      : null,
    pain.length
      ? {
          id: "symptoms",
          label: "Symptoms",
          value: pain.join("; ")
        }
      : null,
    useful(duration)
      ? {
          id: "duration",
          label: "Duration",
          value: duration
        }
      : null,
    useful(triggers)
      ? {
          id: "trigger",
          label: "Trigger",
          value: triggers
        }
      : null,
    useful(helps)
      ? {
          id: "helps",
          label: "What helps",
          value: helps
        }
      : null,
    useful(impact)
      ? {
          id: "impact",
          label: "Daily impact",
          value: impact
        }
      : null,
    useful(treatments)
      ? {
          id: "care-plan",
          label: "Care plan",
          value: treatments
        }
      : null,
    useful(medication)
      ? {
          id: "medication",
          label: "Current medication",
          value: medication
        }
      : null,
    useful(diagnoses)
      ? {
          id: "history",
          label: "Medical history",
          value: diagnoses
        }
      : null,
    useful(urgent) && urgent !== "None"
      ? {
          id: "urgent",
          label: "Safety note",
          value: urgent
        }
      : null
  ];

  const reviewItems = items.filter(Boolean) as SummaryReviewItem[];
  if (reviewItems.length) return reviewItems;

  return [
    {
      id: "summary",
      label: "Summary",
      value: cleanDraftText(draft.summary) || "Questionnaire summary ready for review."
    }
  ];
}

export function buildKeptSummary(items: SummaryReviewItem[], draft: SummaryDraft) {
  const reviewed = items.map((item) => `${item.label}: ${item.value}`).join("\n");
  const sourceNote = cleanDraftText(draft.summary);
  return [reviewed, sourceNote ? `\nOriginal generated note:\n${sourceNote}` : ""]
    .filter(Boolean)
    .join("\n");
}

export function buildGpSummaryReport(draft: SummaryDraft, keptSummary: string) {
  return ["eliza GP summary", `Created: ${new Date(draft.createdAt).toLocaleString()}`, "", keptSummary].join(
    "\n"
  );
}
