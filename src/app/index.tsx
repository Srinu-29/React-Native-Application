import React, { useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import api from '../services/api';

// Our dummy database of users
const DUMMY_USERS = [
  { email: 'test@example.com', password: 'password123', name: 'Srinu' },
  { email: 'admin@app.com', password: 'admin', name: 'Admin' }
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  // Stores the user's email/username input
  const [email, setEmail] = useState('');

  // Stores the user's password input
  const [password, setPassword] = useState('');

  // Stores the loading state for the login button
  const [isLoading, setIsLoading] = useState(false);

  // Toggles password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Toggles "remember me" checkbox
  const [rememberMe, setRememberMe] = useState(false);

  // Initialize the router for navigation
  const router = useRouter();

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      if (Platform.OS === 'web') {
        alert("Please enter both username and password.");
      } else {
        Alert.alert("Error", "Please enter both username and password.");
      }
      return;
    }

    setIsLoading(true);

    try {
      // Using our new Axios instance! (URL is handled in api.ts)
      const response = await api.post('/login', {
        email: email,
        password: password,
      });

      const data = response.data; // Axios automatically parses JSON
      console.log(data);

      // Track successful login event in Firebase Analytics
      try {
        const analyticsInstance = getAnalytics();
        await logEvent(analyticsInstance, 'login', {
          method: 'email',
        });
      } catch (analyticsError) {
        console.error("Analytics login log error:", analyticsError);
      }

      // SUCCESS! Navigate to the dashboard
      router.replace({
        pathname: '/dashboard',
        params: { email: email, name: data.name || 'User' }
      });

    } catch (error: any) {
      console.log("Login error:", error);

      // Track failed login attempt in Firebase Analytics
      try {
        const analyticsInstance = getAnalytics();
        await logEvent(analyticsInstance, 'login_failed', {
          method: 'email',
          failure_reason: error.response ? 'invalid_credentials' : 'network_error',
        });
      } catch (analyticsError) {
        console.error("Analytics login_failed log error:", analyticsError);
      }

      // Axios handles non-200 statuses by throwing an error automatically
      if (error.response) {
        // The request was made and the server responded with a status code out of the 2xx range
        const errorMsg = error.response.data?.message || "Incorrect username or password.";
        if (Platform.OS === 'web') alert("Login Failed: " + errorMsg);
        else Alert.alert("Login Failed", errorMsg);
      } else {
        // Network error (server is down, wrong IP, etc)
        if (Platform.OS === 'web') alert("Network error: Make sure your server is running.");
        else Alert.alert("Network Error", "Make sure your server is running and accessible.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, 10), paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.innerContainer}>

              {/* ── Illustration Area ── */}
              <View style={styles.illustrationContainer}>
                <View style={styles.illustrationCircle}>
                  <Ionicons name="lock-closed" size={44} color="#1A2B4A" />
                </View>
                <View style={styles.illustrationDecor1}>
                  <Ionicons name="phone-portrait-outline" size={24} color="#7B8DA5" />
                </View>
                <View style={styles.illustrationDecor2}>
                  <Ionicons name="mail-outline" size={20} color="#7B8DA5" />
                </View>
                <View style={styles.illustrationDecor3}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#10B981" />
                </View>
              </View>

              {/* ── Title ── */}
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Please Sign in to continue.</Text>

              {/* ── Username Input ── */}
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#7B8DA5" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, Platform.OS === 'web' && { outlineWidth: 0 }]}
                  placeholder="Username"
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* ── Password Input ── */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#7B8DA5" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, Platform.OS === 'web' && { outlineWidth: 0 }]}
                  placeholder="Password"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="#7B8DA5"
                    style={styles.eyeIcon}
                  />
                </Pressable>
              </View>

              {/* ── Remember Me ── */}
              <Pressable style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember me next time</Text>
              </Pressable>

              {/* ── Sign In Button ── */}
              <Pressable
                style={({ pressed }) => [
                  styles.signInButton,
                  pressed && { opacity: 0.85 },
                  isLoading && { opacity: 0.7 }
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </Pressable>

              {/* ── Sign Up Link ── */}
              <View style={styles.signUpRow}>
                <Text style={styles.signUpText}>Don't have account? </Text>
                <Pressable>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </Pressable>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },

  // ── Illustration ──
  illustrationContainer: {
    width: 180,
    height: 160,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8EDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 40,
  },
  illustrationDecor1: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  illustrationDecor2: {
    position: 'absolute',
    top: 5,
    left: 20,
  },
  illustrationDecor3: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },

  // ── Title ──
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A2B4A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#7B8DA5',
    marginBottom: 28,
  },

  // ── Input ──
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'web' ? 14 : 12,
    marginBottom: 14,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Subtle shadow
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A2B4A',
  },
  eyeIcon: {
    marginLeft: 8,
  },

  // ── Remember Me ──
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
    marginTop: 4,
    paddingLeft: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C4CFE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#1A2B4A',
    borderColor: '#1A2B4A',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: 13,
    color: '#7B8DA5',
  },

  // ── Sign In Button ──
  signInButton: {
    backgroundColor: '#1A2B4A',
    borderRadius: 28,
    paddingVertical: 16,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    // Shadow
    shadowColor: '#1A2B4A',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Sign Up ──
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 14,
    color: '#7B8DA5',
  },
  signUpLink: {
    fontSize: 14,
    color: '#1A2B4A',
    fontWeight: '700',
  },
});
