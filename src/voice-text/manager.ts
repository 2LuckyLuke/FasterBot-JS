import { ChannelType, OverwriteType, PermissionFlagsBits } from "discord.js";
import type { Collection, GuildBasedChannel, GuildMember, VoiceBasedChannel } from "discord.js";

// voice channel id -> companion text channel id
// in-memory only: the ready handler rebuilds this state after every restart
const textChannelByVoiceId = new Map<string, string>();

export function getTextChannelId(voiceChannelId: string): string | undefined {
  return textChannelByVoiceId.get(voiceChannelId);
}

export function forgetVoiceChannel(voiceChannelId: string): void {
  textChannelByVoiceId.delete(voiceChannelId);
}

export async function createCompanionTextChannel(
  voiceChannel: VoiceBasedChannel,
  members: Collection<string, GuildMember>,
): Promise<void> {
  // voice channels are named like "🎮 gaming"; drop the emoji prefix
  const name = voiceChannel.name;
  const channelName = name.includes(" ") ? name.substring(name.indexOf(" ")) : name;

  const textChannel = await voiceChannel.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: voiceChannel.parent,
    permissionOverwrites: [
      {
        type: OverwriteType.Role,
        id: voiceChannel.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      ...members.map((member) => ({
        type: OverwriteType.Member,
        id: member.id,
        allow: [PermissionFlagsBits.ViewChannel],
      })),
    ],
  });
  textChannelByVoiceId.set(voiceChannel.id, textChannel.id);
}

export async function setMemberVisibility(
  channel: GuildBasedChannel,
  memberId: string,
  visible: boolean,
): Promise<void> {
  if (channel.type !== ChannelType.GuildText) return;
  if (visible) {
    await channel.permissionOverwrites.create(memberId, { ViewChannel: true });
  } else {
    await channel.permissionOverwrites.delete(memberId);
  }
}
