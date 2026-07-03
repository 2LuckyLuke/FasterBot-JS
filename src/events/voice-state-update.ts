import type { VoiceState } from "discord.js";
import { onVoiceJoin, onVoiceLeave } from "../voice-text/handlers.js";

export async function onVoiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
): Promise<void> {
  if (newState.channelId === null) {
    await onVoiceLeave(oldState);
  } else if (oldState.channelId === null) {
    await onVoiceJoin(newState);
  } else if (newState.channelId !== oldState.channelId) {
    await onVoiceLeave(oldState);
    await onVoiceJoin(newState);
  }
}
