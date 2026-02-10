import { VoiceState } from "discord.js";
import { textToVoiceId } from "../../index.js";
import { updateTextChannelVisibility } from "./updateTextChannelVisibilty.js";

export async function voiceChannelLeave(oldState: VoiceState) {
    const leftVoiceChannel = oldState.channel
    if (leftVoiceChannel === null || oldState.member === null) {
        return
    }
    const oldVoiceMembers = leftVoiceChannel.members
    const textChannelId = textToVoiceId.get(leftVoiceChannel.id)
    if (textChannelId === undefined) { return }

    const textChannel = await oldState.guild.channels.fetch(textChannelId)
    if (textChannel === null) { return }

    if (oldVoiceMembers.size <= 0) { //last member left voice channel
        textChannel.delete();
        textToVoiceId.delete(leftVoiceChannel.id)
    } else { //still member(s) in the voice channel
        const leftMemberId = oldState.member.id
        updateTextChannelVisibility(leftMemberId, 'hidden', textChannel)
    }
}