# Final Configuration Check

## ✅ Required Changes (Already Applied)

### 1. index.js
```javascript
import 'react-native-gesture-handler';  // MUST be first line
import 'expo-router/entry';
```

### 2. app/_layout.tsx
```typescript
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>  // Wraps entire app
      {/* ...rest of providers */}
    </GestureHandlerRootView>
  );
}
```

### 3. app.json
```json
{
  "expo": {
    "newArchEnabled": false,
    "android": {
      "usesCleartextTraffic": true,
      ...
    }
  }
}
```

### 4. android/gradle.properties
```
newArchEnabled=false
hermesEnabled=false
```

### 5. package.json
- NO @react-navigation packages (except those needed by expo-router)
- Has react-native-gesture-handler ~2.24.0

## ⚠️ Common Issues

### Issue: "Invalid number" error
**Cause:** AsyncStorage receiving non-string values
**Fix:** Use `String(value)` when storing

### Issue: Buttons not working
**Cause:** GestureHandlerRootView missing or not wrapping root
**Fix:** Must wrap entire app in _layout.tsx

### Issue: Navigation not working
**Cause:** Console errors or crashes preventing navigation
**Fix:** Check logs with `adb logcat ReactNativeJS:V *:S`

### Issue: "JS Symbols" crash
**Cause:** hermesEnabled=true with incompatible libraries
**Fix:** Set hermesEnabled=false

## 🔨 Build Commands

```bash
# On Amazon Linux
cd client

# Verify config (optional)
chmod +x verify-config.sh
./verify-config.sh

# Build APKs
chmod +x rebuild.sh
./rebuild.sh

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Testing Steps

1. Open app - should see login screen
2. Click "Register" - should navigate to register screen
3. Go back, enter phone + OTP - should call API
4. After successful login - should navigate to dashboard/chef-home
5. All buttons should be clickable

## 🐛 Debug Commands

```bash
# Clear logs and monitor
adb logcat -c
adb logcat ReactNativeJS:V ReactNative:E *:S

# Check if gesture-handler is initialized
adb logcat | grep "gesture"

# Uninstall old app
adb uninstall com.anonymous.ft
```

## Key Points

- **GestureHandlerRootView** is THE critical component for Android touches
- Without it, NO touchables will work properly
- Must be at ROOT level wrapping everything
- index.js import alone is NOT enough