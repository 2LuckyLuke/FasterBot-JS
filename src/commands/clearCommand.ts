import { MessageFlags } from "discord.js";

export function clearCommand(interaction) {
  let messageNumber = interaction.options.getInteger("messages");
  try {
    if (messageNumber > 100) {
      throw "To many messages; Max amount is `100`";
    }

    interaction.channel.messages
      .fetch({ limit: messageNumber })
      .then((messages) => {
        interaction.channel.bulkDelete(messages);
        messageNumber = 0;
        for (let [key, value] of messages) {
          messageNumber++;
        }
        interaction.reply({
          content: `Deleted \`${messageNumber}\` messages.`,
          flags: MessageFlags.Ephemeral,
        });
      });
  } catch (e) {
    interaction.reply({
      content: `Error: ${e}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
