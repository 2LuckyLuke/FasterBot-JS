import { ChannelType, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";

export const clear: Command = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("deletes the specified amount of messages")
    .addIntegerOption((option) =>
      option
        .setName("messages")
        .setDescription("the amount of messages to delete")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("messages", true);
    const channel = interaction.channel;
    if (channel === null || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "This only works in a regular text channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const messages = await channel.messages.fetch({ limit: amount });
    // second argument: silently skip messages older than 14 days, which the API refuses to bulk-delete
    const deleted = await channel.bulkDelete(messages, true);
    await interaction.reply({
      content: `Deleted \`${deleted.size}\` messages.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
