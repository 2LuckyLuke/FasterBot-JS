# Discord bot: FasterBot

A TypeScript (discord.js v14) Discord bot for one specific server. Features:

* Personal roles with name-color management (`/setcolor`, `/setcustomcolor`)
* Per-game channel visibility (`/setrole`)
* Companion text channels for voice channels, visible only to connected users
* Up-/downvote reactions on images and links in the memes channel
* Polls, message clearing, and other small interactions

## Development

```bash
yarn install
yarn build      # tsc: src/ -> build/
yarn start      # needs DISCORD_BOT_TOKEN and DISCORD_BOT_ACTIVE_SERVER in the env
```

Each slash command is one module in `src/commands/` exporting its builder and
handler together; `src/events/` wires the Discord events; static ids live in
`src/data/`.

## Registering slash commands

```bash
yarn deploy     # PUTs the command definitions to Discord (same env vars)
```

Run this once after changing any command's name, options, or choices — the bot
process itself never registers commands.

## Deployment

Built and run as a container by the `pi-docker-setup` compose stack; pushes to
`master` are picked up automatically by the Pi's `faster-bot-update` systemd
timer.
