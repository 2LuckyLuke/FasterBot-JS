import { Collection } from "discord.js";
import type { Command } from "./types.js";
import { ping } from "./ping.js";
import { poll } from "./poll.js";
import { clear } from "./clear.js";
import { fragfinn } from "./fragfinn.js";
import { setColor } from "./set-color.js";
import { setCustomColor } from "./set-custom-color.js";
import { setRole } from "./set-role.js";
import { persistent } from "./persistent.js";

export const commands = new Collection<string, Command>(
  [ping, poll, clear, fragfinn, setColor, setCustomColor, setRole, persistent].map((command) => [
    command.data.name,
    command,
  ]),
);
