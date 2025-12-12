import { AvatarState } from "../../core/state/avatar_state";
import { VirgilMood } from "../../ai/tone/virgil_mood";

export type AvatarVisualState = {
  base: AvatarState;
  mood: VirgilMood;
  intensity: 0 | 1 | 2 | 3;
  pulseMs: number;
};

export function mapAvatarVisualState(
  avatarState: AvatarState,
  mood: VirgilMood
): AvatarVisualState {
  let intensity: AvatarVisualState["intensity"] = 0;
  let pulseMs = 1800;

  switch (avatarState) {
    case AvatarState.ANALYSIS:
      intensity = 1;
      pulseMs = 1400;
      break;
    case AvatarState.ACTION:
      intensity = 2;
      pulseMs = 900;
      break;
    case AvatarState.ALERT:
      intensity = 3;
      pulseMs = 550;
      break;
    case AvatarState.SUCCESS:
      intensity = 1;
      pulseMs = 1200;
      break;
    case AvatarState.ERROR:
      intensity = 3;
      pulseMs = 700;
      break;
    default:
      intensity = 0;
      pulseMs = 1800;
  }

  if (mood === "ANNOYED" || mood === "SUSPICIOUS") {
    intensity = Math.min(3, (intensity + 1) as 1 | 2 | 3);
    pulseMs = Math.max(450, Math.floor(pulseMs * 0.85));
  }

  if (mood === "SATISFIED") {
    intensity = 0;
    pulseMs = 2000;
  }

  return { base: avatarState, mood, intensity, pulseMs };
}
