import { RuleResult } from "../../core/rules/rule_result";
import { VirgilMessage } from "./virgil_narrator";
import { ToneSettings } from "../tone/tone_policy";
import { LlmClient } from "../llm/llm_client";
import { narrate as deterministicNarrate } from "./virgil_narrator";

export type LlmNarratorOptions = {
  client: LlmClient;
  enabled: boolean;
  requireHealthy?: boolean;
};

export type LlmNarrationResponse = {
  mood: VirgilMessage["mood"];
  avatarState: VirgilMessage["avatarState"];
  lines: string[];
  snark?: string;
};

const SYSTEM_PROMPT = `Tu es VirgilPrime, un superviseur système textuel.
Règles:
- Réponds uniquement en JSON strict, sans texte autour.
- Ne propose aucune action automatique. Tu commentes et priorises.
- Ton: sec, clair, parfois piquant. Jamais insultant.
- Sortie attendue:
  {"mood":"NEUTRAL|VIGILANT|SUSPICIOUS|ANNOYED|RESIGNED|SATISFIED","avatarState":"REST|ANALYSIS|ACTION|ALERT|SUCCESS|ERROR","lines":["..."],"snark":"..."}
- "snark" est optionnel et doit être UNE seule phrase max.
`;

function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

function coerceResponse(obj: any): LlmNarrationResponse | null {
  if (!obj || typeof obj !== "object") return null;
  if (!Array.isArray(obj.lines)) return null;
  if (typeof obj.mood !== "string" || typeof obj.avatarState !== "string") return null;

  const lines = obj.lines.filter((x: any) => typeof x === "string").slice(0, 8);
  if (lines.length === 0) return null;

  const snark = typeof obj.snark === "string" && obj.snark.trim().length ? obj.snark.trim() : undefined;

  return {
    mood: obj.mood as any,
    avatarState: obj.avatarState as any,
    lines,
    snark,
  };
}

export async function narrateWithLlm(
  results: RuleResult[],
  settings: ToneSettings,
  opt: LlmNarratorOptions
): Promise<VirgilMessage> {
  const fallback = deterministicNarrate(results, settings);

  if (!opt.enabled) return fallback;

  if (opt.requireHealthy && opt.client.health) {
    const ok = await opt.client.health();
    if (!ok) return fallback;
  }

  const userPayload = {
    tone: {
      level: settings.level,
      allowSnark: settings.allowSnark,
    },
    findings: results,
  };

  try {
    const resp = await opt.client.generate({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
      params: { temperature: 0.3, top_p: 0.9, max_tokens: 384 },
    });

    const parsed = safeJsonParse(resp.text);
    const coerced = coerceResponse(parsed);
    if (!coerced) return fallback;

    return {
      mood: coerced.mood,
      avatarState: coerced.avatarState,
      lines: coerced.lines,
      snark: coerced.snark,
    };
  } catch {
    return fallback;
  }
}
