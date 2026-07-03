import type { Message } from "discord.js";
import { memesChannelId } from "../data/channels.js";

export async function onMessageCreate(message: Message): Promise<void> {
  if (message.author.bot) return;

  // delete messages meant for the (long gone) NotSoBot
  if (message.content.startsWith(".")) {
    await message.delete();
    return;
  }

  // up/downvote reactions on images and links in the memes channel
  if (message.channelId !== memesChannelId) return;
  const isLink = message.content.split(":")[0]?.toLowerCase().includes("http") ?? false;
  if (message.attachments.size > 0 || isLink) {
    await message.react("⬆️");
    await message.react("⬇️");
  }
}
