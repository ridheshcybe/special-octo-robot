/**
 * Unified Free Multi-Provider & 24/7 Local PC Tunnel AI Router for PrepMeUp AI.
 *
 * Automatically cascades across free AI providers and local PC tunnel endpoints
 * whenever a provider is unconfigured, rate-limited (HTTP 429), or unreachable:
 *   1. Local 24/7 PC Tunnel / Ollama / LM Studio (100% Free, Unlimited Local GPU/CPU)
 *   2. Groq Free Cloud Tier (Multi-model cascade: Llama 3.3 70B -> Llama 4 Scout -> Llama 3.1 8B)
 *   3. Google Gemini Free Tier (Multi-model cascade: Gemini 2.5 Flash -> Gemini 2.0 Flash)
 *   4. OpenRouter Free Models (:free endpoints)
 *   5. Pollinations Free Keyless OpenAI Endpoint (Zero API key required fallback)
 */

export type AIProviderId =
  | "local_pc_tunnel"
  | "groq_free"
  | "gemini_free"
  | "openrouter_free"
  | "pollinations_free";

export interface AIProviderStatus {
  id: AIProviderId;
  name: string;
  isFree: true;
  configured: boolean;
  healthy: boolean;
  cooldownUntil: number;
  successCount: number;
  failureCount: number;
  lastLatencyMs?: number;
  lastModelUsed?: string;
  lastError?: string;
  endpoint?: string;
}

export interface UnifiedAIRequest {
  systemInstruction?: string;
  userPrompt: string;
  imageBase64?: string | null;
  imageMimeType?: string;
  jsonMode?: boolean;
  maxTokens?: number;
  temperature?: number;
  preferredProvider?: AIProviderId;
}

export interface UnifiedAIResponse {
  text: string;
  providerUsed: AIProviderId;
  modelUsed: string;
  latencyMs: number;
  attemptedProviders: string[];
}

interface ProviderRuntimeMetrics {
  cooldownUntil: number;
  successCount: number;
  failureCount: number;
  lastLatencyMs?: number;
  lastModelUsed?: string;
  lastError?: string;
}

const runtimeMetrics: Record<AIProviderId, ProviderRuntimeMetrics> = {
  local_pc_tunnel: { cooldownUntil: 0, successCount: 0, failureCount: 0 },
  groq_free: { cooldownUntil: 0, successCount: 0, failureCount: 0 },
  gemini_free: { cooldownUntil: 0, successCount: 0, failureCount: 0 },
  openrouter_free: { cooldownUntil: 0, successCount: 0, failureCount: 0 },
  pollinations_free: { cooldownUntil: 0, successCount: 0, failureCount: 0 },
};

let customTunnelUrlOverride: string | null = null;
let customLocalModelOverride: string | null = null;

export function setCustomPcTunnelConfig(url: string | null, model?: string | null) {
  customTunnelUrlOverride = url ? url.trim().replace(/\/+$/, "") : null;
  if (model !== undefined) {
    customLocalModelOverride = model ? model.trim() : null;
  }
  runtimeMetrics.local_pc_tunnel.cooldownUntil = 0;
}

export function getLocalPcTunnelConfig(): {
  url: string;
  model: string;
  secret: string;
  enabled: boolean;
} {
  const url = (
    customTunnelUrlOverride ||
    process.env.LOCAL_AI_TUNNEL_URL ||
    process.env.OLLAMA_BASE_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  const model =
    customLocalModelOverride ||
    process.env.LOCAL_AI_MODEL ||
    process.env.OLLAMA_MODEL ||
    "llama3.1:8b";

  const secret = process.env.LOCAL_AI_TUNNEL_SECRET || "";

  return {
    url: url || "http://127.0.0.1:11434",
    model,
    secret,
    enabled: true,
  };
}

function markSuccess(provider: AIProviderId, model: string, latencyMs: number) {
  const m = runtimeMetrics[provider];
  m.cooldownUntil = 0;
  m.successCount += 1;
  m.lastLatencyMs = latencyMs;
  m.lastModelUsed = model;
  m.lastError = undefined;
}

function markFailure(provider: AIProviderId, errorMsg: string, cooldownSec = 45) {
  const m = runtimeMetrics[provider];
  m.failureCount += 1;
  m.lastError = errorMsg.slice(0, 220);
  m.cooldownUntil = Date.now() + cooldownSec * 1000;
}

function isOnCooldown(provider: AIProviderId): boolean {
  return Date.now() < runtimeMetrics[provider].cooldownUntil;
}

/**
 * 1. Local 24/7 PC Tunnel (Ollama / LM Studio / vLLM / Cloudflare Tunnel)
 */
async function tryLocalPcTunnel(req: UnifiedAIRequest): Promise<UnifiedAIResponse> {
  const cfg = getLocalPcTunnelConfig();
  const baseUrl = cfg.url || "http://127.0.0.1:11434";

  const candidateModels = req.imageBase64
    ? Array.from(new Set(["gemma4:latest", "gemma4:e4b", "gemma4:12b", cfg.model]))
    : Array.from(
        new Set([
          cfg.model,
          "llama3.1:8b",
          "qwen2.5-coder:latest",
          "gemma4:latest",
          "qwen2.5:7b",
          "deepseek-r1:8b",
          "qwen2.5-coder:3b",
        ])
      );

  const endpoint = baseUrl.endsWith("/v1/chat/completions")
    ? baseUrl
    : `${baseUrl}/v1/chat/completions`;

  const userContent: any = req.imageBase64
    ? [
        { type: "text", text: req.userPrompt },
        {
          type: "image_url",
          image_url: {
            url: `data:${req.imageMimeType || "image/jpeg"};base64,${req.imageBase64}`,
          },
        },
      ]
    : req.userPrompt;

  const messages: any[] = [];
  if (req.systemInstruction) {
    messages.push({ role: "system", content: req.systemInstruction });
  }
  messages.push({ role: "user", content: userContent });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cfg.secret) {
    headers["Authorization"] = `Bearer ${cfg.secret}`;
    headers["x-tunnel-secret"] = cfg.secret;
  }

  let lastErr = "Local PC Tunnel unreachable";

  for (const model of candidateModels) {
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature: req.temperature ?? 0.2,
          max_tokens: req.maxTokens ?? 2048,
          ...(req.jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: controller.signal,
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const text =
          json.choices?.[0]?.message?.content ||
          json.message?.content ||
          json.response ||
          "";
        if (text) {
          const latencyMs = Date.now() - start;
          markSuccess("local_pc_tunnel", model, latencyMs);
          return {
            text,
            providerUsed: "local_pc_tunnel",
            modelUsed: `local-pc/${model}`,
            latencyMs,
            attemptedProviders: [`local_pc_tunnel/${model}`],
          };
        }
      } else {
        const errText = await res.text().catch(() => "");
        lastErr = `Local PC (${model}) HTTP ${res.status}: ${errText.slice(0, 120)}`;
        // If connection succeeded but model wasn't found (404), try next local model in cascade
        if (res.status !== 404 && res.status !== 400) break;
      }
    } catch (e: any) {
      lastErr = e?.message || "Local PC connection refused";
      break;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(lastErr);
}

/**
 * 2. Groq Free Tier (Multi-Model Automatic Cascade)
 */
async function tryGroqFreeCascade(req: UnifiedAIRequest): Promise<UnifiedAIResponse> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  // Cascade of free Groq models (automatically switches if one model is rate-limited)
  const modelsToTry = req.imageBase64
    ? [
        "meta-llama/llama-4-scout-17b-16e-instruct",
        "meta-llama/llama-4-maverick-17b-128e-instruct",
      ]
    : [
        "llama-3.3-70b-versatile",
        "meta-llama/llama-4-scout-17b-16e-instruct",
        "llama-3.1-8b-instant",
        "gemma2-9b-it",
      ];

  let lastErr = "Groq cascade failed";

  for (const model of modelsToTry) {
    const start = Date.now();
    const userContent: any = req.imageBase64
      ? [
          { type: "text", text: req.userPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${req.imageMimeType || "image/jpeg"};base64,${req.imageBase64}`,
            },
          },
        ]
      : req.userPrompt;

    const payload: any = {
      model,
      messages: [
        ...(req.systemInstruction ? [{ role: "system", content: req.systemInstruction }] : []),
        { role: "user", content: userContent },
      ],
      temperature: req.temperature ?? 0.2,
      max_tokens: Math.min(req.maxTokens ?? 4096, 8192),
    };

    if (req.jsonMode && !req.imageBase64) {
      payload.response_format = { type: "json_object" };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) {
          const latencyMs = Date.now() - start;
          markSuccess("groq_free", model, latencyMs);
          return {
            text,
            providerUsed: "groq_free",
            modelUsed: `groq/${model}`,
            latencyMs,
            attemptedProviders: [`groq/${model}`],
          };
        }
      } else {
        const errBody = await res.text().catch(() => "");
        lastErr = `Groq ${model} [${res.status}]: ${errBody.slice(0, 120)}`;
      }
    } catch (e: any) {
      lastErr = e?.message || "Groq network exception";
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(lastErr);
}

/**
 * 3. Google Gemini Free Tier (Multi-Model Automatic Cascade)
 */
async function tryGeminiFreeCascade(req: UnifiedAIRequest): Promise<UnifiedAIResponse> {
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    ""
  ).trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastErr = "Gemini cascade failed";

  for (const model of modelsToTry) {
    const start = Date.now();
    const parts: any[] = [{ text: req.userPrompt }];
    if (req.imageBase64) {
      parts.push({
        inline_data: {
          mime_type: req.imageMimeType || "image/jpeg",
          data: req.imageBase64,
        },
      });
    }

    const payload: any = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: req.temperature ?? 0.2,
        topP: 0.95,
        maxOutputTokens: req.maxTokens ?? 4096,
        ...(req.jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    };

    if (req.systemInstruction) {
      payload.systemInstruction = {
        role: "system",
        parts: [{ text: req.systemInstruction }],
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 16000);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const latencyMs = Date.now() - start;
          markSuccess("gemini_free", model, latencyMs);
          return {
            text,
            providerUsed: "gemini_free",
            modelUsed: `gemini/${model}`,
            latencyMs,
            attemptedProviders: [`gemini/${model}`],
          };
        }
      } else {
        const errBody = await res.text().catch(() => "");
        lastErr = `Gemini ${model} [${res.status}]: ${errBody.slice(0, 120)}`;
      }
    } catch (e: any) {
      lastErr = e?.message || "Gemini network exception";
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(lastErr);
}

/**
 * 4. OpenRouter Free Tier (:free models)
 */
async function tryOpenRouterFree(req: UnifiedAIRequest): Promise<UnifiedAIResponse> {
  const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const freeModels = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "deepseek/deepseek-r1:free",
  ];

  let lastErr = "OpenRouter free cascade failed";

  for (const model of freeModels) {
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.PMU_APP_URL || "http://localhost:3000",
          "X-Title": "PrepMeUp AI",
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(req.systemInstruction ? [{ role: "system", content: req.systemInstruction }] : []),
            { role: "user", content: req.userPrompt },
          ],
          temperature: req.temperature ?? 0.2,
        }),
        signal: controller.signal,
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) {
          const latencyMs = Date.now() - start;
          markSuccess("openrouter_free", model, latencyMs);
          return {
            text,
            providerUsed: "openrouter_free",
            modelUsed: `openrouter/${model}`,
            latencyMs,
            attemptedProviders: [`openrouter/${model}`],
          };
        }
      } else {
        const errBody = await res.text().catch(() => "");
        lastErr = `OpenRouter ${model} [${res.status}]: ${errBody.slice(0, 120)}`;
      }
    } catch (e: any) {
      lastErr = e?.message || "OpenRouter network exception";
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error(lastErr);
}

/**
 * 5. Pollinations Free Keyless OpenAI-Compatible Endpoint (Zero API Key Needed)
 */
async function tryPollinationsFree(req: UnifiedAIRequest): Promise<UnifiedAIResponse> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16000);

  try {
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          ...(req.systemInstruction
            ? [
                {
                  role: "system",
                  content: req.jsonMode
                    ? `${req.systemInstruction}\nReturn ONLY raw valid JSON without markdown code fences.`
                    : req.systemInstruction,
                },
              ]
            : []),
          { role: "user", content: req.userPrompt },
        ],
        temperature: req.temperature ?? 0.2,
        ...(req.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Pollinations Free HTTP ${res.status}`);
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content || "";
    if (!text) {
      throw new Error("Pollinations returned empty response");
    }

    const latencyMs = Date.now() - start;
    markSuccess("pollinations_free", "openai-free", latencyMs);
    return {
      text,
      providerUsed: "pollinations_free",
      modelUsed: "pollinations/openai-free",
      latencyMs,
      attemptedProviders: ["pollinations_free"],
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Main Entry Point: Automatically routes and fails over across all free AI providers
 * and the 24/7 Local PC Tunnel.
 */
export async function callUnifiedFreeAI(req: UnifiedAIRequest): Promise<UnifiedAIResponse> {
  const tunnelCfg = getLocalPcTunnelConfig();
  const hasGroq = Boolean((process.env.GROQ_API_KEY || "").trim());
  const hasGemini = Boolean(
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "").trim()
  );
  const hasOpenRouter = Boolean((process.env.OPENROUTER_API_KEY || "").trim());

  // Build ordered priority list of providers
  const candidateOrder: AIProviderId[] = [];

  if (req.preferredProvider) {
    candidateOrder.push(req.preferredProvider);
  }

  // If 24/7 PC tunnel is configured, prioritize it first for 100% free unlimited local compute
  if (tunnelCfg.enabled && !candidateOrder.includes("local_pc_tunnel")) {
    candidateOrder.push("local_pc_tunnel");
  }
  if (hasGroq && !candidateOrder.includes("groq_free")) {
    candidateOrder.push("groq_free");
  }
  if (hasGemini && !candidateOrder.includes("gemini_free")) {
    candidateOrder.push("gemini_free");
  }
  if (hasOpenRouter && !candidateOrder.includes("openrouter_free")) {
    candidateOrder.push("openrouter_free");
  }
  // Always include keyless Pollinations Free and Localhost Ollama probe as final fallbacks
  if (!candidateOrder.includes("pollinations_free")) {
    candidateOrder.push("pollinations_free");
  }
  if (!candidateOrder.includes("local_pc_tunnel")) {
    candidateOrder.push("local_pc_tunnel");
  }

  const attempted: string[] = [];
  const errors: string[] = [];

  // Pass 1: Try providers not currently on cooldown
  for (const providerId of candidateOrder) {
    if (isOnCooldown(providerId)) continue;
    attempted.push(providerId);

    try {
      if (providerId === "local_pc_tunnel") {
        const res = await tryLocalPcTunnel(req);
        return { ...res, attemptedProviders: attempted };
      }
      if (providerId === "groq_free") {
        const res = await tryGroqFreeCascade(req);
        return { ...res, attemptedProviders: attempted };
      }
      if (providerId === "gemini_free") {
        const res = await tryGeminiFreeCascade(req);
        return { ...res, attemptedProviders: attempted };
      }
      if (providerId === "openrouter_free") {
        const res = await tryOpenRouterFree(req);
        return { ...res, attemptedProviders: attempted };
      }
      if (providerId === "pollinations_free") {
        const res = await tryPollinationsFree(req);
        return { ...res, attemptedProviders: attempted };
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      errors.push(`${providerId}: ${msg}`);
      markFailure(providerId, msg, providerId === "local_pc_tunnel" && !tunnelCfg.enabled ? 120 : 30);
    }
  }

  throw new Error(`All free AI providers exhausted. Details: ${errors.join(" | ")}`);
}

/**
 * Returns live status of all free AI providers + 24/7 PC tunnel configuration.
 */
export function getAIProviderRouterStatus(): {
  tunnelConfig: ReturnType<typeof getLocalPcTunnelConfig>;
  providers: AIProviderStatus[];
} {
  const tunnelCfg = getLocalPcTunnelConfig();
  const now = Date.now();

  const providers: AIProviderStatus[] = [
    {
      id: "local_pc_tunnel",
      name: "24/7 Local PC Tunnel (Ollama / LM Studio / vLLM)",
      isFree: true,
      configured: tunnelCfg.enabled,
      healthy: now >= runtimeMetrics.local_pc_tunnel.cooldownUntil,
      cooldownUntil: runtimeMetrics.local_pc_tunnel.cooldownUntil,
      successCount: runtimeMetrics.local_pc_tunnel.successCount,
      failureCount: runtimeMetrics.local_pc_tunnel.failureCount,
      lastLatencyMs: runtimeMetrics.local_pc_tunnel.lastLatencyMs,
      lastModelUsed: runtimeMetrics.local_pc_tunnel.lastModelUsed || tunnelCfg.model,
      lastError: runtimeMetrics.local_pc_tunnel.lastError,
      endpoint: tunnelCfg.url || "http://127.0.0.1:11434",
    },
    {
      id: "groq_free",
      name: "Groq Free Cloud (Llama 3.3 70B → Llama 4 Scout → Llama 3.1 8B)",
      isFree: true,
      configured: Boolean((process.env.GROQ_API_KEY || "").trim()),
      healthy: now >= runtimeMetrics.groq_free.cooldownUntil,
      cooldownUntil: runtimeMetrics.groq_free.cooldownUntil,
      successCount: runtimeMetrics.groq_free.successCount,
      failureCount: runtimeMetrics.groq_free.failureCount,
      lastLatencyMs: runtimeMetrics.groq_free.lastLatencyMs,
      lastModelUsed: runtimeMetrics.groq_free.lastModelUsed || "llama-3.3-70b-versatile",
      lastError: runtimeMetrics.groq_free.lastError,
    },
    {
      id: "gemini_free",
      name: "Google Gemini Free Tier (Gemini 2.5 Flash → 2.0 Flash)",
      isFree: true,
      configured: Boolean(
        (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "").trim()
      ),
      healthy: now >= runtimeMetrics.gemini_free.cooldownUntil,
      cooldownUntil: runtimeMetrics.gemini_free.cooldownUntil,
      successCount: runtimeMetrics.gemini_free.successCount,
      failureCount: runtimeMetrics.gemini_free.failureCount,
      lastLatencyMs: runtimeMetrics.gemini_free.lastLatencyMs,
      lastModelUsed: runtimeMetrics.gemini_free.lastModelUsed || "gemini-2.5-flash",
      lastError: runtimeMetrics.gemini_free.lastError,
    },
    {
      id: "openrouter_free",
      name: "OpenRouter Free Models (:free Tier)",
      isFree: true,
      configured: Boolean((process.env.OPENROUTER_API_KEY || "").trim()),
      healthy: now >= runtimeMetrics.openrouter_free.cooldownUntil,
      cooldownUntil: runtimeMetrics.openrouter_free.cooldownUntil,
      successCount: runtimeMetrics.openrouter_free.successCount,
      failureCount: runtimeMetrics.openrouter_free.failureCount,
      lastLatencyMs: runtimeMetrics.openrouter_free.lastLatencyMs,
      lastModelUsed:
        runtimeMetrics.openrouter_free.lastModelUsed || "meta-llama/llama-3.3-70b-instruct:free",
      lastError: runtimeMetrics.openrouter_free.lastError,
    },
    {
      id: "pollinations_free",
      name: "Pollinations Free Keyless AI (Zero-Config Fallback)",
      isFree: true,
      configured: true,
      healthy: now >= runtimeMetrics.pollinations_free.cooldownUntil,
      cooldownUntil: runtimeMetrics.pollinations_free.cooldownUntil,
      successCount: runtimeMetrics.pollinations_free.successCount,
      failureCount: runtimeMetrics.pollinations_free.failureCount,
      lastLatencyMs: runtimeMetrics.pollinations_free.lastLatencyMs,
      lastModelUsed: runtimeMetrics.pollinations_free.lastModelUsed || "openai-free",
      lastError: runtimeMetrics.pollinations_free.lastError,
    },
  ];

  return {
    tunnelConfig: tunnelCfg,
    providers,
  };
}
