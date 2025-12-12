import React from "react";
import { AvatarState } from "../../core/state/avatar_state";
import { VirgilMood } from "../../ai/tone/virgil_mood";
import { mapAvatarVisualState } from "./avatar_state_mapper";

type Props = {
  avatarState: AvatarState;
  mood: VirgilMood;
  size?: number;
};

// Minimal, dependency-free orb (SVG) to represent Virgil.
// Colors/animations are intentionally simple; final styling can be replaced by the real renderer.
export function VirgilOrb({ avatarState, mood, size = 160 }: Props) {
  const v = mapAvatarVisualState(avatarState, mood);
  const r = size / 2;
  const eyeOffsetX = size * 0.14;
  const eyeOffsetY = size * 0.02;
  const eyeR = size * 0.06;

  // “Expressions” are just eye scale/tilt. Keep it subtle.
  const squint = v.intensity >= 3 ? 0.55 : v.intensity === 2 ? 0.75 : 1;
  const focus = v.intensity >= 2 ? 1.15 : 1;

  const pulse = {
    animation: `virgilPulse ${v.pulseMs}ms ease-in-out infinite`,
    transformOrigin: "50% 50%",
  } as React.CSSProperties;

  const ring = v.base === AvatarState.ACTION ? 0.12 : v.base === AvatarState.ANALYSIS ? 0.08 : 0.05;

  return (
    <div style={{ width: size, height: size, display: "inline-block" }} title={`state=${v.base} mood=${v.mood}`}>
      <style>{`
        @keyframes virgilPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(${1 + ring}); opacity: 0.92; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g style={pulse}>
          <circle cx={r} cy={r} r={r * 0.92} fill="#1db954" opacity={0.92} />
          <circle cx={r} cy={r} r={r * 0.92} fill="#000" opacity={0.08} />

          {/* inner highlight */}
          <circle cx={r * 0.75} cy={r * 0.7} r={r * 0.35} fill="#fff" opacity={0.08} />

          {/* eyes */}
          <g transform={`translate(${r - eyeOffsetX}, ${r + eyeOffsetY}) scale(${focus}, ${squint})`}>
            <circle cx={0} cy={0} r={eyeR} fill="#0b0f0c" opacity={0.95} />
          </g>
          <g transform={`translate(${r + eyeOffsetX}, ${r + eyeOffsetY}) scale(${focus}, ${squint})`}>
            <circle cx={0} cy={0} r={eyeR} fill="#0b0f0c" opacity={0.95} />
          </g>
        </g>
      </svg>
    </div>
  );
}
