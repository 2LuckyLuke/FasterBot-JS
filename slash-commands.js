const {SlashCommandBuilder} = require('@discordjs/builders');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {clientId, guildId, token} = require('./config.json');


const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),

    new SlashCommandBuilder()
        .setName('poll')
        .setDescription('creates a poll from your input')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text of the poll')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("the bot will ping this role")
        )
        .addStringOption(option =>
            option.setName("reactions")
                .setDescription("these reactions will be added (default: ⬆️,⬇️)")
        ),

    new SlashCommandBuilder()
        .setName("fragfinn")
        .setDescription("redirects your question to our unique search engine")
        .addStringOption(option =>
            option.setName("question")
                .setDescription("The text of your question")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("setcustomcolor")
        .setDescription("sets the color of your username (via HEX code)")
        .addStringOption(option =>
            option.setName("color")
                .setDescription("enter a color in HEX format (i.e.: #FA7A55)")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("setcolor")
        .setDescription("sets the color of your username")
        .addStringOption(option =>
            option.setName("color")
                .setDescription("choose one of the colors")
                .setRequired(true)
                .addChoice("Standard User (#c98577)", "user")
                .addChoice("Navy Blue (#000080)", "navy")
                .addChoice("Blue (#0000FF)", "blue")
                .addChoice("Aqua Blue (#00FFFF)", "aqua")
                .addChoice("Cyan Blue (#008080)", "cyan")
                .addChoice("Dark Blue (#00008B)", "darkblue")
                .addChoice("Lavender (#E6E6FA)", "lavender")
                .addChoice("Purple (#800080)", "purple")
                .addChoice("Dark Purple (#301934)", "darkpurple")
                .addChoice("Magenta (#ff0092)", "magenta")
                .addChoice("Pink (#dd02fa)", "pink")
                .addChoice("Red (#ff0000)", "red")
                .addChoice("Dark Red (#8B0000)", "darkred")
                .addChoice("Wine Red (#722F37)", "wine")
                .addChoice("Cherry Red (#D2042D)", "cherry")
                .addChoice("Orange (#ff8800)", "orange")
                .addChoice("Yellow (#FFFF00)", "yellow")
                .addChoice("Maroon Brown (#800000)", "maroon")
                .addChoice("Olive Green (#808000)", "olive")
                .addChoice("Green (#008000)", "green")
                .addChoice("Jade Green (#00A36C)", "jade")
                .addChoice("Lime Green (#00FF00)", "lime")
                .addChoice("Black (#000000)", "black")
                .addChoice("Gray (#808080)", "gray")
                .addChoice("White (#FFFFFF)", "white")
        ),

    new SlashCommandBuilder()
        .setName("setrole")
        .setDescription("set which channels you want to see")
        .addStringOption(option =>
            option.setName("channel")
                .setDescription("choose the channel you want to see")
                .setRequired(true)
                .addChoice("Minecraft", "mc")
                .addChoice("Counter-Strike Global Offensive", "csgo")
                .addChoice("Player Unknown Battlegrounds", "pubg")
                .addChoice("Overwatch", "ow")
                .addChoice("League of Legends", "lol")
                .addChoice("Trouble in Terrorist Town", "ttt")
                .addChoice("Valorant", "val")
                .addChoice("Terraria", "terra")
                .addChoice("Browser Games", "browser")
                .addChoice("Genshin Impact", "genshin")
                .addChoice("Pokémon", "poke")
                .addChoice("Minecraft Event", "mc-event")
                .addChoice("NSFW channels", "nsfw")
        ).addBooleanOption(option =>
        option.setName("remove")
            .setDescription("set to true if you want to remove that game")
            .setRequired(false)
    ),

    new SlashCommandBuilder()
        .setName("clear")
        .setDescription("deletes the specified amount of messages")
        .addIntegerOption(option =>
            option.setName("messages")
                .setDescription("the amount of messages to delete")
                .setRequired(true)
        ),

].map(command => command.toJSON());

const rest = new REST({version: '9'}).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
