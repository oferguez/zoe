import {
  anonymousPatient,
  type CommunityAiGuidance,
  type CommunityAiGuidanceResource,
  type CommunityDraftSource,
  type CommunityPost
} from "@/lib/models/community";

const fibroResources: CommunityAiGuidanceResource[] = [
  {
    id: "nhs-fibromyalgia",
    label: "Fibromyalgia",
    source: "NHS",
    href: "https://www.nhs.uk/conditions/fibromyalgia/"
  },
  {
    id: "arthritis-uk-fibromyalgia",
    label: "Fibromyalgia",
    source: "Arthritis UK",
    href: "https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/fibromyalgia/"
  },
  {
    id: "nice-chronic-pain",
    label: "Chronic pain guideline",
    source: "NICE",
    href: "https://www.nice.org.uk/guidance/ng193"
  }
];

const generalPainResources: CommunityAiGuidanceResource[] = [
  {
    id: "nhs-sprains",
    label: "Sprains and strains",
    source: "NHS",
    href: "https://www.nhs.uk/conditions/sprains-and-strains/"
  },
  {
    id: "nhs-when-to-get-help",
    label: "When to get medical help",
    source: "NHS",
    href: "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-go-to-ae/"
  },
  {
    id: "nice-chronic-pain",
    label: "Chronic pain guideline",
    source: "NICE",
    href: "https://www.nice.org.uk/guidance/ng193"
  }
];

export function createFibroPatternGuidance(id: string): CommunityAiGuidance {
  return {
    id: `${id}-ai-guidance`,
    disclaimer:
      "This is not a diagnosis. This guidance is generated from trusted medical sources and the information shared in the post.",
    basedOn: {
      title: "Based on what you've shared",
      body:
        "This post describes a chronic widespread pain pattern with fatigue, poor sleep, and brain fog lasting several months. This would be worth discussing with a GP."
    },
    discussWithGp: [
      "The duration and impact of symptoms",
      "Sleep quality, fatigue, and cognitive symptoms",
      "Other health conditions that may need ruling out",
      "Treatment options, referrals, and pain-management support"
    ],
    selfCare: [
      { id: "pace", icon: "pace", label: "Pace activities and rest when needed" },
      { id: "sleep", icon: "sleep", label: "Maintain a regular sleep routine" },
      {
        id: "movement",
        icon: "movement",
        label: "Try gentle movement like walking or stretching",
        href: "https://www.nhs.uk/live-well/exercise/"
      },
      { id: "hydration", icon: "hydration", label: "Stay hydrated and eat regular meals" },
      { id: "support", icon: "support", label: "Connect with supportive people" }
    ],
    trustedResources: fibroResources,
    seeAllResourcesHref: "https://www.nhs.uk/conditions/fibromyalgia/"
  };
}

export function createGeneralPainGuidance(id: string): CommunityAiGuidance {
  return {
    id: `${id}-ai-guidance`,
    disclaimer:
      "This is not a diagnosis. This guidance is generated from trusted medical sources and the information shared in the post.",
    basedOn: {
      title: "Based on what you've shared",
      body:
        "This looks more like recent localized pain after activity than a chronic widespread pain pattern. Keep tracking symptoms and seek help if red flags appear."
    },
    discussWithGp: [
      "When the pain started and what triggered it",
      "Whether there is swelling, bruising, numbness, or weakness",
      "Whether walking or bearing weight is possible",
      "Whether pain is improving, staying the same, or worsening"
    ],
    selfCare: [
      { id: "pace", icon: "pace", label: "Avoid pushing through worsening pain" },
      { id: "movement", icon: "movement", label: "Use gentle movement only if tolerated" },
      {
        id: "urgent",
        icon: "urgent",
        label: "Seek urgent help for severe swelling, deformity, fever, or numbness"
      }
    ],
    trustedResources: generalPainResources,
    seeAllResourcesHref: "https://www.nhs.uk/conditions/sprains-and-strains/"
  };
}

export function createUnclearPatternGuidance(id: string): CommunityAiGuidance {
  return {
    id: `${id}-ai-guidance`,
    disclaimer:
      "This is not a diagnosis. This guidance is generated from trusted medical sources and the information shared in the post.",
    basedOn: {
      title: "Based on what you've shared",
      body:
        "There is not enough information yet to suggest a clear pattern. A timeline and symptom tracker would make the next GP conversation easier."
    },
    discussWithGp: [
      "When symptoms started and whether they are improving",
      "Any fever, weight change, breathlessness, chest pain, or weakness",
      "Sleep quality, fatigue level, and daily function",
      "Medication changes or recent infections"
    ],
    selfCare: [
      { id: "pace", icon: "pace", label: "Prioritise rest while symptoms are unclear" },
      { id: "hydration", icon: "hydration", label: "Stay hydrated and eat regular meals" },
      { id: "movement", icon: "movement", label: "Avoid overexertion during recovery" }
    ],
    trustedResources: fibroResources,
    seeAllResourcesHref: "https://www.nice.org.uk/guidance/ng193"
  };
}

function readPromptField(source: string, field: string) {
  const line = source
    .split("\n")
    .find((item) => item.toLowerCase().startsWith(`${field.toLowerCase()}:`));
  return line?.slice(field.length + 1).trim() || "";
}

function hasUsefulValue(value: string) {
  return Boolean(value && value !== "Not specified" && value !== "None" && value !== "None, None");
}

function firstUseful(...values: string[]) {
  return values.find(hasUsefulValue) || "";
}

function toTagList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(hasUsefulValue);
}

export function buildCommunitySummary(draft: CommunityDraftSource) {
  const source = draft.sourceQuestion || "";
  const concerns = firstUseful(readPromptField(source, "Main concerns"), "pain symptoms");
  const regions = readPromptField(source, "Pain regions");
  const duration = readPromptField(source, "Duration");
  const triggers = readPromptField(source, "Triggers");
  const impact = readPromptField(source, "Impact areas");
  const carePath = readPromptField(source, "Care path");

  const lines = [
    hasUsefulValue(regions)
      ? `Reports ${concerns.toLowerCase()} affecting ${regions.toLowerCase()}.`
      : `Reports ${concerns.toLowerCase()}.`,
    hasUsefulValue(duration) ? `Duration: ${duration}.` : "",
    hasUsefulValue(triggers) ? `Triggers noticed: ${triggers}.` : "",
    hasUsefulValue(impact) ? `Daily impact: ${impact}.` : "",
    hasUsefulValue(carePath) ? carePath : ""
  ].filter(Boolean);

  if (lines.length) return lines.join(" ");

  return draft.summary
    .replace(/^Anonymized medical question for external analysis:\n\n/, "")
    .split("Original generated note:")[0]
    .split("Patient profile:")[0]
    .replace(/Publication preference: .+$/m, "")
    .trim()
    .slice(0, 420);
}

function buildCommunityTags(draft: CommunityDraftSource) {
  const source = draft.sourceQuestion || "";
  const carePath = readPromptField(source, "Care path").toLowerCase();
  const tags = [
    ...toTagList(readPromptField(source, "Main concerns")),
    ...toTagList(readPromptField(source, "Pain regions")),
    carePath.includes("general chronic pain") ? "general advice" : "needs review"
  ];

  return Array.from(new Set(tags)).slice(0, 5);
}

export function createCommunityPostFromDraft(draft: CommunityDraftSource): CommunityPost {
  const source = `${draft.sourceQuestion}\n${draft.summary}`.toLowerCase();
  const summary = buildCommunitySummary(draft);
  const duration = readPromptField(draft.sourceQuestion, "Duration");
  const triggers = toTagList(readPromptField(draft.sourceQuestion, "Triggers"));
  const regions = readPromptField(draft.sourceQuestion, "Pain regions");
  const hasGeneralPainPattern = source.includes("general chronic pain");
  const guidance = hasGeneralPainPattern
    ? createGeneralPainGuidance(draft.id)
    : createFibroPatternGuidance(draft.id);

  return {
    id: `community-${draft.id}`,
    author: anonymousPatient.displayName,
    authorProfile: anonymousPatient,
    timeAgo: "just now",
    status: "ai guidance ready",
    title: regions ? `Advice on pain affecting ${regions.toLowerCase()}` : "Looking for advice on chronic pain",
    summary: summary || "Anonymous health summary awaiting review.",
    tags: buildCommunityTags(draft),
    durationLabel: duration || "Not specified",
    triggerLabels: triggers.length ? triggers : ["Not specified"],
    question:
      "Has anyone experienced something similar while waiting to see a healthcare professional? What helped you manage symptoms safely?",
    aiGuidance: guidance,
    comments: [
      {
        id: `community-${draft.id}-ai`,
        author: "eliza AI",
        authorRole: "openai generated",
        role: "openai generated",
        createdAtLabel: "just now",
        body:
          "Structured AI guidance is available for this post. It is not a diagnosis and should be checked with a healthcare professional."
      }
    ]
  };
}
