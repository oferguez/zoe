# Zoe Assist Kickoff

A minimal full-stack Next.js app for question intake, optional encrypted document upload, routing through a configurable decision module, approval-gated external LLM escalation, anonymization, and answer presentation.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Flow

1. The user submits a question and optional documents.
2. `/api/intake` reads the request, encrypts retained question/document payloads with AES-256-GCM, and asks the decision module what to do.
3. The default heuristic decision module either answers locally, asks for documents, or drafts an external prompt for user approval.
4. If the user approves, `/api/escalate` decrypts the retained package, anonymizes the approved prompt and extracted document text, then calls the configured large-model provider.
5. The UI displays the returned answer.

## Configuration

Copy `.env.example` to `.env.local` and set at least:

```bash
APP_SECRET=replace-with-a-long-random-secret
DOCUMENT_ENCRYPTION_KEY=$(openssl rand -base64 32)
```

By default, routing is heuristic and the large LLM is mocked. To use OpenAI-compatible providers:

```bash
SMALL_LLM_PROVIDER=openai-compatible
SMALL_LLM_API_KEY=...
SMALL_LLM_MODEL=...

LARGE_LLM_PROVIDER=openai-compatible
LARGE_LLM_API_KEY=...
LARGE_LLM_MODEL=...
```

The provider URLs, upload limits, local-answer threshold, case TTL, and high-risk/document-request keywords are all environment-configurable.

## Notes

- This kickoff stores retained cases in process memory. Replace `src/lib/caseStore.ts` with a database-backed store before production use.
- Uploaded file bytes are encrypted before retention. Text extraction is intentionally small: text-like files are extracted directly, while binary files are encrypted and represented by metadata unless you add a parser.
- Anonymization is regex-based and conservative, not a guarantee. Use a dedicated PHI/PII redaction service before sending real sensitive medical documents to external systems.
- The local medical answer path is intentionally limited to general information and should not be treated as clinical advice.
