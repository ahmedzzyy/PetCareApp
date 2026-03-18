// Central place for all AsyncStorage read/write logic.

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  PETS: "pets",
  LOGS: "logs",
};

// ─── Pets ────────────────────────────────────────────────────────────────────

export async function getPets() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PETS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("getPets error:", e);
    return [];
  }
}

export async function savePet(pet) {
  try {
    const pets = await getPets();
    const updated = [...pets, pet];
    await AsyncStorage.setItem(KEYS.PETS, JSON.stringify(updated));
  } catch (e) {
    console.error("savePet error:", e);
  }
}

// ─── Logs ────────────────────────────────────────────────────────────────────

export async function getLogs() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("getLogs error:", e);
    return [];
  }
}

export async function saveLog(log) {
  try {
    const logs = await getLogs();
    const updated = [...logs, log];
    await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error("saveLog error:", e);
  }
}

export async function deleteLog(logId) {
  try {
    const logs = await getLogs();
    const updated = logs.filter((l) => l.id !== logId);
    await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error("deleteLog error:", e);
  }
}
