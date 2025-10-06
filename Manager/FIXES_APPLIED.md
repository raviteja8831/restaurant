# React Native Android Build Fixes Applied

## Critical Issues Fixed

### 1. ✅ Routing Issue (`app/_layout.tsx`)
**Problem:** App unable to load routes after build
**Solution:** Removed `<Slot />` inside `<Stack>`, changed to `<Stack screenOptions={{ headerShown: false }} />`

### 2. ✅ JS Symbol Crash (`app.json` + `android/gradle.properties`)
**Problem:** "JS Symbols are not convertible to dynamic" crash on navigation
**Solutions:**
- Set `newArchEnabled: false` in `app.json`
- Set `hermesEnabled=false` in `android/gradle.properties`

### 3. ✅ Network Error in Release Build
**Problem:** HTTP API calls failing in release APK
**Solutions:**
- Added `usesCleartextTraffic: true` in `app.json`
- Created `android/app/src/main/res/xml/network_security_config.xml`
- Added `android:networkSecurityConfig="@xml/network_security_config"` to AndroidManifest

### 4. ✅ UI Interactions Not Working
**Problem:** Buttons/touches not responding
**Solution:** Added `import 'react-native-gesture-handler';` at top of `index.js`

### 5. ✅ Navigation Not Working After Login
**Problem:** Alert showing API response, not redirecting
**Solution:** Removed debug `Alert.alert("API user", ...)` from `LoginScreen.js`

### 6. ✅ ViewManagerResolver Errors
**Problem:** Missing native view components
**Solution:** Removed conflicting `@react-navigation` packages from `package.json`

### 7. ✅ Pressable Not Working
**Problem:** Register button not responding
**Solution:** Changed to use `Pressable` from `react-native-gesture-handler`

## Files Modified

1. `app.json` - newArchEnabled, usesCleartextTraffic
2. `app/_layout.tsx` - Fixed Stack component
3. `app/+not-found.tsx` - Fixed imports
4. `app/screens/LoginScreen.js` - Removed debug alert, fixed Pressable
5. `index.js` - Added gesture-handler import
6. `package.json` - Removed conflicting packages
7. `android/gradle.properties` - hermesEnabled=false
8. `android/app/src/main/res/xml/network_security_config.xml` - Created
9. `rebuild.sh` - Updated with all fixes

## Build Instructions

### On Amazon Linux:
```bash
cd client
chmod +x rebuild.sh
./rebuild.sh
```

### APK Locations:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

## Testing Checklist

- [ ] App loads without crash
- [ ] Login screen shows properly
- [ ] Can enter phone and OTP
- [ ] Login API call works
- [ ] Navigation to dashboard/chef-home works
- [ ] Register button works
- [ ] All buttons/touches are responsive
- [ ] No ViewManagerResolver errors

## Notes

- Java 17 or 21 required for building (Java 25 not compatible)
- All native modules properly linked via expo-router
- No manual bundle generation needed (handled by Gradle)