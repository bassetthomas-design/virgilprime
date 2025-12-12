import { LlmClient } from "./llm_client";
import { LlmGenerateRequest, LlmGenerateResponse } from "./llm_types";

export type LlamaCppClientOptions = {
  baseUrl: string;
  defaults?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
  timeoutMs?: number;
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  if (!ms || ms <= 0) return p;
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`llama.cpp timeout after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

export class LlamaCppClient implements LlmClient {
  constructor(private readonly opt: LlamaCppClientOptions) {}

  async health(): Promise<boolean> {
    try {
      const res = await withTimeout(fetch(`${this.opt.baseUrl}/health`), this.opt.timeoutMs ?? 1500);
      return res.ok;
    } catch {
      return false;
    }
  }

  async generate(req: LlmGenerateRequest): Promise<LlmGenerateResponse> {
    const params = {
      temperature: req.params?.temperature ?? this.opt.defaults?.temperature ?? 0.3,
      top_p: req.params?.top_p ?? this.opt.defaults?.top_p ?? 0.9,
      max_tokens: req.params?.max_tokens ?? this.opt.defaults?.max_tokens ?? 384,
    };

    const body = {
      model: "local",
      messages: req.messages,
      temperature: params.temperature,
      top_p: params.top_p,
      max_tokens: params.max_tokens,
      stream: false,
    };

    const resp = await withTimeout(
      fetch(`${this.opt.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      this.opt.timeoutMs ?? 8000
    );

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`llama.cpp error ${resp.status}: ${txt}`);
    }

    const json = (await resp.json()) as any;
    const text: string = json?.choices?.[0]?.message?.content ?? "";

    return { text, raw: json };
  }
}
