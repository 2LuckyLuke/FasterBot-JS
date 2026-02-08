import { ChatInputCommandInteraction } from "discord.js";
import { getEmojisFromString } from "../index.js";

export async function pollCommand(interaction: ChatInputCommandInteraction) {
  const textToSend = interaction.options.getString("text") ?? '';
  const role = interaction.options.getRole("role");
  const reply = await interaction.reply({
    allowedMentions: { roles: [role !== null ? role.id : ''] },
    content: role !== null ? `${textToSend} <@&${role.id}>` : textToSend,
  })
  
  const sentMessage = await reply.fetch()

  const reactions = interaction.options.getString("reactions");
  if (reactions !== null) {
    const emojis = getEmojisFromString(reactions);
    for (const emoji of emojis) {
      try {
        await sentMessage.react(emoji);
      } catch (error) {
        // Private emoji used
      }
    }
  } else {
    sentMessage.react("⬆️");
    sentMessage.react("⬇️");
  }
}
