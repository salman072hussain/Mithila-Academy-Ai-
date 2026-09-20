name: Build Android APK

on:
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  build-apk:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout project
        uses: actions/checkout@v4

      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: gradle

      - name: Set up Android SDK
        uses: android-actions/setup-android@v3

      - name: Make Gradle executable
        working-directory: android
        run: chmod +x gradlew

      - name: Build real APK
        working-directory: android
        run: ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: Mithila-Academy-AI-debug
          path: android/app/build/outputs/apk/debug/*.apk
          if-no-files-found: error
