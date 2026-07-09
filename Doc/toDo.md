## Theusday
- should work on gp summary UI
- create the api service?



# eliza To-Do

Goal: make the current Next.js frontend easy to connect to a backend API and LLM without rushing into backend work too early.

The app should keep working as a demo while we refactor. Each step should leave the project buildable.

## Current Architecture

From `doc.md`, eliza should work like this:

```text
User
  -> Next.js / React client
  -> Adaptive questionnaire
  -> Optional document upload
  -> Privacy Guard on the client
  -> Backend API
  -> LLM
  -> Structured JSON
  -> GP summary / community post / AI guidance
```

Current frontend reality:

- `/` shows the homepage and community feed.
- `/questionnaire` collects answers through the chronic pain / fibro fog logic.
- `/summary` lets the user review, edit, print, save privately, or post to the local mock community.
- Most business logic is still grouped in `src/lib/clientFlow.ts`.
- There is no real backend route yet.
- There is no real LLM call yet.
- Local storage is being used as the temporary demo persistence layer.

## What To Do First

### 1. Keep The UI Routes As They Are

Do not rebuild the UI again before the backend boundary is prepared.

Keep:

- `src/app/page.tsx`
- `src/app/questionnaire/page.tsx`
- `src/app/summary/page.tsx`
- `src/components/medicalIntake/*`

The current route flow is good enough for the hackathon:

```text
Home
  -> Questionnaire
  -> Summary review
  -> Print / save PDF or post to community
```

Only polish UI copy or spacing if something is obviously confusing.

### 2. Split `clientFlow.ts` Into Dedicated Frontend Modules

`src/lib/clientFlow.ts` is doing too many jobs. Refactor it into small files before adding backend code.

Create this structure:

```text
src/lib/
  constants/
    storageKeys.ts
  types/
    medical.ts
    report.ts
    community.ts
  questionnaire/
    fibroLogic.ts
    buildQuestionnairePrompt.ts
  privacy/
    privacyGuard.ts
  documents/
    readMedicalDocuments.ts
  storage/
    summaryStorage.ts
    communityStorage.ts
  services/
    analysisService.ts
    mockAnalysisService.ts
```

Move logic like this:

- `FibroLogicInput`, `FibroLogicResult`, and `evaluateFibroLogic` -> `src/lib/questionnaire/fibroLogic.ts`
- generated questionnaire text -> `src/lib/questionnaire/buildQuestionnairePrompt.ts`
- `readMedicalDocuments` -> `src/lib/documents/readMedicalDocuments.ts`
- anonymization / redaction -> `src/lib/privacy/privacyGuard.ts`
- localStorage keys -> `src/lib/constants/storageKeys.ts`
- `SummaryDraft`, `CommunityPost`, report types -> `src/lib/types/*`
- mock LLM behavior -> `src/lib/services/mockAnalysisService.ts`
- future real API call -> `src/lib/services/analysisService.ts`

Keep `clientFlow.ts` temporarily as a re-export file if that makes the refactor safer:

```ts
export * from "./types/medical";
export * from "./types/community";
export * from "./types/report";
export * from "./questionnaire/fibroLogic";
export * from "./documents/readMedicalDocuments";
export * from "./services/analysisService";
```

This lets existing imports keep working while we clean the project gradually.

### 3. Define The API Contract Before Building The Backend

The frontend needs one clear contract for analysis.

Create a shared report type:

```ts
export type ElizaReport = {
  summary: string;
  symptoms: string[];
  timeline: string[];
  dailyImpact: string[];
  triggers: string[];
  treatmentsTried: string[];
  documentFindings: string[];
  gpDiscussionPoints: string[];
  questionsForDoctor: string[];
  selfCare: string[];
  communityPost: string;
  safetyNote: string;
  confidence: "high_fibro_pattern" | "general_chronic_pain" | "needs_review";
};
```

Create request and response types:

```ts
export type AnalyzeRequest = {
  privacy: "private" | "public";
  questionnaireText: string;
  documents: {
    name: string;
    type: string;
    size: number;
    extractedText: string;
  }[];
  redactions: string[];
};

export type AnalyzeResponse = {
  report: ElizaReport;
  trace: string[];
};
```

The frontend should only depend on these types, not on OpenAI-specific details.

### 4. Prepare The Frontend Service Layer

Create:

```text
src/lib/services/analysisService.ts
```

It should expose one function:

```ts
export async function analyzeQuestionnaire(request: AnalyzeRequest): Promise<AnalyzeResponse>
```

For now, make it try the real backend first and fall back to the mock if the backend is not ready:

```text
try POST /api/analyze
  if successful -> return backend report
  if failed -> return mock report
```

Why this matters:

- The UI does not need to change when the backend is added.
- The hackathon demo still works if the API key or Wi-Fi fails.
- Backend work becomes isolated to `/api/analyze`.

### 5. Add Privacy Guard Before The API Call

Before sending data to `/api/analyze`, run Privacy Guard in the frontend.

Privacy Guard should return:

```ts
type PrivacyGuardResult = {
  sanitizedText: string;
  redactions: string[];
};
```

Minimum redactions for the demo:

- email
- phone number
- NHS number
- date of birth
- date patterns
- UK postcode
- `my name is ...`
- `address: ...`

Important rule:

The backend should receive sanitized clinical context, not raw user input.

### 6. Update `/questionnaire` To Use The Service

In `src/app/questionnaire/page.tsx`, replace the current mock flow:

```ts
encryptForAnalysisService(...)
analyzeEncryptedQuestion(...)
```

with:

```ts
const report = await analyzeQuestionnaire({
  privacy,
  questionnaireText: sanitizedQuestionnaireText,
  documents: sanitizedDocuments,
  redactions
});
```

Then save the returned draft to localStorage and route to `/summary`.

The page should not know whether the result came from:

- mock service
- local Next.js API route
- OpenAI
- future backend server

That decision belongs in `analysisService.ts`.

### 7. Update `/summary` To Render Structured Data

The summary page currently edits one large text summary. That is okay for now, but the next better version should store and render a structured `ElizaReport`.

Minimum summary sections:

- Symptom summary
- Timeline
- Daily impact
- Triggers
- Treatments tried
- Uploaded document findings
- GP discussion points
- Questions for doctor
- Self-care guidance
- Safety note
- Community post draft

For the hackathon, keep the editable text area if it is faster. But the saved data model should move toward structured JSON.

### 8. Add The Backend Route After The Frontend Contract Is Stable

Create:

```text
src/app/api/analyze/route.ts
```

The route should:

1. Accept `AnalyzeRequest`.
2. Validate required fields.
3. Refuse requests that look empty.
4. Call the LLM.
5. Ask for structured JSON matching `ElizaReport`.
6. Return `AnalyzeResponse`.
7. Return a useful error if the LLM fails.

The route should never expose the API key to the browser.

Environment variables:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Do not use `NEXT_PUBLIC_OPENAI_API_KEY`.

### 9. LLM Prompt Rules

The LLM should follow these rules:

- Do not diagnose fibromyalgia.
- Say when the pattern is only a possible fibromyalgia-like pattern.
- If the answers do not match widespread chronic pain, keep it as general chronic pain guidance.
- Use patient-friendly language.
- Prepare the user for a GP appointment.
- Recommend urgent care only for clear red-flag symptoms.
- Use only the sanitized context provided.
- Return JSON only.

### 10. Keep Local Storage As The Temporary Database

For tomorrow, localStorage is enough.

Current storage jobs:

- questionnaire answers
- summary draft
- private summaries
- community posts

Later backend jobs:

- real saved private summaries
- real community posts
- authentication
- file storage
- audit logs

Do not build a database until the LLM route works.

## Suggested Build Order

### Phase 1: Refactor Without Changing Behavior

1. Create `src/lib/types/*`.
2. Create `src/lib/constants/storageKeys.ts`.
3. Move fibro logic into `src/lib/questionnaire/fibroLogic.ts`.
4. Move document reading into `src/lib/documents/readMedicalDocuments.ts`.
5. Move mock analysis into `src/lib/services/mockAnalysisService.ts`.
6. Keep `clientFlow.ts` as re-exports so imports do not break.
7. Run `npm run build`.

Success check:

- Existing app still works.
- No UI behavior changes.
- Build passes.

### Phase 2: Add The Frontend API Boundary

1. Add `AnalyzeRequest`, `AnalyzeResponse`, and `ElizaReport`.
2. Create `src/lib/services/analysisService.ts`.
3. Make `analysisService.ts` call `/api/analyze`.
4. Add mock fallback inside `analysisService.ts`.
5. Update `/questionnaire` to call `analyzeQuestionnaire`.
6. Run `npm run build`.

Success check:

- Questionnaire still reaches `/summary`.
- If `/api/analyze` does not exist yet, mock fallback still works.

### Phase 3: Add Backend API

1. Install the OpenAI SDK.
2. Add `.env.local`.
3. Create `src/app/api/analyze/route.ts`.
4. Validate the incoming request.
5. Call the LLM.
6. Return structured JSON.
7. Run `npm run build`.

Success check:

- Frontend calls the backend.
- Backend calls the LLM.
- Summary page receives structured report data.
- Mock fallback still works when the backend fails.

### Phase 4: Presentation Polish

1. Replace remaining placeholder app-name text with `eliza`.
2. Show a Privacy Guard preview or chips.
3. Make summary sections more scannable.
4. Test print / save PDF.
5. Test post to community.
6. Test mobile.

## What Not To Build Yet

Skip these until the basic API and LLM flow works:

- authentication
- database
- OCR for PDFs/images
- real community moderation
- clinician dashboard
- account profiles
- advanced PDF generation library
- payment flow

## Immediate Next Task

Start here:

1. Refactor `src/lib/clientFlow.ts` into dedicated folders.
2. Keep the current app behavior working.
3. Add `analysisService.ts` with a mock fallback.
4. Only then build `/api/analyze`.

This gives the project a clean frontend foundation before the backend and LLM are plugged in.
