import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  Role
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
import { voiceChannelJoin } from "./commands/voice/channelJoin.js";
import { voiceChannelLeave } from "./commands/voice/channelLeave.js";
import { voiceMultipleJoin } from "./commands/voice/channelMultipleJoin.js";

const config = JSON.parse(fs.readFileSync("./src/data/config.json", "utf-8"));
const colors = JSON.parse(fs.readFileSync("./src/data/colors.json", "utf-8"));
const channels = JSON.parse(
  fs.readFileSync("./src/data/channels.json", "utf-8")
);

const { token, tSuckedServerID } = config;
const { customColors } = colors;
const { categories, gameChannels } = channels;

export const textToVoiceId = new Map<string, string>();
export let everyoneRole: Role;
const client = new Client({
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
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
});


client
  .login(token)
  .then(() => console.log(`Logged in successfully via: ${client.user.tag}`))
  .catch((err) => {
    console.log("Error logging into Discord: " + err);
  });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  client.guilds.fetch(tSuckedServerID).then((guild) => {
    everyoneRole = guild.roles.everyone;
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

// logic for text channel and role creation

client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.channelId === null) {
    //left
    voiceChannelLeave(oldState)
  } else if (oldState.channelId === null) {
    // joined
    voiceChannelJoin(newState)
  } else if (newState.channelId !== oldState.channelId) {
    // moved
    voiceChannelLeave(oldState)
    voiceChannelJoin(newState)
  }
});

