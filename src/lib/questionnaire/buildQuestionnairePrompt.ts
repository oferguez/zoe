import { formatUserProfileLine } from "@/lib/models";
import type { FibroLogicInput, FibroLogicResult } from "@/lib/models";

function durationLabel(duration: FibroLogicInput["duration"]) {
  switch (duration) {
    case "under_week":
      return "A few days";
    case "under_month":
      return "Less than 1 month";
    case "one_to_three_months":
      return "1 to 3 months";
    case "over_three_months":
      return "More than 3 months";
    case "over_one_year":
      return "More than 1 year";
    default:
      return "Not specified";
  }
}

function labelOrNotSet(value: string | null) {
  return value ? value.replaceAll("_", " ") : "Not specified";
}

function listOrNotSet(values: string[]) {
  return values.length ? values.join(", ") : "Not specified";
}

export function buildQuestionnairePrompt(logicAnswers: FibroLogicInput, logicResult: FibroLogicResult) {
  const carePath =
    logicResult.confidence === "high"
      ? "Chronic pain intake with possible fibromyalgia-pattern summary. Do not diagnose."
      : logicResult.confidence === "general"
        ? "General chronic pain guidance. Do not imply fibromyalgia."
        : "Chronic pain screening still in progress.";

  return [
    "eliza private AI summary request",
    "",
    `Patient profile: ${formatUserProfileLine(logicAnswers.profile)}`,
    `Care path: ${carePath}`,
    `Logic result: ${logicResult.label}`,
    `Logic rationale: ${logicResult.rationale}`,
    `Main concerns: ${listOrNotSet(logicAnswers.concerns)}`,
    `Pain present: ${logicAnswers.hasPain === null ? "Not specified" : logicAnswers.hasPain ? "Yes" : "No"}`,
    `Pain regions: ${listOrNotSet(logicAnswers.painRegions)}`,
    `Pain scope: ${
      logicAnswers.painScope === "whole_body"
        ? "Whole body or widespread"
        : logicAnswers.painScope === "specific_area"
          ? "Specific area"
          : "Not specified"
    }`,
    `Pain on both sides: ${logicAnswers.bothSides === null ? "Not specified" : logicAnswers.bothSides ? "Yes" : "No"}`,
    `Pain above and below waist: ${
      logicAnswers.aboveBelowWaist === null ? "Not specified" : logicAnswers.aboveBelowWaist ? "Yes" : "No"
    }`,
    `Pain moves around: ${labelOrNotSet(logicAnswers.painMoves)}`,
    `Possible trigger or injury context: ${logicAnswers.injuryContext || "Not specified"}`,
    `Duration: ${durationLabel(logicAnswers.duration)}`,
    `Pain qualities: ${listOrNotSet(logicAnswers.painQualities)}`,
    `Pain severity today: ${logicAnswers.painSeverity}/10`,
    `Pain frequency: ${labelOrNotSet(logicAnswers.painFrequency)}`,
    `Fatigue frequency: ${labelOrNotSet(logicAnswers.fatigueFrequency)}`,
    `Fatigue impact: ${labelOrNotSet(logicAnswers.fatigueImpact)}`,
    `Sleep quality: ${listOrNotSet(logicAnswers.sleepQuality)}`,
    `Sleep hours: ${logicAnswers.sleepHours || "Not specified"}`,
    `Cognitive symptoms: ${listOrNotSet(logicAnswers.cognitiveSymptoms)}`,
    `Cognitive symptom frequency: ${labelOrNotSet(logicAnswers.cognitiveFrequency)}`,
    `Impact areas: ${listOrNotSet(logicAnswers.dailyImpact)}`,
    `Most difficult activity: ${logicAnswers.hardestActivity || "Not specified"}`,
    `Triggers: ${listOrNotSet(logicAnswers.triggers)}`,
    `Things that help: ${listOrNotSet(logicAnswers.helps)}`,
    `Treatments or support tried: ${listOrNotSet(logicAnswers.treatments)}`,
    `What helped: ${logicAnswers.treatmentEffect || "Not specified"}`,
    `Document types available: ${listOrNotSet(logicAnswers.documentTypes)}`,
    `Diagnosis history: ${logicAnswers.diagnoses || "Not specified"}`,
    `Current medication: ${logicAnswers.medications || "Not specified"}`,
    `Urgent symptoms selected: ${listOrNotSet(logicAnswers.redFlags)}`,
    "",
    "Generate: symptom summary, timeline, areas affected, impact, triggers, treatments tried, GP discussion points, questions for doctor, trusted self-care guidance, and an anonymous community post if public sharing is selected. Do not diagnose. If care path is general chronic pain guidance, clearly say eliza is not treating this as a fibromyalgia-specific pattern. If urgent symptoms are selected, prioritize appropriate medical review advice."
  ].join("\n");
}
