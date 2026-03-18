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
import "react-native-get-random-values"; // needed for crypto.randomUUID on some Expo versions
import { getPets, savePet } from "../storage";

// Simple ID generator — avoids need for uuid package
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const PET_TYPES = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Other"];

export default function PetsScreen() {
  const [pets, setPets] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Dog");
  const [age, setAge] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  // Reload pets every time screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, []),
  );

  async function loadPets() {
    const data = await getPets();
    setPets(data);
  }

  async function handleAddPet() {
    if (!name.trim()) {
      Alert.alert("Missing Info", "Please enter a pet name.");
      return;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) < 0) {
      Alert.alert("Invalid Age", "Please enter a valid age.");
      return;
    }

    const newPet = {
      id: generateId(),
      name: name.trim(),
      type,
      age: Number(age),
    };

    await savePet(newPet);
    setName("");
    setAge("");
    setType("Dog");
    setFormVisible(false);
    loadPets();
  }

  function renderPetCard({ item }) {
    const emoji =
      {
        Dog: "🐶",
        Cat: "🐱",
        Bird: "🐦",
        Fish: "🐟",
        Rabbit: "🐰",
        Other: "🐾",
      }[item.type] ?? "🐾";

    return (
      <View style={styles.card}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardSub}>
            {item.type} · {item.age} yr{item.age !== 1 ? "s" : ""} old
          </Text>
        </View>
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
        <Text style={styles.headerTitle}>My Pets</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setFormVisible((v) => !v)}
        >
          <Text style={styles.addBtnText}>
            {formVisible ? "✕ Cancel" : "+ Add Pet"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Pet Form */}
      {formVisible && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>New Pet</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Buddy"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeRow}
          >
            {PET_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                onPress={() => setType(t)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    type === t && styles.typeChipTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Age (years)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddPet}>
            <Text style={styles.submitBtnText}>Save Pet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pet List */}
      {pets.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐾</Text>
          <Text style={styles.emptyText}>No pets added yet.</Text>
          <Text style={styles.emptyHint}>Tap "+ Add Pet" to get started.</Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPetCard}
          contentContainerStyle={styles.list}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const BLUE = "#2563EB";
const BLUE_LIGHT = "#EFF6FF";

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
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  typeRow: { flexDirection: "row", marginBottom: 4 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  typeChipActive: { backgroundColor: BLUE, borderColor: BLUE },
  typeChipText: { color: "#475569", fontSize: 13, fontWeight: "500" },
  typeChipTextActive: { color: "#fff" },
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
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardEmoji: { fontSize: 32, marginRight: 14 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  cardSub: { fontSize: 13, color: "#64748B", marginTop: 2 },

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
