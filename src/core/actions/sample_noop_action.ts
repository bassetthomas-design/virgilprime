import { ActionHandler } from "./action_executor";
import { ActionPlan } from "./action_plan";
import { UndoToken } from "./undo";

export class NoopAction implements ActionHandler {
  constructor(private readonly id: string, private readonly label: string) {}

  async plan(): Promise<ActionPlan> {
    return {
      descriptor: {
        id: this.id,
        label: this.label,
        module: "dev",
        risk: "SAFE",
        requiresAdmin: false,
        supportsUndo: false,
      },
      preview: [{ kind: "READ", resource: "(no-op)", note: "No changes" }],
    };
  }

  async execute(): Promise<{ success: boolean; undoToken?: UndoToken; notes?: string[] }> {
    return { success: true, notes: ["No-op executed"] };
  }
}
