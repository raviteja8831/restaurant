#!/bin/bash
set -euo pipefail

echo "🚀 Starting full clean build for Android..."

# Step 1: Clean everything
echo "🧹 Removing old build artifacts..."
rm -rf node_modules
rm -rf android
rm -rf /tmp/react-* 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-* 2>/dev/null || true
rm -rf .expo
npm cache clean --force

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Regenerate android folder using Expo prebuild
echo "🔄 Regenerating android folder with expo prebuild..."
npx expo prebuild --platform android --clean

# Step 4: Install Pods (if iOS needed in future)
# cd ios && pod install && cd ..

# Step 5: Navigate to android folder
cd android
chmod +x gradlew

# Step 6: Clean Android build
echo "🧹 Cleaning Android build..."
./gradlew clean
rm -rf .gradle app/build build .cxx 2>/dev/null || true

# Step 7: Refresh Gradle dependencies
echo "🔄 Refreshing Gradle dependencies..."
./gradlew --refresh-dependencies

# Step 8: Build Debug APK
echo "🏗 Building Debug APK..."
./gradlew assembleDebug

# Step 9: Build Release APK
echo "🔑 Building Release APK..."
./gradlew assembleRelease

# Step 10: Build Release AAB (optional - uncomment if needed)
# echo "📦 Building Release AAB..."
# ./gradlew bundleRelease

# Step 11: Show output paths
echo ""
echo "✅ Build complete!"
echo "📂 Debug APK:   android/app/build/outputs/apk/debug/app-debug.apk"
echo "📂 Release APK: android/app/build/outputs/apk/release/app-release.apk"
echo "📂 Release AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "To install debug APK on device: adb install android/app/build/outputs/apk/debug/app-debug.apk"