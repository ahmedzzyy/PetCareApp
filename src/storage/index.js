// Central place for all AsyncStorage read/write logic.

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  PETS: "pets",
  LOGS: "logs",
};

// ─── Utility ─────────────────────────────────────────────────────────────────

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ─── Pets ────────────────────────────────────────────────────────────────────

export async function getPets() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PETS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("[storage] getPets:", e);
    return [];
  }
}

export async function savePet(pet) {
  try {
    const pets = await getPets();
    await AsyncStorage.setItem(KEYS.PETS, JSON.stringify([...pets, pet]));
  } catch (e) {
    console.error("[storage] savePet:", e);
  }
}

export async function deletePet(petId) {
  try {
    const pets = await getPets();
    await AsyncStorage.setItem(
      KEYS.PETS,
      JSON.stringify(pets.filter((p) => p.id !== petId)),
    );
    // Also clean up orphan logs
    const logs = await getLogs();
    await AsyncStorage.setItem(
      KEYS.LOGS,
      JSON.stringify(logs.filter((l) => l.petId !== petId)),
    );
  } catch (e) {
    console.error("[storage] deletePet:", e);
  }
}

// ─── Logs ────────────────────────────────────────────────────────────────────

export async function getLogs() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("[storage] getLogs:", e);
    return [];
  }
}

export async function saveLog(log) {
  try {
    const logs = await getLogs();
    await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify([...logs, log]));
  } catch (e) {
    console.error("[storage] saveLog:", e);
  }
}

export async function editLog(updatedLog) {
  try {
    const logs = await getLogs();
    const updated = logs.map((l) => (l.id === updatedLog.id ? updatedLog : l));
    await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error("[storage] editLog:", e);
  }
}

export async function deleteLog(logId) {
  try {
    const logs = await getLogs();
    await AsyncStorage.setItem(
      KEYS.LOGS,
      JSON.stringify(logs.filter((l) => l.id !== logId)),
    );
  } catch (e) {
    console.error("[storage] deleteLog:", e);
  }
}
