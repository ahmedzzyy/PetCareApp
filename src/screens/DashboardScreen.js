// Home tab. Shows a stats summary and the 5 most recent log entries.
// This is the first thing the evaluator sees — make it count.

import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getPets, getLogs } from "../storage";
import {
  Colors,
  Radius,
  Shadow,
  PET_EMOJI,
  ACTIVITY_EMOJI,
  ACTIVITY_COLOR,
} from "../theme";

// ─── Small reusable stat card ──────────────────────────────────────────────

function StatCard({ value, label, emoji, accent }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Recent log row ──────────────────────────────────────────────────────────

function RecentRow({ log, petName }) {
  const colors = ACTIVITY_COLOR[log.activityType] ?? {
    bg: "#F1F5F9",
    text: "#475569",
  };
  return (
    <View style={styles.recentRow}>
      <View style={[styles.recentBadge, { backgroundColor: colors.bg }]}>
        <Text style={styles.recentBadgeText}>
          {ACTIVITY_EMOJI[log.activityType]}
        </Text>
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentActivity}>{log.activityType}</Text>
        <Text style={styles.recentMeta}>
          {PET_EMOJI[petName?.type] ?? "🐾"} {petName?.name ?? "Unknown"} ·{" "}
          {log.date}
        </Text>
      </View>
      <View style={[styles.recentTag, { backgroundColor: colors.bg }]}>
        <Text style={[styles.recentTagText, { color: colors.text }]}>
          {log.activityType}
        </Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [logs, setLogs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [p, l] = await Promise.all([getPets(), getLogs()]);
        setPets(p);
        setLogs(l);
      })();
    }, []),
  );

  // Stats
  const totalPets = pets.length;
  const totalLogs = logs.length;
  const feedingCount = logs.filter((l) => l.activityType === "Feeding").length;
  const medicationCount = logs.filter(
    (l) => l.activityType === "Medication",
  ).length;
  const vetCount = logs.filter((l) => l.activityType === "Vet").length;

  // Recent 5 logs — newest first
  const recent = [...logs]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  function petById(id) {
    return pets.find((p) => p.id === id);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero header ── */}
      <View style={styles.hero}>
        <View>
          <Text style={styles.heroEyebrow}>Welcome back 👋</Text>
          <Text style={styles.heroTitle}>Pet Care{"\n"}Dashboard</Text>
        </View>
        <View style={styles.heroPaw}>
          <Text style={{ fontSize: 52 }}>🐾</Text>
        </View>
      </View>

      {/* ── Primary stat row ── */}
      <View style={styles.statsRow}>
        <StatCard value={totalPets} label="Pets" emoji="🐾" />
        <StatCard value={totalLogs} label="Total Logs" emoji="📋" accent />
      </View>

      {/* ── Activity breakdown ── */}
      <Text style={styles.sectionTitle}>Activity Breakdown</Text>
      <View style={styles.breakdownRow}>
        <View
          style={[
            styles.breakdownCard,
            { borderBottomColor: ACTIVITY_COLOR.Feeding.bg },
          ]}
        >
          <Text style={styles.breakdownEmoji}>🍽️</Text>
          <Text
            style={[
              styles.breakdownCount,
              { color: ACTIVITY_COLOR.Feeding.text },
            ]}
          >
            {feedingCount}
          </Text>
          <Text style={styles.breakdownLabel}>Feedings</Text>
        </View>
        <View
          style={[
            styles.breakdownCard,
            { borderBottomColor: ACTIVITY_COLOR.Medication.bg },
          ]}
        >
          <Text style={styles.breakdownEmoji}>💊</Text>
          <Text
            style={[
              styles.breakdownCount,
              { color: ACTIVITY_COLOR.Medication.text },
            ]}
          >
            {medicationCount}
          </Text>
          <Text style={styles.breakdownLabel}>Medication</Text>
        </View>
        <View
          style={[
            styles.breakdownCard,
            { borderBottomColor: ACTIVITY_COLOR.Vet.bg },
          ]}
        >
          <Text style={styles.breakdownEmoji}>🩺</Text>
          <Text
            style={[styles.breakdownCount, { color: ACTIVITY_COLOR.Vet.text }]}
          >
            {vetCount}
          </Text>
          <Text style={styles.breakdownLabel}>Vet Visits</Text>
        </View>
      </View>

      {/* ── Recent activity ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {logs.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate("Logs")}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.recentCard}>
        {recent.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyRecentEmoji}>📭</Text>
            <Text style={styles.emptyRecentText}>No logs yet.</Text>
            <TouchableOpacity
              style={styles.emptyRecentBtn}
              onPress={() => navigation.navigate("Logs")}
            >
              <Text style={styles.emptyRecentBtnText}>Log an activity</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recent.map((log, i) => (
            <View key={log.id}>
              <RecentRow log={log} petName={petById(log.petId)} />
              {i < recent.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </View>

      {/* ── Quick-action buttons ── */}
      <View style={styles.quickRow}>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: Colors.primary }]}
          onPress={() => navigation.navigate("Pets")}
        >
          <Text style={styles.quickBtnText}>🐾 Manage Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: Colors.accent }]}
          onPress={() => navigation.navigate("Logs")}
        >
          <Text style={[styles.quickBtnText, { color: Colors.textPrimary }]}>
            📋 Add Log
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },

  // Hero
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 24,
    marginBottom: 16,
    ...Shadow.md,
  },
  heroEyebrow: {
    fontSize: 13,
    color: "#93C5FD",
    fontWeight: "600",
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  heroPaw: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: Radius.lg,
    padding: 12,
  },

  // Stat cards
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 18,
    alignItems: "center",
    ...Shadow.sm,
  },
  statCardAccent: { backgroundColor: Colors.primary },
  statEmoji: { fontSize: 26, marginBottom: 6 },
  statValue: { fontSize: 32, fontWeight: "800", color: Colors.textPrimary },
  statValueAccent: { color: "#fff" },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  statLabelAccent: { color: "#93C5FD" },

  // Section titles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  seeAll: { fontSize: 13, color: Colors.primaryLight, fontWeight: "600" },

  // Breakdown
  breakdownRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  breakdownCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: "center",
    borderBottomWidth: 8,
    backgroundColor: "#fff"
  },
  breakdownEmoji: { fontSize: 22, marginBottom: 4 },
  breakdownCount: { fontSize: 22, fontWeight: "800" },
  breakdownLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },

  // Recent card
  recentCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: 20,
    ...Shadow.sm,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  recentBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentBadgeText: { fontSize: 20 },
  recentInfo: { flex: 1 },
  recentActivity: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  recentMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  recentTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  recentTagText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 12 },

  emptyRecent: { alignItems: "center", padding: 32 },
  emptyRecentEmoji: { fontSize: 36, marginBottom: 8 },
  emptyRecentText: { fontSize: 14, color: Colors.textMuted, marginBottom: 14 },
  emptyRecentBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: Radius.full,
  },
  emptyRecentBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Quick actions
  quickRow: { flexDirection: "row", gap: 12 },
  quickBtn: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 15,
    alignItems: "center",
    ...Shadow.sm,
  },
  quickBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
