import { RuleResult } from "../../core/rules/rule_result";
import { VirgilMood } from "./virgil_mood";

export type ToneLevel = "MINIMAL" | "STANDARD" | "NARRATIVE";

export type ToneSettings = {
  level: ToneLevel;
  /** If true, allows a short snark line when conditions match. */
  allowSnark: boolean;
  /** Prevent repeating the same snark more than once in a session. */
  sessionSnarkMemory?: Set<string>;
};

export type ToneDecision = {
  mood: VirgilMood;
  avatarState: "REST" | "ANALYSIS" | "ACTION" | "ALERT" | "SUCCESS" | "ERROR";
  includeContext: boolean;
  includeSnark: boolean;
};

export function decideTone(results: RuleResult[], settings: ToneSettings): ToneDecision {
  const worst = results[0];

  let mood: VirgilMood = "NEUTRAL";
  let avatarState: ToneDecision["avatarState"] = "REST";

  if (!worst) {
    return {
      mood: "SATISFIED",
      avatarState: "SUCCESS",
      includeContext: settings.level !== "MINIMAL",
      includeSnark: false,
    };
  }

  switch (worst.severity) {
    case "CRITICAL":
      mood = "VIGILANT";
      avatarState = "ALERT";
      break;
    case "HIGH":
      mood = "SUSPICIOUS";
      avatarState = "ALERT";
      break;
    case "MEDIUM":
      mood = "VIGILANT";
      avatarState = "ANALYSIS";
      break;
    case "LOW":
      mood = "NEUTRAL";
      avatarState = "REST";
      break;
    default:
      mood = "NEUTRAL";
      avatarState = "REST";
  }

  const includeContext = settings.level !== "MINIMAL";
  const includeSnark = Boolean(settings.allowSnark && worst && worst.severity !== "CRITICAL");

  return { mood, avatarState, includeContext, includeSnark };
}
