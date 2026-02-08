import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  ColorResolvable,
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
import { ChannelsJsonType, ColorsJsonType, ConfigJsonType } from "./data/types.js";

const config: ConfigJsonType = JSON.parse(fs.readFileSync("./src/data/config.json", "utf-8"));
const colors: ColorsJsonType = JSON.parse(fs.readFileSync("./src/data/colors.json", "utf-8"));
const channels: ChannelsJsonType = JSON.parse(
  fs.readFileSync("./src/data/channels.json", "utf-8")
);

const { token, tSuckedServerId } = config;
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
  .then(() => console.log(`Logged in successfully via: ${client.user?.tag}`))
  .catch((err) => {
    console.log("Error logging into Discord: " + err);
  });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  client.guilds.fetch(tSuckedServerId).then((guild) => {
    everyoneRole = guild.roles.everyone;
    //remove existing channels in category
    guild.channels.fetch(categories.voice).then((category) => {
      if (category === null || category.type !== ChannelType.GuildCategory) {
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
          const firstMember = channel.members.first()
          if (firstMember !== undefined) {
            voiceMultipleJoin(firstMember?.voice, channel.members);
          }
        }
      });
    });
  });

  //todo fetch users in channels and text channels in other category
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

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

export function getOrCreateRole(interaction: ChatInputCommandInteraction) {
  const member = interaction.member
  const guild = interaction.guild
  if (member === null || guild === null) return
  //if the user has no own role: create it
  const roles = member.roles
  if (!('cache' in roles) || !('add' in roles)) { return }
  if (
    !roles.cache.some(
      (role) => role.name === interaction.user.username
    )
  ) {
    return guild.roles
      .create({
        name: interaction.user.username,
        color: customColors.user as ColorResolvable,
      })
      .then((role) => {
        roles.add(role);
        return role;
      });
  } else {
    return roles.cache.find(
      (role) => role.name === interaction.user.username
    );
  }
}

export function getEmojisFromString(textInput: string) {
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

