// Full-featured log screen:
//   - Add log (form slides in from header button)
//   - View logs (newest first, sorted by date string)
//   - Filter by Pet and by Activity Type (pill filter bar)
//   - Edit log (modal overlay, pre-filled)
//   - Delete log (confirm dialog)

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
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  getPets,
  getLogs,
  saveLog,
  editLog,
  deleteLog,
  generateId,
  todayISO,
} from "../storage";
import {
  Colors,
  Radius,
  Shadow,
  ACTIVITY_TYPES,
  ACTIVITY_EMOJI,
  ACTIVITY_COLOR,
  PET_EMOJI,
} from "../theme";

// ─── Log form (used for both Add and Edit) ────────────────────────────────────

function LogForm({ pets, initial, onSave, onCancel, title }) {
  const [petId, setPetId] = useState(initial?.petId ?? pets[0]?.id ?? null);
  const [activityType, setActivityType] = useState(
    initial?.activityType ?? "Feeding",
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function handleSave() {
    if (!petId) {
      Alert.alert("No Pet", "Please add a pet first.");
      return;
    }
    if (!date.trim()) {
      Alert.alert("Missing Date", "Please enter a date.");
      return;
    }
    onSave({ petId, activityType, date: date.trim(), notes: notes.trim() });
  }

  return (
    <View style={formStyles.wrap}>
      <Text style={formStyles.heading}>{title}</Text>

      {/* Pet selector */}
      <Text style={formStyles.label}>Pet</Text>
      {pets.length === 0 ? (
        <Text style={formStyles.warn}>⚠️ No pets found — add a pet first.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={formStyles.chipRow}>
            {pets.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  formStyles.chip,
                  petId === p.id && formStyles.chipActive,
                ]}
                onPress={() => setPetId(p.id)}
              >
                <Text style={formStyles.chipEmoji}>
                  {PET_EMOJI[p.type] ?? "🐾"}
                </Text>
                <Text
                  style={[
                    formStyles.chipLabel,
                    petId === p.id && formStyles.chipLabelActive,
                  ]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Activity type */}
      <Text style={formStyles.label}>Activity</Text>
      <View style={formStyles.chipRow}>
        {ACTIVITY_TYPES.map((a) => (
          <TouchableOpacity
            key={a}
            style={[
              formStyles.chip,
              activityType === a && formStyles.chipActive,
            ]}
            onPress={() => setActivityType(a)}
          >
            <Text style={formStyles.chipEmoji}>{ACTIVITY_EMOJI[a]}</Text>
            <Text
              style={[
                formStyles.chipLabel,
                activityType === a && formStyles.chipLabelActive,
              ]}
            >
              {a}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date */}
      <Text style={formStyles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={formStyles.input}
        value={date}
        onChangeText={setDate}
        placeholder="e.g. 2025-06-01"
        placeholderTextColor={Colors.textMuted}
      />

      {/* Notes */}
      <Text style={formStyles.label}>Notes (optional)</Text>
      <TextInput
        style={[formStyles.input, formStyles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any extra details..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={3}
      />

      {/* Buttons */}
      <View style={formStyles.btnRow}>
        <TouchableOpacity style={formStyles.cancelBtn} onPress={onCancel}>
          <Text style={formStyles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={formStyles.saveBtn} onPress={handleSave}>
          <Text style={formStyles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const formStyles = StyleSheet.create({
  wrap: { padding: 20 },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
  warn: { fontSize: 13, color: Colors.danger, marginBottom: 8 },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", paddingBottom: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  chipLabelActive: { color: "#fff" },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 11,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
  },
  textArea: { height: 76, textAlignVertical: "top" },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    padding: 13,
    borderRadius: Radius.md,
    alignItems: "center",
    backgroundColor: Colors.border,
  },
  cancelBtnText: {
    fontWeight: "700",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    padding: 13,
    borderRadius: Radius.md,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  saveBtnText: { fontWeight: "800", fontSize: 14, color: "#fff" },
});

// ─── Log card ─────────────────────────────────────────────────────────────────

function LogCard({ log, petName, petType, onEdit, onDelete }) {
  const ac = ACTIVITY_COLOR[log.activityType] ?? {
    bg: "#F1F5F9",
    text: "#475569",
  };
  return (
    <View style={cardStyles.card}>
      {/* Left accent stripe */}
      <View style={[cardStyles.stripe, { backgroundColor: ac.text }]} />

      <View style={[cardStyles.iconWrap, { backgroundColor: ac.bg }]}>
        <Text style={cardStyles.icon}>{ACTIVITY_EMOJI[log.activityType]}</Text>
      </View>

      <View style={cardStyles.body}>
        <View style={cardStyles.topRow}>
          <Text style={cardStyles.activity}>{log.activityType}</Text>
          <View style={[cardStyles.tag, { backgroundColor: ac.bg }]}>
            <Text style={[cardStyles.tagText, { color: ac.text }]}>
              {log.activityType}
            </Text>
          </View>
        </View>
        <Text style={cardStyles.petLine}>
          {PET_EMOJI[petType] ?? "🐾"} {petName ?? "Unknown Pet"}
        </Text>
        <Text style={cardStyles.date}>📅 {log.date}</Text>
        {log.notes ? <Text style={cardStyles.notes}>"{log.notes}"</Text> : null}
      </View>

      <View style={cardStyles.actions}>
        <TouchableOpacity style={cardStyles.actionBtn} onPress={onEdit}>
          <Text style={cardStyles.editIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={cardStyles.actionBtn} onPress={onDelete}>
          <Text style={cardStyles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: 10,
    overflow: "hidden",
    ...Shadow.sm,
  },
  stripe: { width: 4 },
  iconWrap: {
    width: 52,
    justifyContent: "center",
    alignItems: "center",
    margin: 12,
    borderRadius: Radius.md,
    height: 52,
    alignSelf: "center",
  },
  icon: { fontSize: 24 },
  body: { flex: 1, paddingVertical: 12, paddingRight: 4 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  activity: { fontSize: 15, fontWeight: "700", color: Colors.textPrimary },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  petLine: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  date: { fontSize: 12, color: Colors.textMuted },
  notes: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: "italic",
    marginTop: 4,
  },
  actions: {
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  actionBtn: { padding: 4 },
  editIcon: { fontSize: 18 },
  deleteIcon: { fontSize: 18 },
});

// ─── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[filterStyles.pill, active && filterStyles.pillActive]}
      onPress={onPress}
    >
      <Text
        style={[filterStyles.pillText, active && filterStyles.pillTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const filterStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  pillTextActive: { color: "#fff" },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function LogsScreen() {
  const [pets, setPets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [addVisible, setAddVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // log being edited
  const [filterPet, setFilterPet] = useState("All");
  const [filterAct, setFilterAct] = useState("All");

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, []),
  );

  async function loadAll() {
    const [p, l] = await Promise.all([getPets(), getLogs()]);
    setPets(p);
    setLogs(l);
  }

  // ── Add ──
  async function handleAdd(fields) {
    await saveLog({ id: generateId(), ...fields });
    setAddVisible(false);
    loadAll();
  }

  // ── Edit ──
  async function handleEdit(fields) {
    await editLog({ ...editTarget, ...fields });
    setEditTarget(null);
    loadAll();
  }

  // ── Delete ──
  function handleDelete(log) {
    Alert.alert("Delete Log", "Remove this log entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteLog(log.id);
          loadAll();
        },
      },
    ]);
  }

  // ── Helpers ──
  function petById(id) {
    return pets.find((p) => p.id === id);
  }

  // ── Filtering + Sorting ──
  const displayed = [...logs]
    .sort((a, b) => (a.date < b.date ? 1 : -1)) // newest first
    .filter((l) => filterPet === "All" || l.petId === filterPet)
    .filter((l) => filterAct === "All" || l.activityType === filterAct);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Care Logs</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setAddVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Add Log</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter bar ── */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Pet filters */}
          <FilterPill
            label="All Pets"
            active={filterPet === "All"}
            onPress={() => setFilterPet("All")}
          />
          {pets.map((p) => (
            <FilterPill
              key={p.id}
              label={`${PET_EMOJI[p.type] ?? "🐾"} ${p.name}`}
              active={filterPet === p.id}
              onPress={() => setFilterPet(filterPet === p.id ? "All" : p.id)}
            />
          ))}
          {/* Divider */}
          <View style={styles.filterDivider} />
          {/* Activity filters */}
          <FilterPill
            label="All Activities"
            active={filterAct === "All"}
            onPress={() => setFilterAct("All")}
          />
          {ACTIVITY_TYPES.map((a) => (
            <FilterPill
              key={a}
              label={`${ACTIVITY_EMOJI[a]} ${a}`}
              active={filterAct === a}
              onPress={() => setFilterAct(filterAct === a ? "All" : a)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Log count ── */}
      {logs.length > 0 && (
        <Text style={styles.countText}>
          {displayed.length} of {logs.length} log{logs.length !== 1 ? "s" : ""}
        </Text>
      )}

      {/* ── Log list ── */}
      {displayed.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>
            {logs.length === 0 ? "No logs yet" : "No matches"}
          </Text>
          <Text style={styles.emptyHint}>
            {logs.length === 0
              ? 'Tap "+ Add Log" to record an activity.'
              : "Try changing your filters."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const pet = petById(item.petId);
            return (
              <LogCard
                log={item}
                petName={pet?.name}
                petType={pet?.type}
                onEdit={() => setEditTarget(item)}
                onDelete={() => handleDelete(item)}
              />
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}

      {/* ── Add Log Modal ── */}
      <Modal
        visible={addVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView keyboardShouldPersistTaps="handled">
              <LogForm
                pets={pets}
                initial={null}
                title="New Log Entry"
                onSave={handleAdd}
                onCancel={() => setAddVisible(false)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Edit Log Modal ── */}
      <Modal
        visible={!!editTarget}
        animationType="slide"
        transparent
        onRequestClose={() => setEditTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView keyboardShouldPersistTaps="handled">
              <LogForm
                pets={pets}
                initial={editTarget}
                title="Edit Log Entry"
                onSave={handleEdit}
                onCancel={() => setEditTarget(null)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  filterBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
    marginVertical: 4,
  },
  countText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 2,
  },

  list: { padding: 16, paddingTop: 10 },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textSecondary },
  emptyHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: "90%",
    ...Shadow.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
});
