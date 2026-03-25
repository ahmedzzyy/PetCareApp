# Pet Care Activity Tracking System

Part of submission for Advanced Technology Lab (ATL).

## Features Implemented

- [x] Add pet (name, type, age)
- [x] View all pets
- [x] Add care log (pet, activity type, date, notes)
- [x] View all logs
- [x] Delete log
- [x] AsyncStorage persistence — data survives app restarts

- [x] Multiple pets support with pet-log association
- [x] Filter logs by pet
- [x] Filter logs by activity type
- [x] Edit log entry (bottom-sheet modal, pre-filled)

- [x] Dashboard — total pets, total logs, activity breakdown (feeding / medication / vet)
- [x] Recent activity feed (last 5 logs on dashboard)
- [x] Sort logs by date (newest first)

## Setup

```bash
# 1. Create Expo project
pnpm dlx create-expo-app PetCareApp --template blank # or npx create-...
cd PetCareApp

# 2. Install all dependencies
pnpm add @react-native-async-storage/async-storage # or npm install @... \
         @react-navigation/native \
         @react-navigation/bottom-tabs \
         react-native-screens \
         react-native-safe-area-context

# 3. Copy all source files into the project (see structure below)

# 4. Start
pnpm expo start # or npx expo ... or npm run start
# Press 'a' for Android emulator / scan QR for Expo Go
```

## Project Structure

```
PetCareApp/
├── App.js                          ← Navigation root (3-tab layout)
├── package.json
└── src/
    ├── theme.js                    ← All color/spacing/style tokens
    ├── storage/
    │   └── storage.js              ← All AsyncStorage logic
    └── screens/
        ├── DashboardScreen.js      ← Home: stats + recent activity
        ├── PetsScreen.js           ← Add / view / delete pets
        └── LogsScreen.js           ← Add / edit / delete / filter logs
```
