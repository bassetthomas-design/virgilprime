import { UndoProvider, UndoToken } from "../../../core/actions/undo";
import { CommandRunner } from "../../monitoring/analyzers/command_runner";
import { NodeCommandRunner } from "../../monitoring/analyzers/node_command_runner";
import { HKCU_RUN_KEY, VIRGIL_DISABLED_ROOT, disabledValueKey } from "./registry_paths";

export class DisableHkcuRunUndo implements UndoProvider {
  private readonly runner: CommandRunner;

  constructor(runner?: CommandRunner) {
    this.runner = runner ?? new NodeCommandRunner();
  }

  async undo(token: UndoToken): Promise<boolean> {
    try {
      const valueName = String(token.payload.valueName ?? "");
      const type = String(token.payload.type ?? "REG_SZ");
      const data = String(token.payload.data ?? "");
      if (!valueName) return false;

      // Restore original value.
      const add = await this.runner.run("reg", [
        "add",
        HKCU_RUN_KEY,
        "/v",
        valueName,
        "/t",
        type,
        "/d",
        data,
        "/f",
      ]);
      if (add.code !== 0) return false;

      // Remove Virgil backup value (best-effort).
      await this.runner.run("reg", [
        "delete",
        VIRGIL_DISABLED_ROOT,
        "/v",
        disabledValueKey(valueName),
        "/f",
      ]);

      return true;
    } catch {
      return false;
    }
  }
}
