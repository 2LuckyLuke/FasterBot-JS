async function setColorCommand(interaction) {
  try {
    let usersRole = await getOrCreateRole(interaction);
    usersRole.edit({
      color: customColors[interaction.options.getString("color")],
    });
    interaction.reply({
      content: `Your color is now: ${
        customColors[interaction.options.getString("color")]
      }`,
      ephemeral: true,
    });
  } catch (e) {
    console.log(e);
    interaction.reply({
      content: `Something went wrong; try again.`,
      ephemeral: true,
    });
  }
}
