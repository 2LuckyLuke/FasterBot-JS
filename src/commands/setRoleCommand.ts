import { ChannelType, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getOrCreateRole } from "../index.js";
import { ChannelsJsonType } from "../data/types.js";

export async function setRoleCommand(interaction: ChatInputCommandInteraction, gameChannels: ChannelsJsonType['gameChannels']) {
  try {
    const usersRole = await getOrCreateRole(interaction);
    const channelName = interaction.options.getString("channel");
    const channelId = gameChannels[channelName];

    interaction.guild.channels.fetch(channelId).then((channel) => {
      if (channel === null || channel.type !== ChannelType.GuildText) {
        interaction.reply({
          content: "Something went wrong; try again.",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        if (interaction.options.getBoolean("remove") === true) {
          channel.permissionOverwrites.delete(usersRole.id);
          interaction.reply({
            content: "you can no longer see that channel",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          channel.permissionOverwrites.create(usersRole.id, {
            ViewChannel: true,
          });
          interaction.reply({
            content: "you can now see that channel",
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    });
  } catch (e) {
    console.log("Caught Error: ", e);
    interaction.reply({
      content: "Something went wrong; try again.",
      flags: MessageFlags.Ephemeral,
    });
  }
}
