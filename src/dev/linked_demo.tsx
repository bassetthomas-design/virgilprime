import React, { useMemo, useState } from "react";
import { MockAnalyzer } from "../core/analysis/mock_analyzer";
import { RuleRegistry } from "../core/rules/rule_registry";
import { ActionLog } from "../core/logging/action_log";
import { DecisionLog } from "../core/logging/decision_log";
import { VirgilEngine } from "../core/engine/virgil_engine";
import { StartupTooManyRule } from "../modules/monitoring/rules/startup_too_many.rule";
import { SystemSnapshot } from "../core/analysis/system_snapshot";
import { narrate } from "../ai/dialogue/virgil_narrator";
import { VirgilOrb } from "../ui/avatar/VirgilOrb";
import { AvatarState } from "../core/state/avatar_state";

type ToneLevel = "MINIMAL" | "STANDARD" | "NARRATIVE";

function buildSnapshot(startupEnabled: number): SystemSnapshot {
  return {
    capturedAt: new Date().toISOString(),
    startupEntries: Array.from({ length: startupEnabled }).map((_, i) => ({
      id: String(i + 1),
      name: `StartupApp${i + 1}`,
      source: "HKCU_RUN",
      enabled: true,
    })),
  };
}

export function LinkedDemo() {
  const [startupCount, setStartupCount] = useState(18);
  const [tone, setTone] = useState<ToneLevel>("NARRATIVE");
  const [allowSnark, setAllowSnark] = useState(true);

  const sessionSnarkMemory = useMemo(() => new Set<string>(), []);

  const { msg } = useMemo(() => {
    const snapshot = buildSnapshot(startupCount);
    const analyzer = new MockAnalyzer(snapshot);
    const rules = new RuleRegistry();
    rules.register(new StartupTooManyRule(12));

    const engine = new VirgilEngine(analyzer, rules, new ActionLog(), new DecisionLog());

    // NOTE: This is a demo: runAnalysis returns a promise, but we keep it sync-ish
    // by using the already-deterministic snapshot and rule. We'll just narrate directly
    // from the evaluated rules to keep the demo light.
    const results = rules.evaluate(snapshot);
    const msg = narrate(results, { level: tone, allowSnark, sessionSnarkMemory });

    return { msg };
  }, [startupCount, tone, allowSnark, sessionSnarkMemory]);

  // narrator returns avatarState as string union; map it to enum
  const avatarState = (msg.avatarState as unknown) as AvatarState;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16, maxWidth: 820 }}>
      <h2 style={{ margin: 0 }}>Virgil linked demo</h2>
      <p style={{ marginTop: 6, opacity: 0.75 }}>Narration (text) drives the orb state in real time.</p>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <VirgilOrb avatarState={avatarState} mood={msg.mood} size={180} />
          <small style={{ opacity: 0.7 }}>[mood={msg.mood}] [avatar={msg.avatarState}]</small>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <label>
              Startup entries
              <input
                style={{ marginLeft: 8, width: 80 }}
                type="number"
                min={0}
                max={60}
                value={startupCount}
                onChange={(e) => setStartupCount(Number(e.target.value))}
              />
            </label>

            <label>
              Tone
              <select style={{ marginLeft: 8 }} value={tone} onChange={(e) => setTone(e.target.value as ToneLevel)}>
                <option value="MINIMAL">MINIMAL</option>
                <option value="STANDARD">STANDARD</option>
                <option value="NARRATIVE">NARRATIVE</option>
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={allowSnark} onChange={(e) => setAllowSnark(e.target.checked)} />
              allowSnark
            </label>
          </div>

          <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Virgil says</div>
            {msg.lines.map((l, idx) => (
              <div key={idx} style={{ marginBottom: 6 }}>{l}</div>
            ))}
            {msg.snark && (
              <div style={{ marginTop: 10, opacity: 0.85 }}><em>{msg.snark}</em></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
