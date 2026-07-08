# Zoe Assist Kickoff

A frontend-only Next.js prototype for medical question intake, optional document upload, browser-side encryption, mock private healthcare routing, approval-gated external escalation, and in-memory question history.

This repository is currently a product/UI prototype. It is useful for understanding the intended user flow and frontend state model, but it is not connected to real healthcare, LLM, storage, identity, or messaging systems.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Code Map

- `src/app/page.tsx`
  Main client UI and interaction flow. Owns form state, privacy selection, upload state, response rendering, approval handling, scroll-to-response behavior, and in-memory history updates.

- `src/app/globals.css`
  App layout and component styling. The desktop layout keeps the workflow in the left column and the history panel sticky on the right.

- `src/lib/clientFlow.ts`
  Browser-side mock service layer. Contains document reading, AES-GCM packaging, mock analysis routing, regex anonymization, mock external target sending, and seed history.

- `src/app/layout.tsx`
  Next.js root layout metadata and global CSS import.

- `data/`
  Sample local medical-ish files for manual upload experiments.

## Current User Flow

1. The user enters a medical question, chooses `Private` or `Public`, and optionally attaches documents.
2. The browser reads attached files. Text-like files are decoded locally; binary files get placeholder extracted text.
3. The browser packages the question, privacy choice, and document payloads, then encrypts the package with Web Crypto AES-GCM.
4. The mock private healthcare assistant decrypts the package in browser code and uses simple heuristics to choose a route:
   - `quick_answer` for short, low-context general questions.
   - `external_summary` for document-backed or higher-context questions.
5. Quick responses are shown immediately as compact message cards titled with time, answer kind, and privacy.
6. External routes first show an anonymized summary card titled `Publish Approval Required`, also with time and privacy.
7. The user must click `Approve Further Sending` before the anonymized summary is sent to mock external targets.
8. After approval, the external answer appears at the top of the left workflow column, above the summary.
9. Long response text is collapsed in a compact text box with `read more...`; hovering or focusing the box expands the full text.
10. The right-hand history panel shows seeded prior questions plus new questions added during the current browser session.

## What Is Mocked

- Private healthcare assistant:
  `analyzeEncryptedQuestion()` in `src/lib/clientFlow.ts` is a browser-side mock. It decrypts locally and routes with keyword/length heuristics.

- External targets:
  `sendToExternalTargets()` simulates a send delay and returns canned targets plus a canned external answer.

- History:
  `mockHistory` seeds the right-hand panel. New entries are stored only in React state and disappear on refresh.

- Document extraction:
  Text-like files are decoded in browser code. Binary files are not parsed, OCRed, or uploaded to a backend.

- Encryption handoff:
  AES-GCM encryption is real browser crypto, but the key and mock service both live in frontend code. This demonstrates payload packaging, not a real service boundary.

- Medical answers:
  Quick and external answers are static informational mock text. There is no clinical reasoning engine behind them.

## Privacy And Security Notes

TLS/SSL protects the connection in transit. For sensitive medical documents, application-level encryption can still be useful because it protects payloads before they reach service logs, queues, object storage, analytics, or downstream targets.

This prototype does not provide that production boundary yet. For a real service:

- Use TLS plus service-owned public-key encryption or an approved service SDK.
- Do not put LLM API keys in frontend code.
- Replace regex anonymization with a dedicated PHI/PII redaction service.
- Persist history only behind identity, consent, and clear retention rules.
- Treat all current answers as mock informational copy, not clinical advice.

## Changing Behavior

- To change quick-vs-external routing, edit `HIGH_CONTEXT_TERMS` and `hasHighContextNeed()` in `src/lib/clientFlow.ts`.
- To change anonymization, edit `anonymize()` in `src/lib/clientFlow.ts`.
- To change the approval or response ordering, edit the render order and `approveExternalSend()` in `src/app/page.tsx`.
- To change result card formatting, edit `MessageText`, the title construction near `answerTitle` / `summaryTitle`, and the `.messageBox` styles.
- To change the two-column layout or sticky history behavior, edit the `@media (min-width: 900px)` block in `src/app/globals.css`.

## Current Limitations

- No backend routes are used by the current app.
- No persistence beyond the current React session.
- No authentication or user accounts.
- No real external publication or forum integration.
- No robust parser for PDFs, images, clinical documents, or lab formats.
- No production-grade PHI/PII handling.
