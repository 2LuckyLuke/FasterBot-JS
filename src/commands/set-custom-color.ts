import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { HexColorString } from "discord.js";
import { getOrCreateUserRole } from "../lib/user-role.js";
import type { Command } from "./types.js";

const hexColorRegex = /^#(?:[a-f\d]{3}){1,2}$/i;

function isHexColor(value: string): value is HexColorString {
  return hexColorRegex.test(value);
}

export const setCustomColor: Command = {
  data: new SlashCommandBuilder()
    .setName("setcustomcolor")
    .setDescription("sets the color of your username (via HEX code)")
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("enter a color in HEX format (i.e.: #FA7A55)")
        .setRequired(true),
    ),
  async execute(interaction) {
    const color = interaction.options.getString("color", true);
    if (!isHexColor(color)) {
      await interaction.reply({
        content: `${color} is not a valid Hex Color. Use this if you need help: https://rgbacolorpicker.com/hex-color-picker`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const role = await getOrCreateUserRole(interaction);
    await role.edit({ color });
    await interaction.reply({
      content: `Your color is now: ${color}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
