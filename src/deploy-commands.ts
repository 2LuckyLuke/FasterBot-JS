import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";
import { config } from "./config.js";

// one-off registration of the slash commands with Discord (yarn deploy).
// run after changing any command's name, options, or choices — the bot
// process itself never registers commands.
const rest = new REST().setToken(config.token);

const application = (await rest.get(Routes.currentApplication())) as { id: string };
const body = commands.map((command) => command.data.toJSON());

await rest.put(Routes.applicationGuildCommands(application.id, config.guildId), { body });
console.log(`Registered ${body.length} slash commands for guild ${config.guildId}.`);
