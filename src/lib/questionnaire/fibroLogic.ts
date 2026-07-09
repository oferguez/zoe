import type { FibroLogicInput, FibroLogicResult } from "@/lib/models";

export function evaluateFibroLogic(input: FibroLogicInput): FibroLogicResult {
  if (input.hasPain === null) {
    return {
      confidence: "screening",
      label: "Screening not started",
      rationale:
        "eliza first checks whether the answers follow the widespread chronic pain pattern before preparing a summary."
    };
  }

  if (input.hasPain === false) {
    return {
      confidence: "general",
      label: "General guidance path",
      rationale:
        "The user is not reporting pain right now, so the summary should stay general and avoid fibromyalgia-specific framing."
    };
  }

  if (input.painScope === "specific_area" || input.bothSides === false || input.aboveBelowWaist === false) {
    return {
      confidence: "general",
      label: "General chronic pain path",
      rationale:
        "The pain pattern does not match the chronic widespread pain branch. Prepare general chronic pain or injury-safe guidance instead."
    };
  }

  if (input.duration && !["over_three_months", "over_one_year"].includes(input.duration)) {
    return {
      confidence: "general",
      label: "General chronic pain path",
      rationale:
        "The pain duration does not pass the more-than-3-month branch. Keep the response general and encourage appropriate review."
    };
  }

  if (input.fatigue === false || input.poorSleep === false || input.brainFog === false) {
    return {
      confidence: "general",
      label: "General chronic pain path",
      rationale:
        "The symptom pattern does not include the full fatigue, poor sleep, and brain fog branch. Avoid fibromyalgia-specific claims."
    };
  }

  const highConfidence =
    input.hasPain === true &&
    input.painScope === "whole_body" &&
    input.bothSides === true &&
    input.aboveBelowWaist === true &&
    ["over_three_months", "over_one_year"].includes(input.duration || "") &&
    input.fatigue === true &&
    input.poorSleep === true &&
    input.brainFog === true;

  if (highConfidence) {
    return {
      confidence: "high",
      label: "High confidence pattern",
      rationale:
        "Your answers match the demo logic for widespread pain lasting more than 3 months with fatigue, poor sleep, and brain fog. This is not a diagnosis, but it is strong context for a GP-ready summary."
    };
  }

  return {
    confidence: "screening",
    label: "Still checking pattern",
    rationale:
      "eliza is still checking whether the answers follow the widespread chronic pain, fatigue, poor sleep, and brain fog branch."
  };
}
