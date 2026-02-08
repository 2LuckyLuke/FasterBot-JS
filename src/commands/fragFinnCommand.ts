import { ChatInputCommandInteraction, MessageFlags } from "discord.js";

export function fragFinnCommand(interaction: ChatInputCommandInteraction) {
  interaction.reply({
    content: "Our search engine has been informed.",
    flags: MessageFlags.Ephemeral,
  });

  let response = interaction.options.getString("question");
  response = "<@561491781733187584> " + response;
  interaction.channel.send(response);
}
