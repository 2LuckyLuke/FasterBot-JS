import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { ChannelsJsonType, GameChannelsUnionString } from "../data/types.js";
import { getOrCreateRole } from "../index.js";

export async function setRoleCommand(interaction: ChatInputCommandInteraction, gameChannels: ChannelsJsonType['gameChannels']) {
    const usersRole = await getOrCreateRole(interaction);
    const channelName: GameChannelsUnionString = interaction.options.getString("channel") as GameChannelsUnionString;
    const channelId = gameChannels[channelName];
    
    const guild = interaction.guild
    if (guild === null || usersRole === undefined) return
    const textChannel= await guild.channels.fetch(channelId);
    if (textChannel === null || textChannel.isTextBased()) return
    const shouldRemoveRights = interaction.options.getBoolean("remove");
        if (shouldRemoveRights) {
          textChannel.permissionOverwrites.delete(usersRole.id);
          interaction.reply({
            content: "you can no longer see that channel",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          textChannel.permissionOverwrites.create(usersRole.id, {
            ViewChannel: true,
          });
          interaction.reply({
            content: "you can now see that channel",
            flags: MessageFlags.Ephemeral,
          });
        }
}
