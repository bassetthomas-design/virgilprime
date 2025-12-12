import { ActionRisk } from "./action_risk";

export type ActionDescriptor = {
  /** Unique action id, stable across versions. */
  id: string;

  /** Short user-facing label. */
  label: string;

  /** What module owns it (cleaning/uninstall/optimize/repair/monitoring). */
  module: string;

  /** SAFE/PRUDENT/RISKY risk classification. */
  risk: ActionRisk;

  /** Requires admin privileges to execute. */
  requiresAdmin: boolean;

  /** Best-effort undo support. */
  supportsUndo: boolean;

  /** Optional: what this action targets (e.g. startup entry id). */
  targetRef?: string;
};
