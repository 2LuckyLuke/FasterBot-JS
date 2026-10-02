import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// kept outside build/ (which is root-owned and gets wiped on every rebuild) in
// its own writable directory, so it's a sensible place to mount a volume too;
// override with DATA_DIR if the runtime needs it somewhere else
const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "persistent-channels.json");

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
  mkdirSync(dataDir, { recursive: true });
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
