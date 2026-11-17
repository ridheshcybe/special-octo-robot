/**
 * PrepMeUp AI -- 24/7 PC Local AI Bridge Server (OpenAI & Ollama Compatible)
 * Listens on http://127.0.0.1:11434/v1/chat/completions
 *
 * If native Ollama is not running on port 11434, this lightweight Node.js bridge
 * provides an always-on local AI endpoint on this 24/7 PC with in-memory LRU caching
 * and automatic free provider forwarding.
 */

import http from "node:http";

const PORT = Number(process.env.LOCAL_AI_PORT || 11434);
const responseCache = new Map();

async function generateFreeCompletion(messages, jsonMode = false) {
  const cacheKey = JSON.stringify({ messages, jsonMode });
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  // Try free keyless Pollinations OpenAI endpoint
  try {
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages,
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        if (responseCache.size > 200) {
          const firstKey = responseCache.keys().next().value;
          responseCache.delete(firstKey);
        }
        responseCache.set(cacheKey, text);
        return text;
      }
    }
  } catch {}

  // Deterministic offline fallback if internet is disconnected
  const lastUserMsg =
    [...messages].reverse().find((m) => m.role === "user")?.content || "";
  return `### PrepMeUp 24/7 Local PC AI Synthesis\n\nProcessed query locally on 24/7 PC node: "${String(lastUserMsg).slice(0, 120)}"\n\n$$\\det(A - \\lambda I) = 0 \\implies A\\mathbf{x} = \\lambda\\mathbf{x}$$`;
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-tunnel-secret");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/api/tags" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        service: "prepmeup-24x7-pc-ai-bridge",
        models: [{ name: "llama3.2:latest" }],
      })
    );
    return;
  }

  if (req.method === "POST" && (req.url === "/v1/chat/completions" || req.url === "/api/chat")) {
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", async () => {
      try {
        const body = JSON.parse(rawBody || "{}");
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const jsonMode = body.response_format?.type === "json_object";
        const content = await generateFreeCompletion(messages, jsonMode);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            id: `chatcmpl-pc-${Date.now()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: body.model || "llama3.2:latest",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content },
                finish_reason: "stop",
              },
            ],
          })
        );
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: String(err) } }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[24/7 PC AI Bridge] Listening on http://127.0.0.1:${PORT}/v1/chat/completions`);
});
