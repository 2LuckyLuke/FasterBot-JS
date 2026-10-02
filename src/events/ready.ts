import { ChannelType } from "discord.js";
import type { Client } from "discord.js";
import { config } from "../config.js";
import { voiceCategoryId } from "../data/channels.js";
import { onVoiceMembersJoin } from "../voice-text/handlers.js";
import { forgetVoiceChannel, registerExistingCompanion, restorePersistentEntries } from "../voice-text/manager.js";

// the voice->text map is empty after a restart: restore companions that were
// marked persistent before the restart, delete every other orphaned companion
// text channel, and recreate companions for voice channels that already have members
export async function onReady(client: Client<true>): Promise<void> {
  console.log(`Ready! Logged in as ${client.user.tag}`);

  const guild = await client.guilds.fetch(config.guildId);
  const category = await guild.channels.fetch(voiceCategoryId);
  if (category === null || category.type !== ChannelType.GuildCategory) return;

  const persistentEntries = restorePersistentEntries(); // voice channel id -> text channel id
  const persistentTextChannelIds = new Set(persistentEntries.values());
  const children = [...category.children.cache.values()];

  // keep persistent companions, delete every other orphaned text channel
  const keptTextChannelIds = new Set<string>();
  for (const channel of children) {
    if (channel.type !== ChannelType.GuildText) continue;
    if (persistentTextChannelIds.has(channel.id)) {
      keptTextChannelIds.add(channel.id);
    } else {
      await channel
        .delete()
        .catch((err: unknown) => console.error("Error deleting text channel:", err));
    }
  }

  // restore persistent companions whose text channel actually survived, and
  // recreate companions for voice channels that already have members
  const seenVoiceChannelIds = new Set<string>();
  for (const channel of children) {
    if (channel.type !== ChannelType.GuildVoice) continue;
    seenVoiceChannelIds.add(channel.id);

    const persistentTextChannelId = persistentEntries.get(channel.id);
    if (persistentTextChannelId !== undefined && keptTextChannelIds.has(persistentTextChannelId)) {
      registerExistingCompanion(channel.id, persistentTextChannelId);
    }

    if (channel.members.size > 0) {
      const firstMember = channel.members.first();
      if (firstMember !== undefined) {
        await onVoiceMembersJoin(firstMember.voice, channel.members);
      }
    }
  }

  // drop stale persistent entries: their voice channel or text channel is gone
  for (const [voiceChannelId, textChannelId] of persistentEntries) {
    if (!seenVoiceChannelIds.has(voiceChannelId) || !keptTextChannelIds.has(textChannelId)) {
      forgetVoiceChannel(voiceChannelId);
    }
  }
}
