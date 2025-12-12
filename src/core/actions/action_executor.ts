import { ActionContext } from "./action_context";
import { ActionDescriptor } from "./action_descriptor";
import { ActionPlan } from "./action_plan";
import { ActionRisk, riskOrder } from "./action_risk";
import { UndoProvider, UndoToken } from "./undo";
import { ActionLog } from "../logging/action_log";

export type ActionExecuteResult = {
  success: boolean;
  undoToken?: UndoToken;
  notes?: string[];
};

export interface ActionHandler {
  /** Describe exactly what will be touched. No side effects. */
  plan(): Promise<ActionPlan>;

  /** Optional preflight (permissions, restore point creation, backups, etc.). */
  preflight?(ctx: ActionContext): Promise<{ ok: boolean; notes?: string[] }>;

  /** Execute the action. Must be deterministic and logged by caller. */
  execute(ctx: ActionContext): Promise<ActionExecuteResult>;
}

export type ActionRegistryEntry = {
  descriptor: ActionDescriptor;
  handler: ActionHandler;
  undoProvider?: UndoProvider;
};

export class ActionExecutor {
  constructor(private readonly log: ActionLog) {}

  /**
   * Risk gating: blocks RISKY actions unless expertMode is enabled.
   */
  private ensureAllowed(risk: ActionRisk, ctx: ActionContext): void {
    if (risk === "RISKY" && !ctx.expertMode) {
      throw new Error("Blocked RISKY action: enable expertMode to proceed.");
    }
  }

  async plan(entry: ActionRegistryEntry): Promise<ActionPlan> {
    return entry.handler.plan();
  }

  async run(entry: ActionRegistryEntry, ctx: ActionContext): Promise<ActionExecuteResult> {
    this.ensureAllowed(entry.descriptor.risk, ctx);

    const notes: string[] = [];

    // Preflight
    if (entry.handler.preflight) {
      const pf = await entry.handler.preflight(ctx);
      if (pf.notes?.length) notes.push(...pf.notes);
      if (!pf.ok) {
        this.log.record({
          at: new Date().toISOString(),
          actionId: entry.descriptor.id,
          label: entry.descriptor.label,
          success: false,
          notes: ["Preflight failed", ...notes],
        });
        return { success: false, notes: ["Preflight failed", ...notes] };
      }
    }

    // Execute
    try {
      const res = await entry.handler.execute(ctx);
      if (res.notes?.length) notes.push(...res.notes);

      this.log.record({
        at: new Date().toISOString(),
        actionId: entry.descriptor.id,
        label: entry.descriptor.label,
        success: res.success,
        notes: res.success ? notes : ["Execution failed", ...notes],
      });

      return { ...res, notes };
    } catch (err) {
      const msg = String(err);
      this.log.record({
        at: new Date().toISOString(),
        actionId: entry.descriptor.id,
        label: entry.descriptor.label,
        success: false,
        notes: [msg, ...notes],
      });
      return { success: false, notes: [msg, ...notes] };
    }
  }
}
