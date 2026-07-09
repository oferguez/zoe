import { NextResponse } from "next/server";

// Server-side only. Never expose GATEWAY_TOKEN via a NEXT_PUBLIC_* var - see the "Auth caveat"
// in Doc/FRONTEND_INTEGRATION.md. This route holds the token and forwards to the gateway so the
// browser never sees it.
const GATEWAY_URL = process.env.GATEWAY_URL;
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;

type ChatRequestBody = {
  message?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  if (!GATEWAY_URL || !GATEWAY_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Chat gateway is not configured. Set GATEWAY_URL and GATEWAY_TOKEN in .env.local (see Doc/FRONTEND_INTEGRATION.md)."
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
  const message = body?.message?.trim();
  const sessionId = body?.sessionId?.trim();

  if (!message || !sessionId) {
    return NextResponse.json({ error: "message and sessionId are required." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GATEWAY_TOKEN}`
      },
      body: JSON.stringify({
        model: "openclaw/default",
        messages: [{ role: "user", content: message }],
        stream: false,
        user: sessionId
      })
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the chat gateway." }, { status: 502 });
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `Gateway returned ${upstream.status}.${detail ? ` ${detail}` : ""}` },
      { status: 502 }
    );
  }

  const data = await upstream.json();
  const answer: string = data?.choices?.[0]?.message?.content ?? "";

  if (!answer) {
    return NextResponse.json({ error: "Gateway returned an empty response." }, { status: 502 });
  }

  return NextResponse.json({ answer });
}
