#!/usr/bin/env sh
# Prints a line to paste into apps/mobile/.env when the API runs in WSL2 and the app runs on the Android emulator.
echo "EXPO_PUBLIC_API_ANDROID_HOST=$(hostname -I | awk '{print $1}')"
