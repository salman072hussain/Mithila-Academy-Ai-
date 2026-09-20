name: Build Android APK

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Setup Java
        uses: actions/setup-java@v6
        with:
          distribution: temurin
          java-version: '17'
          cache: gradle

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Build APK
        working-directory: android
        run: |
          chmod +x gradlew
          ./gradlew assembleDebug

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: Mithila-Academy-AI-debug
          path: android/app/build/outputs/apk/debug/*.apk
          if-no-files-found: error
