import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { homedir } from 'os';

export const RUNTIME_STATUS_PATH =
  process.env.GRASP_RUNTIME_STATUS_PATH ??
  join(homedir(), '.grasp', 'runtime-status.json');

async function ensureDir() {
  await mkdir(dirname(RUNTIME_STATUS_PATH), { recursive: true });
}

export async function writeRuntimeStatus(snapshot) {
  try {
    await ensureDir();
    await writeFile(RUNTIME_STATUS_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  } catch {
    // best effort
  }
}

export async function readRuntimeStatus() {
  try {
    const raw = await readFile(RUNTIME_STATUS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
