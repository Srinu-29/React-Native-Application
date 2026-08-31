import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function SettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/settings', {
        theme: "dark",
        notificationsEnabled: true,
      });

      if (Platform.OS === 'web') alert("Settings saved successfully!");
      else Alert.alert("Success", "Settings saved successfully!");

    } catch (error: any) {
      console.log("Save settings error:", error);
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
