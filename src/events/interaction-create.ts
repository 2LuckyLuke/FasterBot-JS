import { MessageFlags } from "discord.js";
import type { Interaction } from "discord.js";
import { commands } from "../commands/index.js";

export async function onInteractionCreate(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  // narrows member/guild to non-null cached types for every command handler
  if (!interaction.inCachedGuild()) return;

  const command = commands.get(interaction.commandName);
  if (command === undefined) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`/${interaction.commandName} failed:`, error);
    const reply = {
      content: "Something went wrong running that command.",
      flags: MessageFlags.Ephemeral,
    } as const;
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
}
