import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, "../data/persistent-channels.json");

// disk-backed record of companion text channels marked "keep after voice empties",
// so that flag survives a bot restart (everything else in manager.ts is in-memory only)
function readStore(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(storePath, "utf-8")) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, string>): void {
  writeFileSync(storePath, JSON.stringify(data, null, 2));
}

export function loadPersistentEntries(): Map<string, string> {
  return new Map(Object.entries(readStore()));
}

export function savePersistentEntry(voiceChannelId: string, textChannelId: string): void {
  const data = readStore();
  data[voiceChannelId] = textChannelId;
  writeStore(data);
}

export function removePersistentEntry(voiceChannelId: string): void {
  const data = readStore();
  if (voiceChannelId in data) {
    delete data[voiceChannelId];
    writeStore(data);
  }
}
