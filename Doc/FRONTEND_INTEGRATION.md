# Connecting a frontend to this agent

A guide for wiring **any** frontend (this repo's own mock, or a separate app) up to the deployed
health-agent backend. CORS is confirmed working for direct browser calls from any origin - no
proxy needed.

## Step 1: Get the token

Ask the project owner for the current `OPENCLAW_GATEWAY_TOKEN` value (or find it in
`infra/terraform.tfvars` if you have access to this repo's AWS deployment - it's gitignored, so
it won't be in version control). Every request needs it as a bearer token; there's no other auth
step.

## Step 2: Add env vars

```bash
GATEWAY_URL=https://dt2lozk8ne2zy.cloudfront.net
GATEWAY_TOKEN=<ask project owner>
```

(Name these to match your framework's convention - e.g. `VITE_GATEWAY_URL`/`VITE_GATEWAY_TOKEN`
for Vite, `NEXT_PUBLIC_GATEWAY_URL`/`NEXT_PUBLIC_GATEWAY_TOKEN` for Next.js. See "Auth caveat"
below before shipping either beyond an internal prototype.)

## Step 3: Prove it works before touching frontend code

Run this from your terminal first. If it doesn't work here, it won't work in the browser either
- fix it at this layer before debugging frontend code:

```bash
curl https://dt2lozk8ne2zy.cloudfront.net/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "model": "openclaw/default",
    "messages": [{"role": "user", "content": "In one sentence, what is fibromyalgia?"}],
    "stream": false,
    "user": "curl-test-1"
  }'
```

Expect a JSON response in 5-20 seconds (the agent does real reasoning, not a mocked delay).

## Step 4: The fetch call

```ts
const res = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${GATEWAY_TOKEN}`,
  },
  body: JSON.stringify({
    model: "openclaw/default",   // fixed string - addresses the OpenClaw agent, not an LLM model directly
    messages: [{ role: "user", content: question }],
    stream: false,                 // or true for SSE streaming - see below
    user: sessionId,               // stable per-conversation id (crypto.randomUUID(), persisted in localStorage)
  }),
});
const data = await res.json();
const answer = data.choices[0].message.content;
```

Passing a stable `user` value lets the agent's own session/memory carry over between calls -
without it, each request is treated as a fresh session. Reuse the same value across a
conversation; generate a new one for a genuinely new conversation.

### Streaming (optional)

Set `stream: true` and the response becomes `text/event-stream`, standard OpenAI-style chunks:

```
data: {"choices":[{"delta":{"content":"..."}}]}

data: [DONE]
```

Read it with `res.body.getReader()`, split on `\n`, parse lines starting with `data: `, stop at
`data: [DONE]`. Full working example: `frontend/src/api/client.ts` in this repo.

## The approval-flow convention

When the agent can't confidently answer, it drafts a short forum question and prefixes its reply
with the literal marker `APPROVAL NEEDED:`:

```ts
const marker = "APPROVAL NEEDED:";
if (answer.includes(marker)) {
  const draft = answer.split(marker)[1]?.trim();
  // render draft text + Approve/Reject buttons
}
```

Clicking Approve/Reject just sends `"Approved."` or `"Rejected."` as the *next* chat message
(same `user` session id) - not a separate endpoint call. See `frontend/src/components/ApprovalPrompt.tsx`
for a working implementation.

## What has no real backend equivalent yet

- **Encrypted request payloads**: nothing on the backend receives or decrypts a custom
  client-side envelope. TLS already encrypts the request in transit; medical-record encryption
  (KMS + AES-256-GCM) happens server-side, at rest, only for records the agent is told to store.
- **Document upload/attachment**: no upload endpoint exists. Medical records are only stored via
  the agent being told about them in a chat message (see `skills/medical-records/SKILL.md`).
- **Session/question history**: no "list past conversations" endpoint. That's a frontend-side
  concern for now.

## Auth caveat

Shipping the gateway token to a browser bundle (`VITE_*`/`NEXT_PUBLIC_*`/etc.) means anyone who
opens devtools can read it. Fine for an internal prototype; before anything wider, add a
server-side proxy route that holds the token and forwards the request, so the browser never
sees it.

## CORS (already solved, FYI)

OpenClaw's own docs say the gateway isn't designed for direct browser access. CloudFront sits in
front of it as a reverse proxy and handles CORS itself - two small CloudFront Functions (see
`infra/main.tf`'s `cors_preflight` and `cors_add_headers` functions), one answering preflight
`OPTIONS`, one adding `Access-Control-Allow-Origin` to real responses. Nothing to do here; it's
already open to any origin, since the bearer token is the real access control, not CORS.
