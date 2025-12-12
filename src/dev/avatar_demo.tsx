import React, { useMemo, useState } from "react";
import { VirgilOrb } from "../ui/avatar/VirgilOrb";
import { AvatarState } from "../core/state/avatar_state";
import { VirgilMood } from "../ai/tone/virgil_mood";

const avatarStates: AvatarState[] = [
  AvatarState.REST,
  AvatarState.ANALYSIS,
  AvatarState.ACTION,
  AvatarState.ALERT,
  AvatarState.SUCCESS,
  AvatarState.ERROR,
];

const moods: VirgilMood[] = [
  "NEUTRAL",
  "VIGILANT",
  "SUSPICIOUS",
  "ANNOYED",
  "RESIGNED",
  "SATISFIED",
];

export function AvatarDemo() {
  const [a, setA] = useState<AvatarState>(AvatarState.REST);
  const [m, setM] = useState<VirgilMood>("NEUTRAL");

  const title = useMemo(() => `Virgil avatar demo: ${a} / ${m}`, [a, m]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ marginTop: 6, opacity: 0.75 }}>Minimal orb. The real renderer can replace this later.</p>

      <div style={{ display: "flex", gap: 24, alignItems: "center", marginTop: 16 }}>
        <VirgilOrb avatarState={a} mood={m} size={180} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            AvatarState
            <select style={{ marginLeft: 8 }} value={a} onChange={(e) => setA(e.target.value as AvatarState)}>
              {avatarStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label>
            Mood
            <select style={{ marginLeft: 8 }} value={m} onChange={(e) => setM(e.target.value as VirgilMood)}>
              {moods.map((mm) => (
                <option key={mm} value={mm}>
                  {mm}
                </option>
              ))}
            </select>
          </label>

          <small style={{ opacity: 0.7 }}>
            Tip: ALERT + SUSPICIOUS looks properly judgemental.
          </small>
        </div>
      </div>
    </div>
  );
}
