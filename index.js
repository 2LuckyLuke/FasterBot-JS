const Discord = require("discord.js");
const {Intents, Permissions} = require("discord.js");
const {token} = require('./config.json');
const {customColors} = require("./colors.json");


const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
        Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_WEBHOOKS],
    restTimeOffset: 0,
});

client.on("ready", () => {
    console.log(`Login successfull: ${client.user.tag}`);
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    //ping command
    if (interaction.commandName === 'ping') {
        interaction.reply({content: 'Pong!'});
    }

    //poll command
    if (interaction.commandName === "poll") {
        //console.log(interaction);
        let textToSend = interaction.options.getString("text");
        let role = interaction.options.getRole("role");
	let message;
        if (role !== null) {
            textToSend += ` ${role}`;
	    allowedRole = role.id;

	    message = await interaction.reply({
		allowedMentions: {roles: [role.id]},
		content: textToSend,
		fetchReply: true
	    });

        } else{
	    message = await interaction.reply({
		    content: textToSend,
		    fetchReply: true
	    });
	}
        let reactions = interaction.options.getString("reactions");
        if (reactions !== null) {
            let emojis = getEmojisFromString(reactions)
            for (let i = 0; i < emojis.length; i++) {
                message.react(emojis[i]);
            }
        } else {
            message.react("⬆️");
            message.react("⬇️");
        }
    }

    //fragfinn command
    if (interaction.commandName === "fragfinn") {
        interaction.reply({content: "Our search engine has been informed.", ephemeral: true})

        let response = interaction.options.getString("question");
        response = "<@561491781733187584> " + response;
        interaction.channel.send(response)
    }

    //setgame command
    if (interaction.commandName === "setgame") {

        let usersRole = getOrCreateRole(interaction);

        interaction.reply({content: "you can now see that channel", ephemeral: true});
    }

    //setcolor command
    if (interaction.commandName === "setcolor") {

        let usersRole = getOrCreateRole(interaction);

        interaction.reply({content: `Your color is now: ${interaction.options.getString("color")}`, ephemeral: true});
    }

    //setcustomcolor command
    if (interaction.commandName === "setcustomcolor") {
        let regex = /#(?:[a-f\d]{3}){1,2}\b/i;
        if(regex.test(interaction.options.getString("color"))){
            let usersRole = getOrCreateRole(interaction);
            usersRole.edit({
                color: interaction.options.getString("color")
            });
            interaction.reply({content: `Your color is now: ${interaction.options.getString("color")}`, ephemeral: true});
        }else {
            interaction.reply({
                content: `${interaction.options.getString("color")} is not a valid Hex Color. 
                    Use this if you need help: https://rgbacolorpicker.com/hex-color-picker`,
                ephemeral: true
            });
        }

    }


});


client.on("messageCreate", async msg => {
    if (msg.author.bot) return;

    //message starts with '.' (NotSoBot)
    if (msg.content[0] === "."){
        msg.delete();
    }

    //upvotes in meme channel
    if (msg.channelId !== "663522966633709568") return;
    linkCheck = msg.content.split(":");

    if (msg.attachments.size > 0
        || linkCheck[0].toLowerCase().includes("http")
    ) {
        msg.react("⬆️");
        msg.react("⬇️");
    }
});

client.login(token);

function getOrCreateRole(interaction){

    //if the user has no own role: create it
    if (!(interaction.member.roles).cache.some(r => r.name === interaction.user.username)) {
        interaction.guild.roles.create({
            name: interaction.user.username,
            color: customColors.user,
        }).then((role) => {
            interaction.member.roles.add(role);
        });
    }

    return interaction.member.roles.cache.find(role => role.name === interaction.user.username);
}

function getEmojisFromString(textInput) {
    let inputs = textInput.split("");
    let reactions = [];
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].match(/\p{Emoji}/gu) && !inputs[i].match(/[0-9]/g)) {
            reactions.push(inputs[i]);
        }
    }
    return reactions;
}

// logic for text and role creation

let textToVoiceID = new Map();

let everyoneID;
client.guilds.fetch("663511269696995364").then(guild => {
    everyoneID = guild.roles.everyone;
});


client.on("voiceStateUpdate", (oldState, newState) => {
    if (newState.channelId === null) { //left
        voiceLeave(oldState);
    } else if (oldState.channelId === null) { // joined
        voiceJoin(newState);
    } else if (newState.channelId === null && oldState.channelId === null){ // moved
        voiceLeave(oldState);
        voiceJoin(newState);
    }
})

function voiceLeave(state) {
    if (!state.channel.members.size > 0) {
        state.guild.channels.fetch(textToVoiceID.get(state.channel.id)).then(channel => {
            try {
                channel.delete();
                textToVoiceID.delete(state.channel.id);
            } catch (e) {
                console.log(e);
            }
        });
    } else {
        state.guild.channels.fetch(textToVoiceID.get(state.channel.id)).then(channel => {
            try {
                channel.permissionOverwrites.delete(state.member.id);
            } catch (e) {
                console.log(e);
            }
        });
    }
}

function voiceJoin(state) {
    if (textToVoiceID.has(state.channel.id)) {
        state.guild.channels.fetch(textToVoiceID.get(state.channel.id)).then(textChannel => {
            try {
                textChannel.permissionOverwrites.create(state.member.id, {VIEW_CHANNEL: true});
            } catch (e) {
                console.log(e);
            }
        });
    } else {
        let channelName = state.channel.name;
        channelName = channelName.substring(channelName.indexOf(" "));
        createTextChannel(channelName, state);
    }
}

function createTextChannel(channelName, state) {
    state.guild.channels.create(channelName, {
        type: "GUILD_TEXT",
        parent: "663511269696995375",
        permissionOverwrites: [
            {type: "role", id: everyoneID, deny: [Permissions.FLAGS.VIEW_CHANNEL]},
            {type: "member", id: state.member.id, allow: [Permissions.FLAGS.VIEW_CHANNEL]},
        ]
    }).then(textChannel => {
        textToVoiceID.set(state.channel.id, textChannel.id);
    });
}