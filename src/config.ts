function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  token: requireEnv("DISCORD_BOT_TOKEN"),
  guildId: requireEnv("DISCORD_BOT_ACTIVE_SERVER"),
} as const;
