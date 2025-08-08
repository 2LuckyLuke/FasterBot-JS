import { getEmojisFromString } from "../index.js";

export async function pollCommand(interaction) {
  let textToSend = interaction.options.getString("text");
  let role = interaction.options.getRole("role");
  let message;
  if (role !== null) {
    textToSend += ` ${role}`;

    message = await interaction.reply({
      allowedMentions: { roles: [role.id] },
      content: textToSend,
      fetchReply: true,
    });
  } else {
    message = await interaction.reply({
      content: textToSend,
      fetchReply: true,
    });
  }
  let reactions = interaction.options.getString("reactions");
  if (reactions !== null) {
    let emojis = getEmojisFromString(reactions);
    for (let emoji of emojis) {
      message.react(emoji);
    }
  } else {
    message.react("⬆️");
    message.react("⬇️");
  }
}
