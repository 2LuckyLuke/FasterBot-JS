import { VoiceState, Collection, GuildMember } from "discord.js";
import { textToVoiceId } from "../../index.js";
import { createTextChannel } from "./helpers/createTextChannelToJoinedVoice.js";
import { updateTextChannelVisibility } from "./updateTextChannelVisibilty.js";

export async function voiceMultipleJoin(
  state: VoiceState,
  members: Collection<string, GuildMember>
) {
  const joinedVoiceChannel = state.channel
  const textChannelId: string | undefined = textToVoiceId.get(joinedVoiceChannel.id)

  if (textChannelId !== undefined) {
    const textChannel = await state.guild.channels.fetch(textChannelId)
    members.forEach(member => updateTextChannelVisibility(member.id, 'visible', textChannel))
  } else {
    let channelName = state.channel.name;
    const sanitizedChannelName = channelName.substring(channelName.indexOf(" "));
    createTextChannel(sanitizedChannelName, state, members)
  }
}
