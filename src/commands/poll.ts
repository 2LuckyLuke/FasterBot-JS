import { SlashCommandBuilder } from "discord.js";
import type { Command } from "./types.js";

// matches most Unicode emojis, but not numbers or Discord custom emoji syntax
const emojiRegex = /([\p{Emoji_Presentation}\u200d\ufe0f]+)/gu;

export const poll: Command = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("creates a poll from your input")
    .addStringOption((option) =>
      option.setName("text").setDescription("The text of the poll").setRequired(true),
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("the bot will ping this role"),
    )
    .addStringOption((option) =>
      option.setName("reactions").setDescription("these reactions will be added (default: ⬆️,⬇️)"),
    ),
  async execute(interaction) {
    const text = interaction.options.getString("text", true);
    const role = interaction.options.getRole("role");

    const reply = await interaction.reply(
      role === null
        ? { content: text }
        : { content: `${text} <@&${role.id}>`, allowedMentions: { roles: [role.id] } },
    );
    const message = await reply.fetch();

    const reactions = interaction.options.getString("reactions");
    const emojis = reactions === null ? ["⬆️", "⬇️"] : (reactions.match(emojiRegex) ?? []);
    for (const emoji of emojis) {
      try {
        await message.react(emoji);
      } catch {
        // custom or inaccessible emoji — skip it
      }
    }
  },
};
