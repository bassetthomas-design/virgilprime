import { Analyzer } from "../analysis/analyzer";
import { SystemSnapshot } from "../analysis/system_snapshot";
import { RuleRegistry } from "../rules/rule_registry";
import { RuleResult } from "../rules/rule_result";
import { VirgilState } from "../state/virgil_state";
import { ActionLog } from "../logging/action_log";
import { DecisionLog } from "../logging/decision_log";
import { ExecutionContext } from "./execution_context";

export type AnalysisReport = {
  snapshot: SystemSnapshot;
  results: RuleResult[];
};

export class VirgilEngine {
  private state: VirgilState = VirgilState.IDLE;

  constructor(
    private readonly analyzer: Analyzer,
    private readonly rules: RuleRegistry,
    private readonly actionLog: ActionLog,
    private readonly decisionLog: DecisionLog
  ) {}

  getState(): VirgilState {
    return this.state;
  }

  async runAnalysis(_ctx: ExecutionContext): Promise<AnalysisReport> {
    this.transitionTo(VirgilState.ANALYZING);

    const snapshot = await this.analyzer.capture();
    const results = this.rules.evaluate(snapshot);

    this.transitionTo(VirgilState.ADVISING);
    this.transitionTo(VirgilState.WAITING_DECISION);

    return { snapshot, results };
  }

  recordDecision(ruleId: string, decision: "ACCEPT" | "IGNORE", reason?: string): void {
    this.decisionLog.record({
      at: new Date().toISOString(),
      ruleId,
      decision,
      reason,
    });
  }

  async applyAction(actionId: string, label: string, fn: () => Promise<void>): Promise<void> {
    this.transitionTo(VirgilState.ACTING);

    try {
      await fn();
      this.actionLog.record({
        at: new Date().toISOString(),
        actionId,
        label,
        success: true,
      });
      this.transitionTo(VirgilState.IDLE);
    } catch (err) {
      this.actionLog.record({
        at: new Date().toISOString(),
        actionId,
        label,
        success: false,
        notes: [String(err)],
      });
      this.transitionTo(VirgilState.ERROR);
      throw err;
    }
  }

  private transitionTo(next: VirgilState): void {
    this.state = next;
  }
}
