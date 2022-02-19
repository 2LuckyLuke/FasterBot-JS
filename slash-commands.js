const {SlashCommandBuilder} = require('@discordjs/builders');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {clientId, guildId} = require('./config.json');


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
                .addChoice("Minecraft", "mc")
                .addChoice("Overwatch", "ow")
                .addChoice("League of Legends", "lol")
                .addChoice("Trouble in Terrorist Town", "ttt")
                .addChoice("All games", "all")

        ),

    new SlashCommandBuilder()
        .setName("setgame")
        .setDescription("set which channels you want to see")
        .addStringOption(option =>
            option.setName("game")
                .setDescription("choose the game you want to see")
                .setRequired(true)
                .addChoice("Minecraft", "mc")
                .addChoice("Overwatch", "ow")
                .addChoice("League of Legends", "lol")
                .addChoice("Trouble in Terrorist Town", "ttt")
                .addChoice("All games", "all")//new
        ),


].map(command => command.toJSON());

const rest = new REST({version: '9'}).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);