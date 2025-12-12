import { AvatarState } from "../../core/state/avatar_state";
import { VirgilMood } from "../../ai/tone/virgil_mood";

export type AvatarVisualState = {
  base: AvatarState;
  mood: VirgilMood;
  /** Suggested animation intensity: 0 (calm) .. 3 (urgent). */
  intensity: 0 | 1 | 2 | 3;
  /** Suggested pulse speed in ms. */
  pulseMs: number;
};

export function mapAvatarVisualState(
  avatarState: AvatarState,
  mood: VirgilMood
): AvatarVisualState {
  // Conservative defaults.
  let intensity: AvatarVisualState["intensity"] = 0;
  let pulseMs = 1800;

  if (avatarState === AvatarState.ANALYSIS) {
    intensity = 1;
    pulseMs = 1400;
  }

  if (avatarState === AvatarState.ACTION) {
    intensity = 2;
    pulseMs = 900;
  }

  if (avatarState === AvatarState.ALERT) {
    intensity = 3;
    pulseMs = 550;
  }

  if (avatarState === AvatarState.SUCCESS) {
    intensity = 1;
    pulseMs = 1200;
  }

  if (avatarState === AvatarState.ERROR) {
    intensity = 3;
    pulseMs = 700;
  }

  // Mood nudges intensity slightly.
  if (mood === "ANNOYED" || mood === "SUSPICIOUS") {
    intensity = Math.min(3, (intensity + 1) as 1 | 2 | 3);
    pulseMs = Math.max(450, Math.floor(pulseMs * 0.85));
  }

  if (mood === "SATISFIED") {
    intensity = 0;
    pulseMs = 2000;
  }

  return {
    base: avatarState,
    mood,
    intensity,
    pulseMs,
  };
}
