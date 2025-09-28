# #!/bin/bash
# set -e

# echo "🚀 Setting up React Native Android build environment with signed APK/AAB on Amazon Linux..."

# # --- Update system ---
# sudo yum update -y

# --- Install dependencies ---
echo "📦 Installing dependencies..."
sudo yum install -y git wget unzip tar bash curl

# Install Node.js (LTS 18)
echo "📦 Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
npm install --global yarn

# Install OpenJDK 17
echo "☕ Installing OpenJDK 17..."
sudo amazon-linux-extras enable corretto17
sudo yum install -y java-17-amazon-corretto-devel

# --- Setup Android SDK ---
ANDROID_SDK_ROOT=$HOME/android-sdk
mkdir -p $ANDROID_SDK_ROOT/cmdline-tools

echo "📥 Downloading Android Command Line Tools..."
cd /tmp
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
unzip cmdline-tools.zip
rm cmdline-tools.zip
mv cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest

# --- Add environment variables ---
echo "⚙️ Configuring environment variables..."
PROFILE=$HOME/.bashrc
{
  echo ""
  echo "# Android SDK"
  echo "export ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"
  echo "export PATH=\$PATH:\$ANDROID_SDK_ROOT/cmdline-tools/latest/bin"
  echo "export PATH=\$PATH:\$ANDROID_SDK_ROOT/platform-tools"
} >> $PROFILE

source $PROFILE

# --- Install required Android packages ---
echo "📦 Installing Android SDK components..."
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# --- Keystore Generation ---
echo "🔑 Generating Keystore..."
cd $HOME
mkdir -p keystore
cd keystore

KEYSTORE_NAME=my-key.keystore
KEY_ALIAS=my-key-alias
STORE_PASS=MyStorePassword123
KEY_PASS=MyKeyPassword123

if [ ! -f "$KEYSTORE_NAME" ]; then
  keytool -genkeypair -v \
    -storetype PKCS12 \
    -keystore $KEYSTORE_NAME \
    -alias $KEY_ALIAS \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass $STORE_PASS \
    -keypass $KEY_PASS \
    -dname "CN=ReactNative,O=MyCompany,L=MyCity,S=MyState,C=US"
  echo "✅ Keystore generated at $HOME/keystore/$KEYSTORE_NAME"
else
  echo "ℹ️ Keystore already exists, skipping generation."
fi

# --- Instructions for Gradle config ---
echo ""
echo "⚙️ Now configure your React Native project for signing:"
echo ""
echo "1. Move the keystore:"
echo "   mv $HOME/keystore/$KEYSTORE_NAME your-react-native-project/android/app/"
echo ""
echo "2. Add these to your android/gradle.properties:"
cat <<EOF
MYAPP_UPLOAD_STORE_FILE=$KEYSTORE_NAME
MYAPP_UPLOAD_KEY_ALIAS=$KEY_ALIAS
MYAPP_UPLOAD_STORE_PASSWORD=$STORE_PASS
MYAPP_UPLOAD_KEY_PASSWORD=$KEY_PASS
EOF
echo ""
echo "3. In android/app/build.gradle, inside android { ... }:"
cat <<'EOF'
signingConfigs {
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        shrinkResources false
        debuggable false
    }
}
EOF
echo ""
echo "✅ Setup complete!"
echo ""
echo "👉 To build signed APK:"
echo "   /home/ec2-user/menutha/restaurant/client/android && ./gradlew assembleRelease"
echo ""
echo "👉 To build signed AAB (Play Store):"
echo "   /home/ec2-user/menutha/restaurant/client/android && ./gradlew bundleRelease"
