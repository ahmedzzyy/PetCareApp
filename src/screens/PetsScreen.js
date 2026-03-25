// Manage pets: add, view, delete.
// Clean card layout with pet-type emoji and a slide-in form.

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

import { getPets, savePet, deletePet, generateId } from "../storage";
import { Colors, Radius, Shadow, PET_TYPES, PET_EMOJI } from "../theme";

export default function PetsScreen() {
  const [pets, setPets] = useState([]);
  const [formVisible, setFormVisible] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [type, setType] = useState("Dog");
  const [age, setAge] = useState("");

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  async function load() {
    setPets(await getPets());
  }

  function resetForm() {
    setName("");
    setAge("");
    setType("Dog");
  }

  async function handleAdd() {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a name for the pet.");
      return;
    }
    const parsedAge = parseFloat(age);
    if (age.trim() === "" || isNaN(parsedAge) || parsedAge < 0) {
      Alert.alert("Invalid Age", "Please enter a valid age (e.g. 2 or 0.5).");
      return;
    }
    await savePet({
      id: generateId(),
      name: name.trim(),
      type,
      age: parsedAge,
    });
    resetForm();
    setFormVisible(false);
    load();
  }

  function handleDelete(pet) {
    Alert.alert(
      "Remove Pet",
      `Remove ${pet.name}? All their logs will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deletePet(pet.id);
            load();
          },
        },
      ],
    );
  }

  function renderPet({ item }) {
    const emoji = PET_EMOJI[item.type] ?? "🐾";
    return (
      <View style={styles.petCard}>
        <View style={styles.petAvatarWrap}>
          <Text style={styles.petAvatar}>{emoji}</Text>
        </View>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petMeta}>
            {item.type} · {item.age} yr{item.age !== 1 ? "s" : ""} old
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Pets</Text>
        <TouchableOpacity
          style={[styles.headerBtn, formVisible && styles.headerBtnCancel]}
          onPress={() => {
            if (formVisible) resetForm();
            setFormVisible((v) => !v);
          }}
        >
          <Text
            style={[
              styles.headerBtnText,
              formVisible && styles.headerBtnTextCancel,
            ]}
          >
            {formVisible ? "✕  Cancel" : "+  Add Pet"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Add Form ── */}
      {formVisible && (
        <View style={styles.form}>
          <Text style={styles.formHeading}>New Pet</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Buddy"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 4 }}
          >
            <View style={styles.chipRow}>
              {PET_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, type === t && styles.chipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={styles.chipEmoji}>{PET_EMOJI[t]}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      type === t && styles.chipLabelActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.label}>Age (years)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3"
            placeholderTextColor={Colors.textMuted}
            value={age}
            onChangeText={setAge}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveBtnText}>Save Pet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Pet List ── */}
      {pets.length === 0 && !formVisible ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyTitle}>No pets yet</Text>
          <Text style={styles.emptyHint}>Tap "+ Add Pet" to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPet}
          contentContainerStyle={styles.list}
        />
      )}
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
  headerBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  headerBtnCancel: { backgroundColor: Colors.border },
  headerBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  headerBtnTextCancel: { color: Colors.textSecondary },

  form: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 18,
    ...Shadow.md,
  },
  formHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: 11,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
  },
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
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
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: "center",
    marginTop: 18,
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  list: { padding: 16, gap: 10 },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 14,
    ...Shadow.sm,
  },
  petAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  petAvatar: { fontSize: 28 },
  petInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
  petMeta: { fontSize: 13, color: Colors.textMuted, marginTop: 3 },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 16, color: Colors.textMuted, fontWeight: "700" },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.textSecondary },
  emptyHint: { fontSize: 13, color: Colors.textMuted, marginTop: 6 },
});
