#!/bin/bash
# Script to fix Pressable imports for React Native Android

echo "🔧 Fixing Pressable imports for Android compatibility..."

# Find all .js, .jsx, .ts, .tsx files in app directory
find app -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | while read file; do
  # Check if file imports Pressable from react-native
  if grep -q "Pressable.*from.*['\"]react-native['\"]" "$file"; then
    echo "  Fixing: $file"

    # Replace Pressable import
    sed -i.bak 's/Pressable,\?//g; s/,,/,/g; s/,\s*}/}/g; s/{,/{/g; s/,\s*from/ from/g' "$file"

    # Add gesture-handler import if not exists
    if ! grep -q "from.*react-native-gesture-handler" "$file"; then
      # Add import after react-native import
      sed -i.bak '/from.*['\''"]react-native['\''"]/a\
import { Pressable } from "react-native-gesture-handler";' "$file"
    else
      # Add Pressable to existing gesture-handler import
      sed -i.bak 's/from.*['\''"]react-native-gesture-handler['\''"]/Pressable } from "react-native-gesture-handler"/' "$file"
    fi

    # Clean up backup files
    rm -f "$file.bak"
  fi
done

echo "✅ Pressable fixes complete!"
echo "Now rebuild with: ./rebuild.sh"