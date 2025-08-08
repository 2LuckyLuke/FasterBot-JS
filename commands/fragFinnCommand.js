function fragFinnCommand(interaction) {
  interaction.reply({
    content: "Our search engine has been informed.",
    ephemeral: true,
  });

  let response = interaction.options.getString("question");
  response = "<@561491781733187584> " + response;
  interaction.channel.send(response);
}
