import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Platform, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

// Use the modern Modular (v9) syntax which is required for your setup
import { getAnalytics, logEvent, getAppInstanceId } from "@react-native-firebase/analytics";
import { getApp } from "@react-native-firebase/app";

export default function SettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function trackLogin() {
    try {
      const analyticsInstance = getAnalytics();
      await logEvent(analyticsInstance, "login", {
        method: "email",
      });

      console.log("Login event sent to Analytics SDK");
      Alert.alert("Success", "Login event queued in Analytics SDK");
    } catch (error) {
      console.error("Error sending login event:", error);
    }
  }

  const testAnalytics = async () => {
    try {
      // Check if Firebase app is initialized
      const app = getApp();
      const appName = app.name;
      const options = app.options;
      const projectId = options.projectId || "Unknown";
      const appId = options.appId || "Unknown";

      // Get App Instance ID — this is an actual response from Firebase servers.
      // If it returns a valid ID, Firebase Analytics is truly connected.
      const analyticsInstance = getAnalytics();
      const appInstanceId = await getAppInstanceId(analyticsInstance);

      try {
        await logEvent(analyticsInstance, "login", {
          method: "email",
        });

        console.log("Analytics event sent");
      } catch (error) {
        console.error("Analytics error:", error);
      }

      Alert.alert(
        appInstanceId ? "Firebase Connected ✅" : "Firebase Error ❌",
        `App Name: ${appName}\nProject ID: ${projectId}\nApp ID: ${appId}\n\n` +
        `App Instance ID (from Firebase server):\n${appInstanceId || "null — not connected!"}\n\n` +
        `Event 'login' sent!`
      );
    } catch (error: any) {
      console.error("Firebase/Analytics error:", error);
      Alert.alert("Firebase Not Configured", error?.message || "Unknown error occurred");
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/settings', {
        theme: "dark",
        notificationsEnabled: true,
      });

      // Track successful settings update in Firebase Analytics
      try {
        const analyticsInstance = getAnalytics();
        await logEvent(analyticsInstance, 'settings_saved', {
          theme: 'dark',
          notifications_enabled: 'true',
        });
      } catch (analyticsError) {
        console.error("Analytics settings_saved error:", analyticsError);
      }

      if (Platform.OS === 'web') alert("Settings saved successfully!");
      else Alert.alert("Success", "Settings saved successfully!");

    } catch (error: any) {
      console.log("Save settings error:", error);

      // Track failed settings update
      try {
        const analyticsInstance = getAnalytics();
        await logEvent(analyticsInstance, 'settings_save_failed', {
          status_code: error.response?.status ? String(error.response.status) : 'unknown',
        });
      } catch (analyticsError) {
        console.error("Analytics settings_save_failed error:", analyticsError);
      }

      if (error.response) {
        // If it's a 401 Unauthorized error, our global interceptor already 
        // showed a pop-up and kicked the user out. So we just skip this to avoid double pop-ups!
        if (error.response.status === 401) return;

        const errorMsg = error.response.data?.message || "Failed to save settings.";
        if (Platform.OS === 'web') alert("Error: " + errorMsg);
        else Alert.alert("Error", errorMsg);
      } else {
        if (Platform.OS === 'web') alert("Network error. Cannot reach server.");
        else Alert.alert("Network Error", "Cannot reach server. Check your IP.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#1A2B4A" />
        </Pressable>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Ionicons name="settings-outline" size={64} color="#C4CFE0" />

        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
        ) : (
          <>
            <Text style={styles.emptyText}>
              Settings coming soon!
            </Text>

            <Pressable
              style={styles.saveButton}
              onPress={handleSaveSettings}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>Test Save Settings API</Text>
            </Pressable>

            <View style={{ marginTop: 20 }}>
              <Button
                title="Test Analytics"
                onPress={testAnalytics}
              />
            </View>
            <View style={{ marginTop: 10 }}>
              <Button
                title="Track Login Event"
                onPress={trackLogin}
                color="#10B981"
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: '#1A2B4A' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 16, color: '#9CA3AF', fontWeight: '500', marginBottom: 20 },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});
