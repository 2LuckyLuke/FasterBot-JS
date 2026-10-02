import type { Collection, GuildMember, VoiceState } from "discord.js";
import {
  createCompanionTextChannel,
  forgetVoiceChannel,
  getTextChannelId,
  isPersistent,
  setMemberVisibility,
} from "./manager.js";

export async function onVoiceJoin(state: VoiceState): Promise<void> {
  const voiceChannel = state.channel;
  if (voiceChannel === null || state.member === null) return;

  const textChannelId = getTextChannelId(voiceChannel.id);
  if (textChannelId === undefined) {
    await createCompanionTextChannel(voiceChannel, voiceChannel.members);
    return;
  }
  const textChannel = await state.guild.channels.fetch(textChannelId);
  if (textChannel !== null) {
    await setMemberVisibility(textChannel, state.member.id, true);
  }
}

export async function onVoiceMembersJoin(
  state: VoiceState,
  members: Collection<string, GuildMember>,
): Promise<void> {
  const voiceChannel = state.channel;
  if (voiceChannel === null) return;

  const textChannelId = getTextChannelId(voiceChannel.id);
  if (textChannelId === undefined) {
    await createCompanionTextChannel(voiceChannel, members);
    return;
  }
  const textChannel = await state.guild.channels.fetch(textChannelId);
  if (textChannel === null) return;
  for (const member of members.values()) {
    await setMemberVisibility(textChannel, member.id, true);
  }
}

export async function onVoiceLeave(state: VoiceState): Promise<void> {
  const voiceChannel = state.channel;
  if (voiceChannel === null || state.member === null) return;

  const textChannelId = getTextChannelId(voiceChannel.id);
  if (textChannelId === undefined) return;
  const textChannel = await state.guild.channels.fetch(textChannelId);
  if (textChannel === null) return;

  await setMemberVisibility(textChannel, state.member.id, false);

  if (voiceChannel.members.size <= 0 && !isPersistent(voiceChannel.id)) {
    // last member left and the channel isn't marked persistent: it goes with them
    await textChannel.delete();
    forgetVoiceChannel(voiceChannel.id);
  }
}
