import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { createHandoffState, mergeHandoffState } from './state.js';

export const HANDOFF_STATE_PATH =
  process.env.GRASP_HANDOFF_STATE_PATH ??
  join(homedir(), '.grasp', 'handoff-state.json');

async function ensureDir() {
  await mkdir(dirname(HANDOFF_STATE_PATH), { recursive: true });
}

export async function writeHandoffState(snapshot) {
  try {
    await ensureDir();
    const state = mergeHandoffState(createHandoffState(), snapshot);
    await writeFile(HANDOFF_STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf8');
  } catch {
    // best effort
  }
}

export async function readHandoffState() {
  try {
    const raw = await readFile(HANDOFF_STATE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return mergeHandoffState(createHandoffState(), parsed);
  } catch {
    return createHandoffState();
  }
}
