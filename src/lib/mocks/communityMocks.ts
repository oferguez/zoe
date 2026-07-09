import {
  anonymousPatient,
  type CommunityPost
} from "@/lib/models/community";
import {
  createFibroPatternGuidance,
  createGeneralPainGuidance,
  createUnclearPatternGuidance
} from "@/lib/services/communityService";

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "community-1",
    author: anonymousPatient.displayName,
    authorProfile: anonymousPatient,
    timeAgo: "18 min ago",
    status: "clinician replied",
    title: "Looking for advice on widespread pain and fatigue",
    summary:
      "Widespread pain for more than 6 months with fatigue, poor sleep, and brain fog. Preparing a GP appointment summary and asking what else should be ruled out.",
    tags: ["widespread pain", "fatigue", "poor sleep", "brain fog"],
    durationLabel: "More than 6 months",
    triggerLabels: ["Stress", "Cold weather", "Lack of sleep"],
    question:
      "Has anyone experienced something similar while waiting to see a healthcare professional? What helped you manage symptoms safely?",
    aiGuidance: createFibroPatternGuidance("community-1"),
    comments: [
      {
        id: "community-1-ai",
        author: "Eliza AI",
        authorRole: "openai generated",
        role: "openai generated",
        createdAtLabel: "16 min ago",
        body:
          "This is not a diagnosis. Based on what you've shared, your symptoms show a chronic widespread pain pattern: pain lasting more than 3 months, fatigue, poor sleep, and brain fog affecting daily life. This would be worth discussing with your GP. Helpful points to bring up include symptom duration, areas affected, sleep quality, fatigue level, cognitive symptoms, triggers, treatments already tried, and how symptoms affect work or normal activities. While waiting, consider pacing activities, keeping a symptom diary, maintaining a regular sleep routine, gentle movement if tolerated, and noting flare-up triggers. Seek urgent help if you develop sudden weakness, loss of bladder or bowel control, chest pain, fever, unexplained weight loss, or rapidly worsening symptoms."
      },
      {
        id: "community-1-clinical",
        author: "Dr Maya N.",
        authorRole: "clinical expert",
        role: "clinical expert",
        createdAtLabel: "12 min ago",
        body:
          "This pattern is worth discussing with a GP. Ask about rule-out checks, symptom duration, impact on daily life, sleep quality, and whether referral or pain-management support is appropriate."
      }
    ]
  },
  {
    id: "community-2",
    author: "Runner, anonymized",
    authorProfile: {
      id: "actor-runner",
      displayName: "Runner, anonymized",
      role: "patient",
      avatarInitial: "R",
      location: "United Kingdom",
      ageRange: "30-39"
    },
    timeAgo: "42 min ago",
    status: "ai guidance ready",
    title: "Ankle pain after football",
    summary:
      "Pain is only in one ankle after football 2 days ago. No fatigue, poor sleep, or brain fog. Looking for safe self-care language and when to seek help.",
    tags: ["ankle pain", "sports injury", "2 days"],
    durationLabel: "2 days",
    triggerLabels: ["Football", "Exercise"],
    question: "What signs would mean I should stop self-care and speak to a clinician?",
    aiGuidance: createGeneralPainGuidance("community-2"),
    comments: [
      {
        id: "community-2-ai",
        author: "Eliza AI",
        authorRole: "openai generated",
        role: "openai generated",
        createdAtLabel: "39 min ago",
        body:
          "This does not currently look like a chronic widespread pain pattern because the pain is recent, localised to one ankle, and started after football. For a GP, pharmacist, or physiotherapist, it would help to record when the injury happened, whether there is swelling or bruising, whether you can bear weight, and whether pain is improving or worsening. While waiting, avoid pushing through pain, protect the ankle, rest as needed, and monitor swelling. Seek medical advice promptly if you cannot bear weight, the ankle looks deformed, swelling is severe, pain is worsening, there is numbness, fever, or signs of infection."
      },
      {
        id: "community-2-clinical",
        author: "Samira K., MSK clinician",
        authorRole: "clinical expert",
        role: "clinical expert",
        createdAtLabel: "29 min ago",
        body:
          "This sounds more like a recent localized injury than a fibromyalgia pattern. Consider rest, gentle protection, and clinical review if swelling, inability to bear weight, deformity, fever, or worsening pain occurs."
      }
    ]
  },
  {
    id: "community-3",
    author: "Anonymous carer",
    authorProfile: {
      id: "actor-carer",
      displayName: "Anonymous carer",
      role: "patient",
      avatarInitial: "C",
      location: "United Kingdom",
      ageRange: "50-59"
    },
    timeAgo: "1 hr ago",
    status: "needs more context",
    title: "Mixed symptoms after a viral illness",
    summary:
      "Mixed symptoms after a viral illness: body aches, sleep disruption, and fatigue. Brain fog is occasional, and the timeline is not yet clear.",
    tags: ["post-viral", "fatigue", "sleep"],
    durationLabel: "Timeline unclear",
    triggerLabels: ["Recent illness", "Poor sleep"],
    question: "What should we track before booking a GP appointment?",
    aiGuidance: createUnclearPatternGuidance("community-3"),
    comments: [
      {
        id: "community-3-ai",
        author: "Eliza AI",
        authorRole: "openai generated",
        role: "openai generated",
        createdAtLabel: "58 min ago",
        body:
          "This is not enough information to suggest a clear pattern yet. Because symptoms began after a viral illness, the most useful next step is to build a timeline. Track when the illness started, when body aches and fatigue began, whether symptoms are improving or worsening, sleep quality, temperature, medication changes, activity tolerance, and impact on daily life. For a GP appointment, bring notes on duration, severity, any fever, weight change, breathlessness, chest pain, weakness, or new neurological symptoms. While waiting, prioritise rest, hydration, gentle activity only if tolerated, and avoid overexertion during recovery."
      },
      {
        id: "community-3-clinical",
        author: "Dr Omar P.",
        authorRole: "clinical expert",
        role: "clinical expert",
        createdAtLabel: "44 min ago",
        body:
          "A clear timeline matters here. Track duration, severity, fever, weight change, medication changes, and functional impact, then use that record during a GP review."
      }
    ]
  }
];
