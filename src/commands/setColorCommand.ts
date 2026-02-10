import { ChatInputCommandInteraction, ColorResolvable, MessageFlags } from "discord.js";
import { getOrCreateRole } from "../index.js";
import { ColorsJsonType, CustomColorsUnionString } from "../data/types.js";

export async function setColorCommand(interaction: ChatInputCommandInteraction, customColors: ColorsJsonType['customColors']) {
    const usersRole = await getOrCreateRole(interaction);
    const color: CustomColorsUnionString = interaction.options.getString("color") as CustomColorsUnionString;
    if(usersRole === undefined || color === null) return
    usersRole.edit({
      color: customColors[color] as ColorResolvable,
    });
    interaction.reply({
      content: `Your color is now: ${ customColors[color] }`,
      flags: MessageFlags.Ephemeral,
    });
}
