import { VoiceState } from "discord.js";
import { textToVoiceId } from "../../index.js";
import { updateTextChannelVisibility } from "./updateTextChannelVisibilty.js";

export async function voiceChannelLeave(oldState: VoiceState) {
    const leftVoiceChannel = oldState.channel
    const oldVoiceMembers = leftVoiceChannel.members
    const textChannelId = textToVoiceId.get(leftVoiceChannel.id)
    const textChannel = await oldState.guild.channels.fetch(textChannelId)

    if (oldVoiceMembers.size < 0) { //last member left voice channel
        textChannel.delete();
        textToVoiceId.delete(textChannelId)
    } else { //still member(s) in the voice channel
        const leftMemberId = oldState.member.id
        updateTextChannelVisibility(leftMemberId, 'hidden', textChannel)
    }
}