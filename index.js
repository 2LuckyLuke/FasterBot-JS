import {
  Events,
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ChannelType,
  OverwriteType,
  ActivityType,
} from "discord.js";

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

const { token, tSuckedServerID } = config;
const { customColors } = colors;
const { categories, gameChannels } = channels;

let textToVoiceID = new Map();
let everyoneID;
const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
  ],
  restTimeOffset: 0,
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client
  .login(token)
  .then(() => console.log(`Logged in successfully via: ${client.user.tag}`))
  .catch((err) => {
    console.log("Error logging into Discord: " + err);
  });

client.on("ready", () => {
  client.user.setActivity("you", { type: ActivityType.Watching });
  client.guilds.fetch(tSuckedServerID).then((guild) => {
    everyoneID = guild.roles.everyone;
    //remove existing channels in category
    guild.channels.fetch(categories.voice).then((category) => {
      if (category.type !== ChannelType.GuildCategory) {
        return;
      }
      category.children.cache.each((channel) => {
        if (channel.type === ChannelType.GuildText) {
          channel.delete().catch((err) => {
            console.log("Error deleting text channel: " + err);
          });
        } else if (
          channel.type === ChannelType.GuildVoice &&
          channel.members.size > 0
        ) {
          voiceMultipleJoin(channel.members.at(0).voice, channel.members);
        }
      });
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
  const isLink = msg.content.split(":")[0].toLowerCase().includes("http");

  if (msg.attachments.size > 0 || isLink) {
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
  // This regex matches most Unicode emojis, but not numbers or Discord custom emoji syntax
  const emojiRegex = /([\p{Emoji_Presentation}\u200d\ufe0f]+)/gu;
  const emojis = textInput.match(emojiRegex);
  return emojis ? emojis : [];
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
            ViewChannel: true,
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
              ViewChannel: true,
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
      {
        type: OverwriteType.Role,
        id: everyoneID,
        deny: [PermissionFlagsBits.ViewChannel],
      },
    ];
    members.forEach((member) => {
      overwrites.push({
        type: OverwriteType.Member,
        id: member.id,
        allow: [PermissionFlagsBits.ViewChannel],
      });
    });
    state.guild.channels
      .create({
        name: channelName,
        type: ChannelType.GuildText,
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
    .create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: state.channel.parent,
      permissionOverwrites: [
        {
          type: OverwriteType.Role,
          id: everyoneID,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          type: OverwriteType.Member,
          id: state.member.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    })
    .then((textChannel) => {
      textToVoiceID.set(state.channel.id, textChannel.id);
    });
}
