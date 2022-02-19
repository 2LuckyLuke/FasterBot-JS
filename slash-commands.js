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


].map(command => command.toJSON());

const rest = new REST({version: '9'}).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
