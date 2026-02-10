import { ChatInputCommandInteraction, MessageFlags, TextChannel } from "discord.js";

export function fragFinnCommand(interaction: ChatInputCommandInteraction) {
  if(interaction.channel === null) return
  interaction.reply({
    content: "Our search engine has been informed.",
    flags: MessageFlags.Ephemeral,
  });

  const question = interaction.options.getString("question");
  const response = `<@561491781733187584> ${question}`;

  interaction.followUp(response)
}
