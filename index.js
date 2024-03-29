const Discord = require("discord.js");
const {Intents, Permissions} = require("discord.js");
const {token} = require('./config.json');
const {customColors} = require("./colors.json");
const {gameChannels, categories} = require("./channels.json");
const {carousel_horse} = require("yarn/lib/cli");

let textToVoiceID = new Map();
let everyoneID;
const client = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
        Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_WEBHOOKS],
    restTimeOffset: 0,
});


client.login(token)
    .then(() => console.log(`Logged in successfully via: ${client.user.tag}`))
    .catch((err) => {
        console.log("Error logging into Discord: " + err);
    });

client.on("ready", () => {
    client.user.setActivity("you", {type: "WATCHING"});
    client.guilds.fetch("663511269696995364").then(guild => {
        everyoneID = guild.roles.everyone;
        //remove existing channels in category
        guild.channels.fetch(categories.voice).then((category) => {
            if (category.type === "GUILD_CATEGORY"){
                category.children.forEach(function (channel){
                    if (channel.type === "GUILD_TEXT") {
                        channel.delete().catch((err) => {
                            console.log("Error deleting text channel: " + err);
                        });
                    }else if (channel.isVoice && channel.members.size > 0) {
                        voiceMultipleJoin(channel.members.at(0).voice, channel.members);
                    }
                });
            }
        });
    });

    //todo fetch users in channels and text channels in other category
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    //ping command
    if (interaction.commandName === 'ping') {
        commands.ping();
        interaction.reply({content: 'Pong!'});
    }

    //poll command
    if (interaction.commandName === "poll") {
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

        } else {
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
        interaction.reply({content: "Our search engine has been informed.", ephemeral: true});

        let response = interaction.options.getString("question");
        response = "<@561491781733187584> " + response;
        interaction.channel.send(response);
    }

    //setrole command
    if (interaction.commandName === "setrole") {
        try {
            let usersRole = await getOrCreateRole(interaction);
            //setrole for nsfw
            if (interaction.options.getString("channel") === "nsfw") {
                if (interaction.options.getBoolean("remove") === true) {
                    interaction.guild.channels.fetch("828395755265720320").then(c => {
                        c.permissionOverwrites.delete(usersRole.id);
                    });
                    interaction.guild.channels.fetch("792028626517622784").then(c => {
                        c.permissionOverwrites.delete(usersRole.id);
                    });
                    interaction.reply({content: "you can no longer see those channels", ephemeral: true});
                } else {
                    if (interaction.member.roles.cache.find(role => role.id === "726881878816063528")) {
                        interaction.guild.channels.fetch("828395755265720320").then(c => {
                            c.permissionOverwrites.create(usersRole.id, {VIEW_CHANNEL: true});
                        });
                        interaction.guild.channels.fetch("792028626517622784").then(c => {
                            c.permissionOverwrites.create(usersRole.id, {VIEW_CHANNEL: true});
                        });
                        interaction.reply({content: "you can now see those channels", ephemeral: true});
                    } else {
                        interaction.reply({
                            content: "only members of the <@&726881878816063528> role are allowed for the nsfw role",
                            ephemeral: true
                        });
                    }
                }
            } else {
                interaction.guild.channels.fetch(gameChannels[interaction.options.getString("channel")]).then((c) => {
                    if (c !== null) {
                        if (interaction.options.getBoolean("remove") === true) {
                            c.permissionOverwrites.delete(usersRole.id);
                            interaction.reply({content: "you can no longer see that channel", ephemeral: true});
                        } else {
                            c.permissionOverwrites.create(usersRole.id, {VIEW_CHANNEL: true});
                            interaction.reply({content: "you can now see that channel", ephemeral: true});
                        }
                    } else {
                        console.log("something went wrong; the fetched channel was null");
                        interaction.reply({content: "Something went wrong; try again.", ephemeral: true});
                    }
                });
            }
        } catch (e) {
            console.log(e);
            interaction.reply({content: "Something went wrong; try again.", ephemeral: true});
        }

    }

    //setcolor command
    if (interaction.commandName === "setcolor") {
        try {
            let usersRole = await getOrCreateRole(interaction);
            usersRole.edit({
                color: customColors[interaction.options.getString("color")]
            });
            interaction.reply({
                content: `Your color is now: ${customColors[interaction.options.getString("color")]}`,
                ephemeral: true
            });
        } catch (e) {
            console.log(e);
            interaction.reply({content: `Something went wrong; try again.`, ephemeral: true});
        }
    }

    //setcustomcolor command
    if (interaction.commandName === "setcustomcolor") {
        let regex = /#(?:[a-f\d]{3}){1,2}\b/i;
        if (regex.test(interaction.options.getString("color"))) {
            let usersRole = await getOrCreateRole(interaction);
            usersRole.edit({
                color: interaction.options.getString("color")
            });
            interaction.reply({
                content: `Your color is now: ${interaction.options.getString("color")}`,
                ephemeral: true
            });
        } else {
            interaction.reply({
                content: `${interaction.options.getString("color")} is not a valid Hex Color. Use this if you need help: https://rgbacolorpicker.com/hex-color-picker`,
                ephemeral: true
            });
        }
    }

    //clear command
    if  (interaction.commandName === "clear") {
        let messageNumber = interaction.options.getInteger("messages");
        try {
            if (messageNumber > 100){
                throw "To many messages; Max amount is `100`";
            }

            interaction.channel.messages.fetch({limit: messageNumber}).then(messages =>{
                interaction.channel.bulkDelete(messages);
                messageNumber = 0;
                for(let [key, value] of messages){
                    messageNumber++;
                }
                interaction.reply({
                    content: `Deleted \`${messageNumber}\` messages.`,
                    ephemeral: true
                })
            });

        }catch (e){
            interaction.reply({
                content: `Error: ${e}`,
                ephemeral: true
            })
        }

    }

});

client.on("messageCreate", async msg => {
    if (msg.author.bot) return;

    //message starts with '.' (NotSoBot)
    if (msg.content[0] === ".") {
        msg.delete();
    }

    //upvotes in meme channel
    if (msg.channelId !== "663522966633709568") return;
    linkCheck = msg.content.split(":");

    if (msg.attachments.size > 0 || linkCheck[0].toLowerCase().includes("http")) {
        msg.react("⬆️");
        msg.react("⬇️");
    }
});

function getOrCreateRole(interaction) {

    //if the user has no own role: create it
    if (!(interaction.member.roles).cache.some(r => r.name === interaction.user.username)) {
        return interaction.guild.roles.create({
            name: interaction.user.username,
            color: customColors.user,
        }).then((role) => {
            interaction.member.roles.add(role);
            return role;
        });
    } else {
        return interaction.member.roles.cache.find(role => role.name === interaction.user.username);
    }
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



client.on("voiceStateUpdate", (oldState, newState) => {
    if (newState.channelId === null) { //left
        voiceLeave(oldState);
    } else if (oldState.channelId === null) { // joined
        voiceJoin(newState);
    } else if (newState.channelId !== oldState.channelId) { // moved
        voiceLeave(oldState);
        voiceJoin(newState);
    }
});

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

function voiceMultipleJoin(state, members) {
    if (textToVoiceID.has(state.channel.id)){
        state.guild.channels.fetch(textToVoiceID.get(state.channel.id)).then(textChannel => {
            members.forEach((member) => {
                try {
                    textChannel.permissionOverwrites.create(member.id, {VIEW_CHANNEL: true});
                } catch (e) {
                    console.log(e);
                }
            })
        });
    } else {
        let channelName = state.channel.name;
        channelName = channelName.substring(channelName.indexOf(" "));
        let overwrites = [{type: "role", id: everyoneID, deny: [Permissions.FLAGS.VIEW_CHANNEL]}];
        members.forEach((member) => {
            overwrites.push({type: "member", id: member.id, allow: [Permissions.FLAGS.VIEW_CHANNEL]});
        })
        state.guild.channels.create(channelName, {
            type: "GUILD_TEXT",
            parent: state.channel.parent,
            permissionOverwrites: overwrites
        }).then(textChannel => {
            textToVoiceID.set(state.channel.id, textChannel.id);
        });

    }
}

function createTextChannel(channelName, state) {

    state.guild.channels.create(channelName, {
        type: "GUILD_TEXT",
        parent: state.channel.parent,
        permissionOverwrites: [
            {type: "role", id: everyoneID, deny: [Permissions.FLAGS.VIEW_CHANNEL]},
            {type: "member", id: state.member.id, allow: [Permissions.FLAGS.VIEW_CHANNEL]},
        ]
    }).then(textChannel => {
        textToVoiceID.set(state.channel.id, textChannel.id);
    });
}
