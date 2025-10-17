import { SlashCommandBuilder, Routes, REST } from "discord.js";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./data/config.json", "utf-8"));
const { clientId, guildId, token } = config;

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("creates a poll from your input")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("The text of the poll")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("the bot will ping this role")
    )
    .addStringOption((option) =>
      option
        .setName("reactions")
        .setDescription("these reactions will be added (default: ⬆️,⬇️)")
    ),

  new SlashCommandBuilder()
    .setName("fragfinn")
    .setDescription("redirects your question to our unique search engine")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The text of your question")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setcustomcolor")
    .setDescription("sets the color of your username (via HEX code)")
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("enter a color in HEX format (i.e.: #FA7A55)")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("setcolor")
    .setDescription("sets the color of your username")
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("choose one of the colors")
        .setRequired(true)
        .addChoices([
          { name: "Standard User (#c98577)", value: "user" },
          { name: "Navy Blue (#000080)", value: "navy" },
          { name: "Blue (#0000FF)", value: "blue" },
          { name: "Aqua Blue (#00FFFF)", value: "aqua" },
          { name: "Cyan Blue (#008080)", value: "cyan" },
          { name: "Dark Blue (#00008B)", value: "darkblue" },
          { name: "Lavender (#E6E6FA)", value: "lavender" },
          { name: "Purple (#800080)", value: "purple" },
          { name: "Dark Purple (#301934)", value: "darkpurple" },
          { name: "Magenta (#ff0092)", value: "magenta" },
          { name: "Pink (#dd02fa)", value: "pink" },
          { name: "Red (#ff0000)", value: "red" },
          { name: "Dark Red (#8B0000)", value: "darkred" },
          { name: "Wine Red (#722F37)", value: "wine" },
          { name: "Cherry Red (#D2042D)", value: "cherry" },
          { name: "Orange (#ff8800)", value: "orange" },
          { name: "Yellow (#FFFF00)", value: "yellow" },
          { name: "Maroon Brown (#800000)", value: "maroon" },
          { name: "Olive Green (#808000)", value: "olive" },
          { name: "Green (#008000)", value: "green" },
          { name: "Jade Green (#00A36C)", value: "jade" },
          { name: "Lime Green (#00FF00)", value: "lime" },
          { name: "Black (#000000)", value: "black" },
          { name: "Gray (#808080)", value: "gray" },
          { name: "White (#FFFFFF)", value: "white" },
        ])
    ),

  new SlashCommandBuilder()
    .setName("setrole")
    .setDescription("set which channels you want to see")
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("choose the channel you want to see")
        .setRequired(true)
        .addChoices([
          { name: "Minecraft", value: "mc" },
          { name: "Counter-Strike Global Offensive", value: "csgo" },
          { name: "Player Unknown Battlegrounds", value: "pubg" },
          { name: "Overwatch", value: "ow" },
          { name: "League of Legends", value: "lol" },
          { name: "Trouble in Terrorist Town", value: "ttt" },
          { name: "Valorant", value: "val" },
          { name: "Terraria", value: "terra" },
          { name: "Browser Games", value: "browser" },
          { name: "Genshin Impact", value: "genshin" },
          { name: "Pokémon", value: "poke" },
          { name: "Minecraft Event", value: "mc-event" },
          { name: "Film", value: "film" },
        ])
    )
    .addBooleanOption((option) =>
      option
        .setName("remove")
        .setDescription("set to true if you want to remove that game")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("deletes the specified amount of messages")
    .addIntegerOption((option) =>
      option
        .setName("messages")
        .setDescription("the amount of messages to delete")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

const rest = new REST().setToken(token);

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
