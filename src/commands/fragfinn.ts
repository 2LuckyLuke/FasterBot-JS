import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { searchEngineUserId } from "../data/channels.js";
import type { Command } from "./types.js";

export const fragfinn: Command = {
  data: new SlashCommandBuilder()
    .setName("fragfinn")
    .setDescription("redirects your question to our unique search engine")
    .addStringOption((option) =>
      option.setName("question").setDescription("The text of your question").setRequired(true),
    ),
  async execute(interaction) {
    await interaction.reply({
      content: "Our search engine has been informed.",
      flags: MessageFlags.Ephemeral,
    });
    const question = interaction.options.getString("question", true);
    await interaction.followUp(`<@${searchEngineUserId}> ${question}`);
  },
};
