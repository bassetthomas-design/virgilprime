import { ActionDescriptor } from "./action_descriptor";

export type ActionPreviewStep = {
  kind: "READ" | "WRITE" | "DELETE" | "EXEC";
  /** Affected resource (registry key, file path, task name, etc.) */
  resource: string;
  note?: string;
};

export type ActionPlan = {
  descriptor: ActionDescriptor;

  /** Human-readable impact estimate. */
  estimatedImpact?: {
    storageBytesFreed?: number;
    bootTimeMsReduced?: number;
    riskNotes?: string[];
  };

  /** Concrete preview of what will be touched. */
  preview: ActionPreviewStep[];
};
