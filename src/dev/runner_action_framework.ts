import { ActionLog } from "../core/logging/action_log";
import { ActionExecutor } from "../core/actions/action_executor";
import { ActionRegistry } from "../core/actions/action_registry";
import { NoopAction } from "../core/actions/sample_noop_action";

async function main() {
  const log = new ActionLog();
  const exec = new ActionExecutor(log);
  const reg = new ActionRegistry();

  // Register a sample no-op action
  reg.register({
    descriptor: {
      id: "DEV_NOOP",
      label: "No-op (dev)",
      module: "dev",
      risk: "SAFE",
      requiresAdmin: false,
      supportsUndo: false,
    },
    handler: new NoopAction("DEV_NOOP", "No-op (dev)"),
  });

  const entry = reg.get("DEV_NOOP");
  if (!entry) throw new Error("Action not found");

  const plan = await exec.plan(entry);
  console.log("\n=== PLAN ===\n");
  console.log(JSON.stringify(plan, null, 2));

  const res = await exec.run(entry, { runAt: new Date().toISOString(), expertMode: false });
  console.log("\n=== RESULT ===\n");
  console.log(JSON.stringify(res, null, 2));

  console.log("\n=== LOG ===\n");
  console.log(JSON.stringify(log.list(), null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
