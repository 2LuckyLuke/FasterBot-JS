import { ChannelType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { forgetVoiceChannel, getVoiceChannelIdForText, setPersistent } from "../voice-text/manager.js";
import type { Command } from "./types.js";

export const persistent: Command = {
  data: new SlashCommandBuilder()
    .setName("persistent")
    .setDescription("keep this private channel around even after everyone leaves voice")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addBooleanOption((option) =>
      option
        .setName("enabled")
        .setDescription("true to keep this channel, false to let it auto-delete again")
        .setRequired(true),
    ),
  async execute(interaction) {
    if (interaction.channel === null || interaction.channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "This command only works inside a private voice-companion text channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const voiceChannelId = getVoiceChannelIdForText(interaction.channel.id);
    if (voiceChannelId === undefined) {
      await interaction.reply({
        content: "This isn't a private voice-companion channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const enabled = interaction.options.getBoolean("enabled", true);
    const updated = setPersistent(voiceChannelId, enabled);
    if (!updated) {
      await interaction.reply({
        content: "Couldn't update this channel's settings.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      content: enabled
        ? "This channel will now stick around even after everyone leaves voice."
        : "This channel will now auto-delete once everyone leaves voice again.",
      flags: MessageFlags.Ephemeral,
    });

    if (!enabled) {
      const voiceChannel = await interaction.guild.channels.fetch(voiceChannelId).catch(() => null);
      if (
        voiceChannel !== null &&
        voiceChannel.type === ChannelType.GuildVoice &&
        voiceChannel.members.size === 0
      ) {
        await interaction.channel.delete();
        forgetVoiceChannel(voiceChannelId);
      }
    }
  },
};
