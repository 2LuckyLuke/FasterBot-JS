// single source of truth for /setrole: the runtime reads channel ids from here
// and deploy-commands generates the slash-command choices from the same object
export const gameChannels = {
  mc: { label: "Minecraft", channelId: "1303084653892341760" },
  csgo: { label: "Counter-Strike Global Offensive", channelId: "1013867995392647240" },
  pubg: { label: "Player Unknown Battlegrounds", channelId: "1013867968452632607" },
  ow: { label: "Overwatch", channelId: "693957554275090462" },
  lol: { label: "League of Legends", channelId: "801116649427042304" },
  ttt: { label: "Trouble in Terrorist Town", channelId: "726874198403710997" },
  val: { label: "Valorant", channelId: "703305985552285736" },
  terra: { label: "Terraria", channelId: "947090841808285768" },
  browser: { label: "Browser Games", channelId: "815376957176676414" },
  genshin: { label: "Genshin Impact", channelId: "1018529348749365249" },
  poke: { label: "Pokémon", channelId: "1043928221562966026" },
  mcEvent: { label: "Minecraft Event", channelId: "1303084653892341760" },
  film: { label: "Film", channelId: "1061080939964407869" },
} as const satisfies Record<string, { label: string; channelId: string }>;

export type GameChannel = keyof typeof gameChannels;

export function isGameChannel(value: string): value is GameChannel {
  return value in gameChannels;
}

export const voiceCategoryId = "663511269696995375";
export const memesChannelId = "663522966633709568";
export const searchEngineUserId = "561491781733187584";
