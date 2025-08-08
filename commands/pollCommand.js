async function pollCommand(interaction) {
  let textToSend = interaction.options.getString("text");
  let role = interaction.options.getRole("role");
  let message;
  if (role !== null) {
    textToSend += ` ${role}`;
    allowedRole = role.id;

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
    for (let i = 0; i < emojis.length; i++) {
      message.react(emojis[i]);
    }
  } else {
    message.react("⬆️");
    message.react("⬇️");
  }
}
