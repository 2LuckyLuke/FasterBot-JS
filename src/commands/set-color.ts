import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { customColors, isCustomColor } from "../data/colors.js";
import { getOrCreateUserRole } from "../lib/user-role.js";
import type { Command } from "./types.js";

export const setColor: Command = {
  data: new SlashCommandBuilder()
    .setName("setcolor")
    .setDescription("sets the color of your username")
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("choose one of the colors")
        .setRequired(true)
        .addChoices(
          ...Object.entries(customColors).map(([value, { label, hex }]) => ({
            name: `${label} (${hex})`,
            value,
          })),
        ),
    ),
  async execute(interaction) {
    const value = interaction.options.getString("color", true);
    if (!isCustomColor(value)) {
      await interaction.reply({ content: "Unknown color.", flags: MessageFlags.Ephemeral });
      return;
    }
    const { hex } = customColors[value];
    const role = await getOrCreateUserRole(interaction);
    await role.edit({ color: hex });
    await interaction.reply({
      content: `Your color is now: ${hex}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
