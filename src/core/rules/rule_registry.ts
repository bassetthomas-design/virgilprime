import { SystemSnapshot } from "../analysis/system_snapshot";
import { Rule } from "./rule";
import { RuleResult } from "./rule_result";

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export class RuleRegistry {
  private readonly rules: Rule[] = [];

  register(rule: Rule): void {
    this.rules.push(rule);
  }

  evaluate(snapshot: SystemSnapshot): RuleResult[] {
    const results: RuleResult[] = [];

    for (const rule of this.rules) {
      const res = rule.evaluate(snapshot);
      if (res) results.push(res);
    }

    results.sort((a, b) => (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0));
    return results;
  }
}
