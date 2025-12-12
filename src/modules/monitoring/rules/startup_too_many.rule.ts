import { Rule } from "../../../core/rules/rule";
import { RuleResult } from "../../../core/rules/rule_result";
import { SystemSnapshot } from "../../../core/analysis/system_snapshot";

export class StartupTooManyRule implements Rule {
  id = "STARTUP_TOO_MANY";
  title = "Trop d'applications au démarrage";
  description = "Un trop grand nombre d'entrées au démarrage augmente le temps de boot et la latence globale.";

  severity: "MEDIUM" | "HIGH" = "MEDIUM";
  commentable = true;
  repeatable = true;

  constructor(private readonly threshold = 12) {}

  evaluate(snapshot: SystemSnapshot): RuleResult | null {
    const enabled = snapshot.startupEntries.filter((e) => e.enabled);
    const count = enabled.length;

    if (count <= this.threshold) return null;

    const severity = count >= this.threshold + 10 ? "HIGH" : "MEDIUM";
    this.severity = severity;

    return {
      ruleId: this.id,
      severity,
      title: this.title,
      summary: `${count} entrées actives au démarrage (seuil: ${this.threshold}).`,
      details: [
        "Plus il y en a, plus Windows traîne au démarrage.",
        "La plupart ne sont pas nécessaires en permanence.",
      ],
      evidence: [
        { key: "startup.enabled_count", value: count },
        { key: "startup.threshold", value: this.threshold },
      ],
    };
  }
}
