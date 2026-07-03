import { ChannelType } from "discord.js";
import type { Client } from "discord.js";
import { config } from "../config.js";
import { voiceCategoryId } from "../data/channels.js";
import { onVoiceMembersJoin } from "../voice-text/handlers.js";

// the voice->text map is empty after a restart: delete orphaned companion text
// channels and recreate them for voice channels that already have members
export async function onReady(client: Client<true>): Promise<void> {
  console.log(`Ready! Logged in as ${client.user.tag}`);

  const guild = await client.guilds.fetch(config.guildId);
  const category = await guild.channels.fetch(voiceCategoryId);
  if (category === null || category.type !== ChannelType.GuildCategory) return;

  for (const channel of category.children.cache.values()) {
    if (channel.type === ChannelType.GuildText) {
      await channel
        .delete()
        .catch((err: unknown) => console.error("Error deleting text channel:", err));
    } else if (channel.type === ChannelType.GuildVoice && channel.members.size > 0) {
      const firstMember = channel.members.first();
      if (firstMember !== undefined) {
        await onVoiceMembersJoin(firstMember.voice, channel.members);
      }
    }
  }
}
