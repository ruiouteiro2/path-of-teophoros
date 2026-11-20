import { SAVE_KEY, validSave, migrateProgress } from './game.ts';
import type { Save } from './game.ts';
export const BACKUP_KEY = SAVE_KEY + '.backup';
type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };
function decode(raw: string | null): Save | null {
  if (!raw) return null;
  try { const value = JSON.parse(raw); return validSave(value) ? migrateProgress(value) : null; }
  catch { return null; }
}
export async function readSavedJourney(storage: Storage) {
  const raw = await storage.getItem(SAVE_KEY);
  const current = decode(raw);
  if (current) return { save: current, recovered: false, corrupt: false };
  const backup = await storage.getItem(BACKUP_KEY);
  const saved = decode(backup);
  return { save: saved, recovered: !!saved, corrupt: !!(raw || backup) && !saved };
}
/** Caller serializes writes. Never replace a valid backup with corrupt data. */
export async function writeSavedJourney(storage: Storage, save: Save) {
  if (!validSave(save)) throw new Error('Invalid journey cannot be saved');
  const previous = await storage.getItem(SAVE_KEY);
  if (decode(previous)) await storage.setItem(BACKUP_KEY, previous!);
  await storage.setItem(SAVE_KEY, JSON.stringify(save));
}

/** One writer per running game. A rejected write must not poison later saves. */
export function createJourneyWriter(storage: Storage) {
  let pending: Promise<void> = Promise.resolve();
  return (save: Save): Promise<void> => {
    const write = pending.then(() => writeSavedJourney(storage, save));
    pending = write.catch(() => {});
    return write;
  };
}
