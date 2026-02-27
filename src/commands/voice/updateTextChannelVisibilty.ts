import { ChannelType, GuildBasedChannel } from "discord.js";

export function updateTextChannelVisibility(memberId: string, channelVisibility: 'visible' | 'hidden', channel?: GuildBasedChannel,): void {
    const channelExists = channel !== null && channel !== undefined;
    if (channelExists && channel.type === ChannelType.GuildText && memberId !== undefined) {
        channelVisibility === 'visible' ?
            channel.permissionOverwrites.create(memberId, { ViewChannel: true }) :
            channel.permissionOverwrites.delete(memberId);
    }
}