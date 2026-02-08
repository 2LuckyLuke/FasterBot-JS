import { ChannelType } from "discord.js";
import { ChatInputCommandInteraction, MessageFlags } from "discord.js";

export async function clearCommand(interaction: ChatInputCommandInteraction) {
  const messageNumber = interaction.options.getInteger("messages") ?? 0;
  try {
    if (messageNumber > 100) {
      throw "To many messages; Max amount is `100`";
    }

    const channelToClear = await interaction.guild?.channels.fetch(interaction.channelId)
    if(channelToClear === null || channelToClear === undefined || channelToClear.type !== ChannelType.GuildText) {
      return
    }

    channelToClear.messages
      .fetch({ limit: messageNumber })
      .then((messages) => {
        channelToClear.bulkDelete(messages);
        interaction.reply({
          content: `Deleted \`${messages.size}\` messages.`,
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
