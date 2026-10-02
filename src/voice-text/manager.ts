import { ChannelType, OverwriteType, PermissionFlagsBits } from "discord.js";
import type { Collection, GuildBasedChannel, GuildMember, VoiceBasedChannel } from "discord.js";
import { loadPersistentEntries, removePersistentEntry, savePersistentEntry } from "./persistent-store.js";

interface CompanionEntry {
  textChannelId: string;
  // persistent companions are also mirrored to disk (persistent-store.ts) so they
  // survive a restart; non-persistent ones live only in this map and get rebuilt
  // by the ready handler after every restart
  persistent: boolean;
}

// voice channel id -> companion text channel entry
const companionByVoiceId = new Map<string, CompanionEntry>();

export function getTextChannelId(voiceChannelId: string): string | undefined {
  return companionByVoiceId.get(voiceChannelId)?.textChannelId;
}

export function isPersistent(voiceChannelId: string): boolean {
  return companionByVoiceId.get(voiceChannelId)?.persistent ?? false;
}

export function getVoiceChannelIdForText(textChannelId: string): string | undefined {
  for (const [voiceChannelId, entry] of companionByVoiceId) {
    if (entry.textChannelId === textChannelId) return voiceChannelId;
  }
  return undefined;
}

export function forgetVoiceChannel(voiceChannelId: string): void {
  companionByVoiceId.delete(voiceChannelId);
  removePersistentEntry(voiceChannelId);
}

// re-registers a companion that was marked persistent before a restart, without
// creating a new discord channel; used by the ready handler
export function registerExistingCompanion(voiceChannelId: string, textChannelId: string): void {
  companionByVoiceId.set(voiceChannelId, { textChannelId, persistent: true });
}

export function restorePersistentEntries(): Map<string, string> {
  return loadPersistentEntries();
}

export function setPersistent(voiceChannelId: string, persistent: boolean): boolean {
  const entry = companionByVoiceId.get(voiceChannelId);
  if (entry === undefined) return false;
  entry.persistent = persistent;
  if (persistent) {
    savePersistentEntry(voiceChannelId, entry.textChannelId);
  } else {
    removePersistentEntry(voiceChannelId);
  }
  return true;
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
  companionByVoiceId.set(voiceChannel.id, { textChannelId: textChannel.id, persistent: false });
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
