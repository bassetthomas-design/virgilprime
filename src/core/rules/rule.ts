import { SystemSnapshot } from "../analysis/system_snapshot";
import { RuleResult } from "./rule_result";

export type RuleSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Rule {
  id: string;
  title: string;
  description: string;
  severity: RuleSeverity;
  commentable: boolean;
  repeatable: boolean;
  evaluate(snapshot: SystemSnapshot): RuleResult | null;
}
