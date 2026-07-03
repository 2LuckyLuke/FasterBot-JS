import type { ChatInputCommandInteraction, Role } from "discord.js";
import { customColors } from "../data/colors.js";

// every user gets a personal role named after their username; the color commands edit it
export async function getOrCreateUserRole(
  interaction: ChatInputCommandInteraction<"cached">,
): Promise<Role> {
  const existing = interaction.member.roles.cache.find(
    (role) => role.name === interaction.user.username,
  );
  if (existing !== undefined) return existing;

  const role = await interaction.guild.roles.create({
    name: interaction.user.username,
    color: customColors.user.hex,
  });
  await interaction.member.roles.add(role);
  return role;
}
