import type { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from "discord.js";

// every command bundles its registration data with its handler, so the
// definitions PUT to Discord by deploy-commands can never drift from the code
export interface Command {
  data: SlashCommandOptionsOnlyBuilder;
  execute(interaction: ChatInputCommandInteraction<"cached">): Promise<void>;
}
