import { ActionExecutor } from "../core/actions/action_executor";
import { ActionRegistry } from "../core/actions/action_registry";
import { ActionLog } from "../core/logging/action_log";
import { createDisableHkcuRunEntry } from "../modules/optimize/actions/disable_hkcu_run";

function requireArg(name: string): string {
  const idx = process.argv.findIndex((x) => x === `--${name}`);
  if (idx < 0 || !process.argv[idx + 1]) {
    throw new Error(`Missing --${name} <valueName>`);
  }
  return process.argv[idx + 1];
}

async function main() {
  const valueName = requireArg("name");

  const log = new ActionLog();
  const exec = new ActionExecutor(log);
  const reg = new ActionRegistry();

  const entry = createDisableHkcuRunEntry(valueName);
  reg.register(entry);

  const plan = await exec.plan(entry);
  console.log("\n=== PLAN ===\n");
  console.log(JSON.stringify(plan, null, 2));

  const res = await exec.run(entry, { runAt: new Date().toISOString(), expertMode: false });
  console.log("\n=== RESULT ===\n");
  console.log(JSON.stringify(res, null, 2));

  console.log("\n=== LOG ===\n");
  console.log(JSON.stringify(log.list(), null, 2));

  if (res.undoToken) {
    console.log("\nUndo token (save this if you want to undo later):\n");
    console.log(JSON.stringify(res.undoToken, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
