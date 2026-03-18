import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getPets, getLogs, saveLog, deleteLog } from "../storage";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const ACTIVITY_TYPES = ["Feeding", "Medication", "Vet"];
const ACTIVITY_EMOJI = { Feeding: "🍽️", Medication: "💊", Vet: "🩺" };

function todayString() {
  const d = new Date();
  // Format: YYYY-MM-DD
  return d.toISOString().split("T")[0];
}

export default function LogsScreen() {
  const [pets, setPets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [formVisible, setFormVisible] = useState(false);

  // Form state
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [activityType, setActivityType] = useState("Feeding");
  const [date, setDate] = useState(todayString());
  const [notes, setNotes] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, []),
  );

  async function loadAll() {
    const [petsData, logsData] = await Promise.all([getPets(), getLogs()]);
    setPets(petsData);
    setLogs(logsData);
    // Auto-select first pet if none selected
    if (petsData.length > 0 && !selectedPetId) {
      setSelectedPetId(petsData[0].id);
    }
  }

  function getPetName(petId) {
    return pets.find((p) => p.id === petId)?.name ?? "Unknown";
  }

  async function handleAddLog() {
    if (!selectedPetId) {
      Alert.alert(
        "No Pet",
        "Please add a pet first before logging an activity.",
      );
      return;
    }
    if (!date.trim()) {
      Alert.alert("Missing Date", "Please enter a date.");
      return;
    }

    const newLog = {
      id: generateId(),
      petId: selectedPetId,
      activityType,
      date: date.trim(),
      notes: notes.trim(),
    };

    await saveLog(newLog);
    setNotes("");
    setDate(todayString());
    setFormVisible(false);
    loadAll();
  }

  async function handleDelete(logId) {
    console.debug("Clicked...");
    Alert.alert("Delete Log", "Are you sure you want to delete this log?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteLog(logId);
          loadAll();
        },
      },
    ]);
  }

  function renderLogCard({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardEmoji}>
            {ACTIVITY_EMOJI[item.activityType] ?? "📋"}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardActivity}>{item.activityType}</Text>
          <Text style={styles.cardPet}>🐾 {getPetName(item.petId)}</Text>
          <Text style={styles.cardDate}>📅 {item.date}</Text>
          {item.notes ? (
            <Text style={styles.cardNotes}>{item.notes}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Care Logs</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setFormVisible((v) => !v)}
        >
          <Text style={styles.addBtnText}>
            {formVisible ? "✕ Cancel" : "+ Add Log"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Log Form */}
      {formVisible && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>New Log Entry</Text>

          {/* Pet selector */}
          <Text style={styles.label}>Pet</Text>
          {pets.length === 0 ? (
            <Text style={styles.noPetWarning}>
              ⚠️ No pets found. Add a pet first.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipRow}
            >
              {pets.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.chip,
                    selectedPetId === p.id && styles.chipActive,
                  ]}
                  onPress={() => setSelectedPetId(p.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedPetId === p.id && styles.chipTextActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Activity type */}
          <Text style={styles.label}>Activity</Text>
          <View style={styles.chipRow}>
            {ACTIVITY_TYPES.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, activityType === a && styles.chipActive]}
                onPress={() => setActivityType(a)}
              >
                <Text
                  style={[
                    styles.chipText,
                    activityType === a && styles.chipTextActive,
                  ]}
                >
                  {ACTIVITY_EMOJI[a]} {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date */}
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2025-06-01"
            placeholderTextColor="#aaa"
          />

          {/* Notes */}
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any extra details..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddLog}>
            <Text style={styles.submitBtnText}>Save Log</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logs list */}
      {logs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>No logs yet.</Text>
          <Text style={styles.emptyHint}>
            Tap "+ Add Log" to record an activity.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...logs].reverse()} // show newest first
          keyExtractor={(item) => item.id}
          renderItem={renderLogCard}
          contentContainerStyle={styles.list}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const BLUE = "#2563EB";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1E293B" },
  addBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  form: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
    marginTop: 10,
  },
  chipRow: { flexDirection: "row", marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: BLUE, borderColor: BLUE },
  chipText: { color: "#475569", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  noPetWarning: { color: "#DC2626", fontSize: 13, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  textArea: { height: 72, textAlignVertical: "top" },
  submitBtn: {
    backgroundColor: BLUE,
    borderRadius: 8,
    padding: 13,
    alignItems: "center",
    marginTop: 16,
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  list: { padding: 16 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardLeft: { marginRight: 12, paddingTop: 2 },
  cardEmoji: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardActivity: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  cardPet: { fontSize: 13, color: "#475569", marginTop: 3 },
  cardDate: { fontSize: 13, color: "#64748B", marginTop: 2 },
  cardNotes: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    fontStyle: "italic",
  },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 20 },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#475569" },
  emptyHint: { fontSize: 13, color: "#94A3B8", marginTop: 4 },
});
