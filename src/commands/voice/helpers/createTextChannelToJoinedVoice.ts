import { ChannelType, Collection, GuildMember, OverwriteResolvable, OverwriteType, PermissionFlagsBits, VoiceState } from "discord.js";
import { everyoneRole, textToVoiceId } from "../../../index.js";

export async function createTextChannel(channelName: string, state: VoiceState, members: Collection<string, GuildMember>) {
  const joinedVoiceChannel = state.channel
  if (joinedVoiceChannel === null) { return }

  const overWrites: OverwriteResolvable[] = [
    {
      type: OverwriteType.Role,
      id: everyoneRole.id,
      deny: [PermissionFlagsBits.ViewChannel]
    }
  ]

  members.forEach(member => overWrites.push({
    type: OverwriteType.Member,
    id: member.id,
    allow: [PermissionFlagsBits.ViewChannel]
  }));

  state.guild.channels
    .create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: joinedVoiceChannel.parent,
      permissionOverwrites: overWrites,
    })
    .then((textChannel) => {
      textToVoiceId.set(joinedVoiceChannel.id, textChannel.id);
    });
}
