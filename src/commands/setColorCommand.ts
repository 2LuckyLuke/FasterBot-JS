import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getOrCreateRole } from "../index.js";
import { ColorsJsonType } from "../data/types.js";

export async function setColorCommand(interaction: ChatInputCommandInteraction, customColors: ColorsJsonType['customColors']) {
  try {
    let usersRole = await getOrCreateRole(interaction);
    usersRole.edit({
      color: customColors[interaction.options.getString("color")],
    });
    interaction.reply({
      content: `Your color is now: ${
        customColors[interaction.options.getString("color")]
      }`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (e) {
    console.log("Caught Error: ", e);
    interaction.reply({
      content: `Something went wrong; try again.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
