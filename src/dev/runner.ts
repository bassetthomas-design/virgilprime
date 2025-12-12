import { MockAnalyzer } from "../core/analysis/mock_analyzer";
import { RuleRegistry } from "../core/rules/rule_registry";
import { ActionLog } from "../core/logging/action_log";
import { DecisionLog } from "../core/logging/decision_log";
import { VirgilEngine } from "../core/engine/virgil_engine";
import { StartupTooManyRule } from "../modules/monitoring/rules/startup_too_many.rule";
import { SystemSnapshot } from "../core/analysis/system_snapshot";

const snapshot: SystemSnapshot = {
  capturedAt: new Date().toISOString(),
  startupEntries: [
    { id: "1", name: "Discord", source: "HKCU_RUN", enabled: true },
    { id: "2", name: "Steam", source: "HKCU_RUN", enabled: true },
    { id: "3", name: "Adobe Updater", source: "HKLM_RUN", enabled: true },
    { id: "4", name: "Spotify", source: "HKCU_RUN", enabled: true },
    { id: "5", name: "OneDrive", source: "HKLM_RUN", enabled: true },
    { id: "6", name: "Teams", source: "HKLM_RUN", enabled: true },
    { id: "7", name: "Epic Games Launcher", source: "HKCU_RUN", enabled: true },
    { id: "8", name: "NVIDIA Container", source: "HKLM_RUN", enabled: true },
    { id: "9", name: "Apple Software Update", source: "TASK_SCHEDULER", enabled: true },
    { id: "10", name: "Java Update", source: "TASK_SCHEDULER", enabled: true },
    { id: "11", name: "Realtek Audio Console", source: "HKLM_RUN", enabled: true },
    { id: "12", name: "Logitech Options", source: "HKCU_RUN", enabled: true },
    { id: "13", name: "Dropbox", source: "HKCU_RUN", enabled: true },
    { id: "14", name: "Battle.net", source: "HKCU_RUN", enabled: true },
    { id: "15", name: "Razer Synapse", source: "HKCU_RUN", enabled: true },
    { id: "16", name: "Printer Helper", source: "HKLM_RUN", enabled: true },
    { id: "17", name: "UpdaterThing", source: "UNKNOWN", enabled: true },
    { id: "18", name: "YetAnotherHelper", source: "STARTUP_FOLDER", enabled: true }
  ],
  disk: { systemDrive: "C:", totalBytes: 549755813888, freeBytes: 22548578304 },
  memory: { totalBytes: 17179869184, usedBytes: 13958643712 }
};

async function main() {
  const analyzer = new MockAnalyzer(snapshot);
  const rules = new RuleRegistry();
  rules.register(new StartupTooManyRule(12));

  const engine = new VirgilEngine(analyzer, rules, new ActionLog(), new DecisionLog());
  const report = await engine.runAnalysis({ runAt: new Date().toISOString(), debug: true });

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
