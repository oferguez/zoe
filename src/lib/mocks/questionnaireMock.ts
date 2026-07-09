import { mockUserProfile } from "@/lib/mocks/userProfileMock";
import type { FibroLogicInput } from "@/lib/models/questionnaire";

export const mockPositiveFibroFogQuestionnaire: FibroLogicInput = {
  profile: {
    ...mockUserProfile
  },
  concerns: [
    "Widespread pain",
    "Muscle pain",
    "Joint pain",
    "Fatigue",
    "Poor sleep",
    "Brain fog / memory problems",
    "Stiffness"
  ],
  hasPain: true,
  painScope: "whole_body",
  painRegions: ["Neck", "Shoulders", "Lower back", "Hips", "Legs", "Hands"],
  bothSides: true,
  aboveBelowWaist: true,
  painMoves: "sometimes",
  painArea: "Neck, shoulders, lower back, hips, legs, hands",
  injuryContext: "No clear trigger",
  duration: "over_three_months",
  painQualities: ["Aching", "Tender", "Deep muscle pain", "Stiffness"],
  painSeverity: 7,
  painFrequency: "daily",
  fatigue: true,
  fatigueFrequency: "daily",
  fatigueImpact: "significantly",
  poorSleep: true,
  sleepQuality: ["I wake frequently", "I never feel refreshed"],
  sleepHours: "4-6 hours",
  brainFog: true,
  cognitiveSymptoms: [
    "Difficulty concentrating",
    "Forgetting conversations",
    "Losing words",
    "Slow thinking"
  ],
  cognitiveFrequency: "daily",
  triggers: ["Stress", "Poor sleep", "Cold weather", "Sitting too long"],
  helps: ["Heat", "Rest", "Medication"],
  dailyImpact: ["Work", "Walking", "Household tasks", "Social activities", "Sleep"],
  hardestActivity: "Working a full day and remembering conversations",
  treatments: ["GP", "Medication", "Heat therapy", "Exercise"],
  treatmentEffect: "Heat and pacing help a little. Medication helps sleep but symptoms continue.",
  documentTypes: ["Blood test", "GP letter"],
  diagnoses: "No fibromyalgia diagnosis yet. Diabetes already recorded in profile.",
  medications: "Amitriptyline 10mg at night, paracetamol when needed",
  redFlags: ["None"],
  context:
    "User wants a GP-ready summary and questions about what should be ruled out before discussing a possible fibromyalgia-like pattern."
};

export const mockGeneralChronicPainQuestionnaire: FibroLogicInput = {
  profile: {
    ...mockUserProfile
  },
  concerns: ["Joint pain", "Other"],
  hasPain: true,
  painScope: "specific_area",
  painRegions: ["Feet"],
  bothSides: false,
  aboveBelowWaist: false,
  painMoves: "no",
  painArea: "Right ankle",
  injuryContext: "After sport or exercise",
  duration: "under_month",
  painQualities: ["Stabbing", "Tender", "Throbbing"],
  painSeverity: 5,
  painFrequency: "occasionally",
  fatigue: false,
  fatigueFrequency: "never",
  fatigueImpact: "not_at_all",
  poorSleep: false,
  sleepQuality: ["I sleep well"],
  sleepHours: "6-8 hours",
  brainFog: false,
  cognitiveSymptoms: ["None"],
  cognitiveFrequency: "rarely",
  triggers: ["Exercise", "Standing too long"],
  helps: ["Rest"],
  dailyImpact: ["Walking", "Exercise"],
  hardestActivity: "Running and walking downstairs",
  treatments: ["None"],
  treatmentEffect: "Rest helps. No medication tried yet.",
  documentTypes: ["None"],
  diagnoses: "No diagnosis for this ankle pain.",
  medications: "No current medication for this pain.",
  redFlags: ["None"],
  context:
    "Pain started after football two days ago. User wants general chronic pain or injury-safe advice, not fibromyalgia-specific guidance."
};
