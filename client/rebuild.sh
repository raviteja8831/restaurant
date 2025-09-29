#!/bin/bash
set -euo pipefail

echo "🚀 Rebuilding React Native Android app..."

# Go to project root (where script is placed)
PROJECT_ROOT=$(pwd)


# Step 1: Clean caches and native build artifacts
echo "🧹 Cleaning caches and native build artifacts..."
rm -rf $PROJECT_ROOT/node_modules
rm -rf $PROJECT_ROOT/android/app/.cxx
rm -rf $PROJECT_ROOT/android/app/build
rm -rf $PROJECT_ROOT/android/app/build/generated
rm -rf $PROJECT_ROOT/android/.gradle
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
npm cache clean --force


# Step 2: Install dependencies and ensure native modules are linked
echo "📦 Installing dependencies..."
npm install

# Step 2b: Reinstall native modules if missing codegen dirs
if [ ! -d "$PROJECT_ROOT/node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni" ] || \
	 [ ! -d "$PROJECT_ROOT/node_modules/react-native-gesture-handler/android/build/generated/source/codegen/jni" ]; then
	echo "🔄 Detected missing native codegen directories. Reinstalling native modules..."
	npm install --legacy-peer-deps
fi

# Step 3: Ensure gradlew permissions + fix line endings
echo "⚙️ Fixing gradlew permissions..."
cd $PROJECT_ROOT/android
sed -i 's/\r$//' gradlew || true
chmod +x gradlew


# Step 4: Clean Android build
echo "🧹 Cleaning Android build..."
./gradlew clean
rm -rf .gradle app/build build .cxx

# Step 5: Refresh Gradle dependencies
echo "🔄 Refreshing Gradle dependencies..."
./gradlew --refresh-dependencies

# Step 6: Build Debug APK
echo "🏗 Building Debug APK..."
./gradlew assembleDebug

# Step 7: Build Release APK + AAB
echo "🔑 Building Release APK and AAB..."
# ./gradlew assembleRelease
#./gradlew bundleRelease

# Step 8: Show output paths
echo ""
echo "✅ Build complete!"
echo "📂 Debug APK:   android/app/build/outputs/apk/debug/app-debug.apk"
echo "📂 Release APK: android/app/build/outputs/apk/release/app-release.apk"
echo "📂 Release AAB: android/app/build/outputs/bundle/release/app-release.aab"


