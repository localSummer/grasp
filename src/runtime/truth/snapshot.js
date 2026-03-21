import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { homedir } from 'os';
import {
  createRuntimeTruth,
  legacyRuntimeStatusToTruth,
  mergeRuntimeTruth,
  truthToLegacyRuntimeStatus,
} from './model.js';

export const RUNTIME_STATUS_PATH =
  process.env.GRASP_RUNTIME_STATUS_PATH ??
  join(homedir(), '.grasp', 'runtime-status.json');

async function ensureDir() {
  await mkdir(dirname(RUNTIME_STATUS_PATH), { recursive: true });
}

export async function writeRuntimeTruth(snapshot) {
  try {
    await ensureDir();
    const truth = mergeRuntimeTruth(createRuntimeTruth(), snapshot);
    await writeFile(RUNTIME_STATUS_PATH, JSON.stringify(truth, null, 2) + '\n', 'utf8');
  } catch {
    // best effort
  }
}

export async function readRuntimeTruth() {
  try {
    const raw = await readFile(RUNTIME_STATUS_PATH, 'utf8');
    const parsed = JSON.parse(raw);

    if (parsed?.browser_process || parsed?.cdp || parsed?.server || parsed?.page || parsed?.profile) {
      return mergeRuntimeTruth(createRuntimeTruth(), parsed);
    }

    return legacyRuntimeStatusToTruth(parsed);
  } catch {
    return createRuntimeTruth();
  }
}

export async function writeRuntimeStatus(snapshot) {
  return writeRuntimeTruth(legacyRuntimeStatusToTruth(snapshot));
}

export async function readRuntimeStatus() {
  const truth = await readRuntimeTruth();
  return truthToLegacyRuntimeStatus(truth);
}
