import { VirgilEngine } from "../core/engine/virgil_engine";
import { RuleRegistry } from "../core/rules/rule_registry";
import { ActionLog } from "../core/logging/action_log";
import { DecisionLog } from "../core/logging/decision_log";
import { StartupTooManyRule } from "../modules/monitoring/rules/startup_too_many.rule";
import { WindowsStartupAnalyzer } from "../modules/monitoring/analyzers/windows_startup/windows_startup_analyzer";
import { narrate } from "../ai/dialogue/virgil_narrator";
import { narrateWithLlm } from "../ai/dialogue/llm_narrator";
import { LlamaCppClient } from "../ai/llm/llama_cpp_client";

function envFlag(name: string, def = false): boolean {
  const v = process.env[name];
  if (v == null) return def;
  return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
}

async function main() {
  // 1) Capture real Windows snapshot
  const analyzer = new WindowsStartupAnalyzer();

  // 2) Rules
  const rules = new RuleRegistry();
  rules.register(new StartupTooManyRule(12));

  // 3) Engine
  const engine = new VirgilEngine(analyzer, rules, new ActionLog(), new DecisionLog());
  const report = await engine.runAnalysis({ runAt: new Date().toISOString(), debug: true });

  // 4) Narration (offline LLM optional, deterministic fallback always available)
  const useOfflineLlm = envFlag("VIRGIL_USE_OFFLINE_LLM", false);

  let msg;
  if (useOfflineLlm) {
    const client = new LlamaCppClient({
      baseUrl: process.env.LLAMA_BASE_URL ?? "http://127.0.0.1:8080",
      timeoutMs: 12000,
      defaults: { temperature: 0.3, top_p: 0.9, max_tokens: 384 },
    });

    msg = await narrateWithLlm(
      report.results,
      { level: "NARRATIVE", allowSnark: true, sessionSnarkMemory: new Set<string>() },
      { client, enabled: true, requireHealthy: true }
    );
  } else {
    msg = narrate(report.results, { level: "NARRATIVE", allowSnark: true, sessionSnarkMemory: new Set<string>() });
  }

  // 5) Output: verdict + avatar state
  console.log("\n=== VIRGIL VERDICT (Windows) ===\n");
  for (const line of msg.lines) console.log(line);
  if (msg.snark) console.log(`\n${msg.snark}`);

  console.log("\n=== AVATAR ===\n");
  console.log(`[mood=${msg.mood}] [avatar=${msg.avatarState}]`);

  console.log("\n=== RAW FINDINGS ===\n");
  console.log(JSON.stringify(report.results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
