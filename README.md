# Zoe Assist Kickoff

A frontend-only Next.js prototype for medical question intake, optional document upload, browser-side encryption, mock analysis-service routing, anonymized external escalation, public/private targeting, and question history.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Flow

1. The user submits a medical question and optionally attaches documents.
2. The browser packages the question and documents, then encrypts the package with Web Crypto AES-GCM.
3. A mock analysis service receives the encrypted package and decides between a quick answer or external analysis.
4. Quick answers are displayed immediately.
5. External analysis uses a summarized/anonymized version of the question and documents, then sends it to mock external targets.
6. If the user marks the question public, the anonymized version may be sent to public targets. If private, public targets are skipped.
7. The history panel shows all of the user's prior questions and public questions from other users.

## TLS And Encryption

TLS/SSL protects the connection in transit. For sensitive medical documents, application-level encryption can still be useful because it protects the payload before it reaches service logs, queues, object storage, analytics, or downstream targets.

For a real service, prefer TLS plus service-owned public-key encryption or an SDK from the analysis service. Do not put LLM API keys in a frontend app.

## Notes

- The current analysis service and external targets are mocked in browser code.
- Text extraction is intentionally small: text-like files are extracted directly, while binary files are represented by metadata unless you add a parser.
- Anonymization is regex-based and conservative, not a guarantee. Use a dedicated PHI/PII redaction service before sending real sensitive medical documents to external systems.
- The local medical answer path is intentionally limited to general information and should not be treated as clinical advice.
