import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config.js";
import { onInteractionCreate } from "./events/interaction-create.js";
import { onMessageCreate } from "./events/message-create.js";
import { onReady } from "./events/ready.js";
import { onVoiceStateUpdate } from "./events/voice-state-update.js";

const client = new Client({
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  onReady(readyClient).catch((err: unknown) => console.error("Startup cleanup failed:", err));
});
client.on(Events.InteractionCreate, (interaction) => {
  onInteractionCreate(interaction).catch((err: unknown) =>
    console.error("interactionCreate failed:", err),
  );
});
client.on(Events.MessageCreate, (message) => {
  onMessageCreate(message).catch((err: unknown) => console.error("messageCreate failed:", err));
});
client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  onVoiceStateUpdate(oldState, newState).catch((err: unknown) =>
    console.error("voiceStateUpdate failed:", err),
  );
});

await client.login(config.token);
console.log(`Logged in successfully via: ${client.user?.tag ?? "unknown"}`);
