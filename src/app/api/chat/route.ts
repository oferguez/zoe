import { NextRequest } from "next/server";

// Server-side proxy to the deployed health-agent gateway. The bearer token lives only in
// GATEWAY_TOKEN (no NEXT_PUBLIC_ prefix, so Next.js never inlines it into the client bundle) —
// the browser calls this same-origin route instead of the gateway directly, and the token is
// attached here, server-side, where the client can never see it.

const GATEWAY_URL = process.env.GATEWAY_URL ?? "https://dt2lozk8ne2zy.cloudfront.net";
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN;

export async function POST(request: NextRequest) {
  if (!GATEWAY_TOKEN) {
    return Response.json(
      { error: "GATEWAY_TOKEN is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await request.json();

  const upstream = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GATEWAY_TOKEN}`
    },
    body: JSON.stringify(body)
  });

  if (body.stream) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    });
  }

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
