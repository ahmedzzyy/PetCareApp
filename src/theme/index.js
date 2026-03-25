// src/theme.js
// Single source of truth for all visual tokens.
// Every screen imports from here — change once, updates everywhere.

export const Colors = {
  // Brand
  primary: "#1B4F8A", // deep navy
  primaryLight: "#2563EB", // vivid blue (interactive)
  accent: "#F59E0B", // amber gold
  accentLight: "#FEF3C7", // amber tint

  // Backgrounds
  bg: "#F0F4FA", // cool off-white
  surface: "#FFFFFF",
  surfaceAlt: "#EBF1FB", // subtle blue-tint card

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  // Semantic
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  success: "#10B981",
  successLight: "#D1FAE5",

  // UI chrome
  border: "#DDE5F0",
  tabBar: "#FFFFFF",
  tabActive: "#1B4F8A",
  tabInactive: "#94A3B8",
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: "#1B4F8A",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: "#1B4F8A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

export const PET_TYPES = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Other"];
export const ACTIVITY_TYPES = ["Feeding", "Medication", "Vet"];

export const PET_EMOJI = {
  Dog: "🐶",
  Cat: "🐱",
  Bird: "🐦",
  Fish: "🐟",
  Rabbit: "🐰",
  Other: "🐾",
};

export const ACTIVITY_EMOJI = {
  Feeding: "🍽️",
  Medication: "💊",
  Vet: "🩺",
};

export const ACTIVITY_COLOR = {
  Feeding: { bg: "#58a7f6", text: "#1D4ED8" },
  Medication: { bg: "#2bc258", text: "#166534" },
  Vet: { bg: "#f19a2f", text: "#9A3412" },
};
