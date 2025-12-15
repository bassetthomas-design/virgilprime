import { ActionRegistryEntry } from "../../../core/actions/action_executor";
import { DisableHkcuRunAction } from "./disable_hkcu_run_action";
import { DisableHkcuRunUndo } from "./disable_hkcu_run_undo";

export function createDisableHkcuRunEntry(valueName: string): ActionRegistryEntry {
  return {
    descriptor: {
      id: "STARTUP_DISABLE_HKCU_RUN",
      label: `Désactiver au démarrage (HKCU Run): ${valueName}`,
      module: "optimize",
      risk: "SAFE",
      requiresAdmin: false,
      supportsUndo: true,
      targetRef: `HKCU_RUN:${valueName}`,
    },
    handler: new DisableHkcuRunAction({ valueName }),
    undoProvider: new DisableHkcuRunUndo(),
  };
}
