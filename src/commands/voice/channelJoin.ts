import { VoiceState } from "discord.js";
import { textToVoiceId } from "../../index.js";
import { updateTextChannelVisibility } from "./updateTextChannelVisibilty.js";
import { createTextChannel } from "./helpers/createTextChannelToJoinedVoice.js";

export async function voiceChannelJoin(newState: VoiceState) {
    const joinedVoiceChannel = newState.channel;
    if (joinedVoiceChannel === null || newState.member === null) {
        return
    }
    const textChannelId = textToVoiceId.get(joinedVoiceChannel.id);

    if (textChannelId !== undefined) { // already someone in the channel
        const textChannel = await newState.guild.channels.fetch(textChannelId);
        const joinedMemberId = newState.member.id;
        if (textChannel !== null) {
            updateTextChannelVisibility(joinedMemberId, 'visible', textChannel);
        }
    } else {
        const channelName = joinedVoiceChannel.name;
        const sanitizedChannelName = channelName.substring(channelName.indexOf(" "));
        createTextChannel(sanitizedChannelName, newState, joinedVoiceChannel.members)
    }
}