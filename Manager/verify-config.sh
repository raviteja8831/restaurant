#!/bin/bash
# Configuration Verification Script

echo "🔍 Verifying React Native Configuration..."
echo ""

# Check 1: index.js has gesture-handler
echo "✓ Checking index.js..."
if grep -q "react-native-gesture-handler" index.js; then
    echo "  ✅ gesture-handler import found"
else
    echo "  ❌ Missing gesture-handler import"
fi

# Check 2: app.json settings
echo "✓ Checking app.json..."
if grep -q '"newArchEnabled": false' app.json; then
    echo "  ✅ newArchEnabled is false"
else
    echo "  ❌ newArchEnabled should be false"
fi

if grep -q '"usesCleartextTraffic": true' app.json; then
    echo "  ✅ usesCleartextTraffic is true"
else
    echo "  ❌ usesCleartextTraffic should be true"
fi

# Check 3: package.json - no conflicting packages
echo "✓ Checking package.json..."
if grep -q "@react-navigation/native-stack" package.json; then
    echo "  ❌ Found conflicting @react-navigation packages"
else
    echo "  ✅ No conflicting navigation packages"
fi

# Check 4: _layout.tsx
echo "✓ Checking app/_layout.tsx..."
if grep -q "<Slot />" app/_layout.tsx; then
    echo "  ❌ Found <Slot /> inside Stack (should be removed)"
else
    echo "  ✅ Layout file looks correct"
fi

echo ""
echo "📋 Configuration Check Complete!"
echo ""
echo "If all checks pass, run: ./rebuild.sh"