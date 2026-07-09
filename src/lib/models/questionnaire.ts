import type { UserProfile } from "./userProfile";

export type FibroLogicInput = {
  profile: UserProfile;
  concerns: string[];
  hasPain: boolean | null;
  painScope: "whole_body" | "specific_area" | null;
  painRegions: string[];
  bothSides: boolean | null;
  aboveBelowWaist: boolean | null;
  painMoves: "yes" | "no" | "sometimes" | null;
  painArea: string;
  injuryContext: string;
  duration: "under_week" | "under_month" | "one_to_three_months" | "over_three_months" | "over_one_year" | null;
  painQualities: string[];
  painSeverity: number;
  painFrequency: "occasionally" | "daily" | "constantly" | "flare_ups" | null;
  fatigue: boolean | null;
  fatigueFrequency: "never" | "sometimes" | "often" | "daily" | null;
  fatigueImpact: "not_at_all" | "a_little" | "moderately" | "significantly" | null;
  poorSleep: boolean | null;
  sleepQuality: string[];
  sleepHours: string;
  brainFog: boolean | null;
  cognitiveSymptoms: string[];
  cognitiveFrequency: "rarely" | "sometimes" | "often" | "daily" | null;
  triggers: string[];
  helps: string[];
  dailyImpact: string[];
  hardestActivity: string;
  treatments: string[];
  treatmentEffect: string;
  documentTypes: string[];
  diagnoses: string;
  medications: string;
  redFlags: string[];
  context: string;
};

export type FibroLogicResult = {
  confidence: "screening" | "high" | "general";
  label: string;
  rationale: string;
};

export type StepId =
  | "concerns"
  | "painRegions"
  | "painPattern"
  | "injuryContext"
  | "duration"
  | "painCharacteristics"
  | "fatigue"
  | "sleep"
  | "brainFog"
  | "dailyImpact"
  | "triggers"
  | "treatments"
  | "documents"
  | "medicalHistory"
  | "redFlags"
  | "privacy";

export type IntakeStep = {
  id: StepId;
  title: string;
  helper: string;
};


