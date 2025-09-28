#!/bin/bash
set -euo pipefail

echo "🚀 Rebuilding React Native Android app..."

# Go to project root (where script is placed)
PROJECT_ROOT=$(pwd)

# Step 1: Clean caches
echo "🧹 Cleaning caches..."
rm -rf $PROJECT_ROOT/node_modules
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
npm cache clean --force

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Ensure gradlew permissions + fix line endings
echo "⚙️ Fixing gradlew permissions..."
cd $PROJECT_ROOT/android
sed -i 's/\r$//' gradlew || true
chmod +x gradlew

# Step 4: Clean Android build
echo "🧹 Cleaning Android build..."
./gradlew clean
rm -rf .gradle app/build build

# Step 5: Refresh Gradle dependencies
echo "🔄 Refreshing Gradle dependencies..."
./gradlew --refresh-dependencies

# Step 6: Build Debug APK
echo "🏗 Building Debug APK..."
./gradlew assembleDebug

# Step 7: Build Release APK + AAB
echo "🔑 Building Release APK and AAB..."
./gradlew assembleRelease
./gradlew bundleRelease

# Step 8: Show output paths
echo ""
echo "✅ Build complete!"
echo "📂 Debug APK:   android/app/build/outputs/apk/debug/app-debug.apk"
echo "📂 Release APK: android/app/build/outputs/apk/release/app-release.apk"
echo "📂 Release AAB: android/app/build/outputs/bundle/release/app-release.aab"
