import Discord from "discord.js";
import { Intents, Permissions } from "discord.js";

import fs from "fs";

import {
  clearCommand,
  fragFinnCommand,
  pollCommand,
  setColorCommand,
  setCustomColorCommand,
  setRoleCommand,
} from "./commands/index.js";

const config = JSON.parse(fs.readFileSync("./data/config.json", "utf-8"));
const colors = JSON.parse(fs.readFileSync("./data/colors.json", "utf-8"));
const channels = JSON.parse(fs.readFileSync("./data/channels.json", "utf-8"));

const { token } = config;
const { customColors } = colors;
const { categories, gameChannels } = channels;

let textToVoiceID = new Map();
let everyoneID;
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_WEBHOOKS,
  ],
  restTimeOffset: 0,
});

client
  .login(token)
  .then(() => console.log(`Logged in successfully via: ${client.user.tag}`))
  .catch((err) => {
    console.log("Error logging into Discord: " + err);
  });

client.on("ready", () => {
  client.user.setActivity("you", { type: "WATCHING" });
  client.guilds.fetch("663511269696995364").then((guild) => {
    everyoneID = guild.roles.everyone;
    //remove existing channels in category
    guild.channels.fetch(categories.voice).then((category) => {
      if (category.type === "GUILD_CATEGORY") {
        category.children.forEach(function (channel) {
          if (channel.type === "GUILD_TEXT") {
            channel.delete().catch((err) => {
              console.log("Error deleting text channel: " + err);
            });
          } else if (channel.isVoice && channel.members.size > 0) {
            voiceMultipleJoin(channel.members.at(0).voice, channel.members);
          }
        });
      }
    });
  });

  //todo fetch users in channels and text channels in other category
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  //ping command
  if (interaction.commandName === "ping") {
    interaction.reply({ content: "Pong!" });
  }

  //poll command
  if (interaction.commandName === "poll") {
    pollCommand(interaction);
  }

  //fragfinn command
  if (interaction.commandName === "fragfinn") {
    fragFinnCommand(interaction);
  }

  //setrole command
  if (interaction.commandName === "setrole") {
    setRoleCommand(interaction, gameChannels);
  }

  //setcolor command
  if (interaction.commandName === "setcolor") {
    setColorCommand(interaction, customColors);
  }

  //setcustomcolor command
  if (interaction.commandName === "setcustomcolor") {
    setCustomColorCommand(interaction);
  }

  //clear command
  if (interaction.commandName === "clear") {
    clearCommand(interaction);
  }
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  //message starts with '.' (delete messages that are meant for the NotSoBot)
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

export function getOrCreateRole(interaction) {
  //if the user has no own role: create it
  if (
    !interaction.member.roles.cache.some(
      (r) => r.name === interaction.user.username
    )
  ) {
    return interaction.guild.roles
      .create({
        name: interaction.user.username,
        color: customColors.user,
      })
      .then((role) => {
        interaction.member.roles.add(role);
        return role;
      });
  } else {
    return interaction.member.roles.cache.find(
      (role) => role.name === interaction.user.username
    );
  }
}

export function getEmojisFromString(textInput) {
  const reactions = textInput.match(/\p{Emoji}/gu);
  return reactions ? reactions : [];
}

// logic for text and role creation

client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.channelId === null) {
    //left
    voiceLeave(oldState);
  } else if (oldState.channelId === null) {
    // joined
    voiceJoin(newState);
  } else if (newState.channelId !== oldState.channelId) {
    // moved
    voiceLeave(oldState);
    voiceJoin(newState);
  }
});

function voiceLeave(state) {
  if (!state.channel.members.size > 0) {
    state.guild.channels
      .fetch(textToVoiceID.get(state.channel.id))
      .then((channel) => {
        try {
          channel.delete();
          textToVoiceID.delete(state.channel.id);
        } catch (e) {
          console.log(e);
        }
      });
  } else {
    state.guild.channels
      .fetch(textToVoiceID.get(state.channel.id))
      .then((channel) => {
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
    state.guild.channels
      .fetch(textToVoiceID.get(state.channel.id))
      .then((textChannel) => {
        try {
          textChannel.permissionOverwrites.create(state.member.id, {
            VIEW_CHANNEL: true,
          });
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
  if (textToVoiceID.has(state.channel.id)) {
    state.guild.channels
      .fetch(textToVoiceID.get(state.channel.id))
      .then((textChannel) => {
        members.forEach((member) => {
          try {
            textChannel.permissionOverwrites.create(member.id, {
              VIEW_CHANNEL: true,
            });
          } catch (e) {
            console.log(e);
          }
        });
      });
  } else {
    let channelName = state.channel.name;
    channelName = channelName.substring(channelName.indexOf(" "));
    let overwrites = [
      { type: "role", id: everyoneID, deny: [Permissions.FLAGS.VIEW_CHANNEL] },
    ];
    members.forEach((member) => {
      overwrites.push({
        type: "member",
        id: member.id,
        allow: [Permissions.FLAGS.VIEW_CHANNEL],
      });
    });
    state.guild.channels
      .create(channelName, {
        type: "GUILD_TEXT",
        parent: state.channel.parent,
        permissionOverwrites: overwrites,
      })
      .then((textChannel) => {
        textToVoiceID.set(state.channel.id, textChannel.id);
      });
  }
}

function createTextChannel(channelName, state) {
  state.guild.channels
    .create(channelName, {
      type: "GUILD_TEXT",
      parent: state.channel.parent,
      permissionOverwrites: [
        {
          type: "role",
          id: everyoneID,
          deny: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
          type: "member",
          id: state.member.id,
          allow: [Permissions.FLAGS.VIEW_CHANNEL],
        },
      ],
    })
    .then((textChannel) => {
      textToVoiceID.set(state.channel.id, textChannel.id);
    });
}
