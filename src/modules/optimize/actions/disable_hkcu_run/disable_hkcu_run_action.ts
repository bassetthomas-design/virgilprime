import { ActionHandler } from "../../../core/actions/action_executor";
import { ActionPlan } from "../../../core/actions/action_plan";
import { ActionContext } from "../../../core/actions/action_context";
import { UndoToken } from "../../../core/actions/undo";
import { CommandRunner } from "../../monitoring/analyzers/command_runner";
import { NodeCommandRunner } from "../../monitoring/analyzers/node_command_runner";
import { HKCU_RUN_KEY, VIRGIL_DISABLED_ROOT, disabledValueKey } from "./registry_paths";

export type DisableHkcuRunTarget = {
  /** Value name under HKCU Run. */
  valueName: string;
};

export class DisableHkcuRunAction implements ActionHandler {
  private readonly runner: CommandRunner;

  constructor(private readonly target: DisableHkcuRunTarget, runner?: CommandRunner) {
    this.runner = runner ?? new NodeCommandRunner();
  }

  async plan(): Promise<ActionPlan> {
    const valueName = this.target.valueName;

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
      preview: [
        {
          kind: "WRITE",
          resource: `${VIRGIL_DISABLED_ROOT}\\${disabledValueKey(valueName)}`,
          note: "Sauvegarde Virgil (valeur d'origine)",
        },
        {
          kind: "DELETE",
          resource: `${HKCU_RUN_KEY}\\${valueName}`,
          note: "Suppression de l'entrée de démarrage (réversible via undo)",
        },
      ],
    };
  }

  async preflight(_ctx: ActionContext): Promise<{ ok: boolean; notes?: string[] }> {
    // Check that the value exists.
    const q = await this.runner.run("reg", ["query", HKCU_RUN_KEY, "/v", this.target.valueName]);
    if (q.code !== 0) {
      return { ok: false, notes: ["Valeur introuvable dans HKCU Run."] };
    }
    return { ok: true };
  }

  async execute(_ctx: ActionContext): Promise<{ success: boolean; undoToken?: UndoToken; notes?: string[] }> {
    const valueName = this.target.valueName;

    // Read the value (so we can restore it).
    const q = await this.runner.run("reg", ["query", HKCU_RUN_KEY, "/v", valueName]);
    if (q.code !== 0) return { success: false, notes: ["Lecture registre échouée."] };

    const parsed = parseRegQuerySingleValue(q.stdout);
    if (!parsed) return { success: false, notes: ["Impossible de parser la valeur registre."] };

    // Ensure Virgil backup key exists.
    await this.runner.run("reg", ["add", VIRGIL_DISABLED_ROOT, "/f"]);

    // Save under Virgil key.
    const save = await this.runner.run("reg", [
      "add",
      VIRGIL_DISABLED_ROOT,
      "/v",
      disabledValueKey(valueName),
      "/t",
      parsed.type,
      "/d",
      parsed.data,
      "/f",
    ]);
    if (save.code !== 0) return { success: false, notes: ["Sauvegarde Virgil échouée."] };

    // Delete original value.
    const del = await this.runner.run("reg", ["delete", HKCU_RUN_KEY, "/v", valueName, "/f"]);
    if (del.code !== 0) return { success: false, notes: ["Suppression HKCU Run échouée."] };

    const undoToken: UndoToken = {
      id: `undo:${Date.now()}`,
      actionId: "STARTUP_DISABLE_HKCU_RUN",
      payload: {
        valueName,
        type: parsed.type,
        data: parsed.data,
      },
    };

    return { success: true, undoToken, notes: ["Entrée désactivée (backup Virgil créé)."] };
  }
}

export type RegValue = { name: string; type: string; data: string };

/**
 * Parses `reg query <key> /v <name>` output for a single value.
 */
export function parseRegQuerySingleValue(stdout: string): RegValue | null {
  const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("HKEY_")) continue;
    const parts = line.split(/\s{2,}/);
    if (parts.length < 3) continue;
    const name = parts[0];
    const type = parts[1];
    const data = parts.slice(2).join(" ");
    if (!name || !type) continue;
    return { name, type, data };
  }
  return null;
}
