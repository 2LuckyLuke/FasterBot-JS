import { ChannelType, MessageFlags, SlashCommandBuilder } from "discord.js";
import { gameChannels, isGameChannel } from "../data/channels.js";
import { getOrCreateUserRole } from "../lib/user-role.js";
import type { Command } from "./types.js";

export const setRole: Command = {
  data: new SlashCommandBuilder()
    .setName("setrole")
    .setDescription("set which channels you want to see")
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("choose the channel you want to see")
        .setRequired(true)
        .addChoices(
          ...Object.entries(gameChannels).map(([value, { label }]) => ({ name: label, value })),
        ),
    )
    .addBooleanOption((option) =>
      option.setName("remove").setDescription("set to true if you want to remove that game"),
    ),
  async execute(interaction) {
    const value = interaction.options.getString("channel", true);
    if (!isGameChannel(value)) {
      await interaction.reply({ content: "Unknown channel.", flags: MessageFlags.Ephemeral });
      return;
    }
    const channel = await interaction.guild.channels.fetch(gameChannels[value].channelId);
    if (channel === null || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "That game channel doesn't exist anymore.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const role = await getOrCreateUserRole(interaction);
    if (interaction.options.getBoolean("remove") === true) {
      await channel.permissionOverwrites.delete(role.id);
      await interaction.reply({
        content: "you can no longer see that channel",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await channel.permissionOverwrites.create(role.id, { ViewChannel: true });
      await interaction.reply({
        content: "you can now see that channel",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
