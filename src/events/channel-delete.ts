import { ChannelType } from "discord.js";
import type { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import { forgetVoiceChannel, getTextChannelId, getVoiceChannelIdForText } from "../voice-text/manager.js";

// a companion text channel (or its voice channel) can be deleted by hand, not
// just via the bot's own leave-cleanup; keep internal state in sync either way
export async function onChannelDelete(
  channel: DMChannel | NonThreadGuildBasedChannel,
): Promise<void> {
  if (channel.type === ChannelType.GuildText) {
    const voiceChannelId = getVoiceChannelIdForText(channel.id);
    if (voiceChannelId !== undefined) {
      forgetVoiceChannel(voiceChannelId);
    }
  } else if (channel.type === ChannelType.GuildVoice) {
    const textChannelId = getTextChannelId(channel.id);
    if (textChannelId === undefined) return;
    forgetVoiceChannel(channel.id);

    const textChannel = await channel.guild.channels.fetch(textChannelId).catch(() => null);
    if (textChannel !== null) {
      await textChannel
        .delete()
        .catch((err: unknown) => console.error("Error deleting orphaned companion channel:", err));
    }
  }
}
