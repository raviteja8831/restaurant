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

# Step 6: Kill any existing Gradle daemons and clean
echo "🧹 Stopping Gradle daemons and cleaning build..."
./gradlew --stop 2>/dev/null || true
pkill -f gradle 2>/dev/null || true
rm -rf .gradle app/build build .cxx 2>/dev/null || true
rm -rf ~/.gradle/caches/transforms-* ~/.gradle/caches/*/fileHashes 2>/dev/null || true
./gradlew clean --no-daemon

# Step 7: Refresh Gradle dependencies
echo "🔄 Refreshing Gradle dependencies..."
./gradlew --refresh-dependencies --no-daemon

# Step 8: Generate JS bundle for Debug APK
echo "📦 Generating JS bundle for Debug..."
cd ..
mkdir -p android/app/src/main/assets
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

# Step 9: Build Debug APK with bundle
echo "🏗 Building Debug APK..."
cd android
./gradlew assembleDebug --no-daemon

# Step 10: Build Release APK (uses same bundle from step 8)
echo "🔑 Building Release APK..."
./gradlew assembleRelease --no-daemon

# Step 11: Build Release AAB (optional - uncomment if needed)
# echo "📦 Building Release AAB..."
# ./gradlew bundleRelease

# Step 12: Show output paths
echo ""
echo "✅ Build complete!"
echo "📂 Debug APK:   android/app/build/outputs/apk/debug/app-debug.apk"
echo "📂 Release APK: android/app/build/outputs/apk/release/app-release.apk"
echo "📂 Release AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "To install debug APK on device: adb install android/app/build/outputs/apk/debug/app-debug.apk"