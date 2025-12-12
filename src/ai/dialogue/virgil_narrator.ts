import { RuleResult } from "../../core/rules/rule_result";
import { decideTone, ToneDecision, ToneSettings } from "../tone/tone_policy";

export type VirgilMessage = {
  mood: ToneDecision["mood"];
  avatarState: ToneDecision["avatarState"];
  lines: string[];
  /** Optional single snark line (already filtered by policy). */
  snark?: string;
};

function snarkKey(ruleId: string): string {
  return `snark:${ruleId}`;
}

function pickSnark(ruleId: string): string | undefined {
  // Keep these lines short and non-insulting. Target the situation, not the person.
  const bank: Record<string, string[]> = {
    STARTUP_TOO_MANY: [
      "18 applis au démarrage. La patience n'est pas un plan de performance.",
      "Windows démarre. Lentement. Comme s'il portait tout ton historique de décisions.",
      "Tu peux garder tout ça au démarrage. Et aussi accepter les conséquences.",
    ],
  };

  const lines = bank[ruleId];
  if (!lines || lines.length === 0) return undefined;
  return lines[Math.floor(Math.random() * lines.length)];
}

export function narrate(results: RuleResult[], settings: ToneSettings): VirgilMessage {
  const tone = decideTone(results, settings);

  const lines: string[] = [];

  if (results.length === 0) {
    lines.push("Analyse terminée. État acceptable.");
    if (tone.includeContext) lines.push("Rien d'urgent. Continue à ne pas casser ça.");

    return {
      mood: tone.mood,
      avatarState: tone.avatarState,
      lines,
    };
  }

  const worst = results[0];
  lines.push(`Analyse terminée. Priorité: ${worst.title}.`);
  lines.push(worst.summary);

  if (tone.includeContext && worst.details?.length) {
    lines.push(...worst.details);
  }

  let snark: string | undefined;
  if (tone.includeSnark) {
    const key = snarkKey(worst.ruleId);
    const mem = settings.sessionSnarkMemory;
    if (!mem || !mem.has(key)) {
      snark = pickSnark(worst.ruleId);
      if (snark && mem) mem.add(key);
    }
  }

  return {
    mood: tone.mood,
    avatarState: tone.avatarState,
    lines,
    snark,
  };
}
