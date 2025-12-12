import { MockAnalyzer } from "../core/analysis/mock_analyzer";
import { RuleRegistry } from "../core/rules/rule_registry";
import { ActionLog } from "../core/logging/action_log";
import { DecisionLog } from "../core/logging/decision_log";
import { VirgilEngine } from "../core/engine/virgil_engine";
import { StartupTooManyRule } from "../modules/monitoring/rules/startup_too_many.rule";
import { SystemSnapshot } from "../core/analysis/system_snapshot";
import { narrateWithLlm } from "../ai/dialogue/llm_narrator";
import { LlamaCppClient } from "../ai/llm/llama_cpp_client";

const snapshot: SystemSnapshot = {
  capturedAt: new Date().toISOString(),
  startupEntries: Array.from({ length: 18 }).map((_, i) => ({
    id: String(i + 1),
    name: `StartupApp${i + 1}`,
    source: "HKCU_RUN",
    enabled: true,
  })),
};

async function main() {
  const analyzer = new MockAnalyzer(snapshot);
  const rules = new RuleRegistry();
  rules.register(new StartupTooManyRule(12));

  const engine = new VirgilEngine(analyzer, rules, new ActionLog(), new DecisionLog());
  const report = await engine.runAnalysis({ runAt: new Date().toISOString(), debug: true });

  const client = new LlamaCppClient({
    baseUrl: process.env.LLAMA_BASE_URL ?? "http://127.0.0.1:8080",
    timeoutMs: 12000,
    defaults: { temperature: 0.3, top_p: 0.9, max_tokens: 384 },
  });

  const msg = await narrateWithLlm(
    report.results,
    {
      level: "NARRATIVE",
      allowSnark: true,
      sessionSnarkMemory: new Set<string>(),
    },
    {
      client,
      enabled: true,
      requireHealthy: true,
    }
  );

  console.log("\n=== VIRGIL (offline LLM) ===\n");
  for (const line of msg.lines) console.log(line);
  if (msg.snark) console.log(`\n${msg.snark}`);
  console.log(`\n[mood=${msg.mood}] [avatar=${msg.avatarState}]`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
