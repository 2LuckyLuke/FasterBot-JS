import { MessageFlags } from "discord.js";
import { getOrCreateRole } from "../index.js";

export async function setCustomColorCommand(interaction) {
  let regex = /#(?:[a-f\d]{3}){1,2}\b/i;
  if (regex.test(interaction.options.getString("color"))) {
    let usersRole = await getOrCreateRole(interaction);
    usersRole.edit({
      color: interaction.options.getString("color"),
    });
    interaction.reply({
      content: `Your color is now: ${interaction.options.getString("color")}`,
      flags: MessageFlags.Ephemeral,
    });
  } else {
    interaction.reply({
      content: `${interaction.options.getString(
        "color"
      )} is not a valid Hex Color. Use this if you need help: https://rgbacolorpicker.com/hex-color-picker`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
