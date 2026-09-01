import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, ScrollView, useColorScheme, Dimensions, Text, Modal, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

import api from '../services/api';
import { Spacing } from '@/constants/theme';

// ─── Dark Mode Color Themes ─────────────────────────────────────────────────
const LIGHT = {
  bg: '#F3F4F8',
  card: '#FFFFFF',
  sidebar: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  accent: '#3B82F6',
  chipBg: '#F3F4F6',
  avatarBg: '#3B82F6',
  logoutColor: '#EF4444',
};

const DARK = {
  bg: '#111827',
  card: '#1F2937',
  sidebar: '#1A1F2E',
  border: '#374151',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',
  accent: '#60A5FA',
  chipBg: '#374151',
  avatarBg: '#3B82F6',
  logoutColor: '#F87171',
};

// ─── Dummy Data ─────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Finished', value: '18', change: '+8 tasks', changeColor: '#10B981', icon: 'checkmark-circle-outline' as const },
  { label: 'Tracked', value: '31h', change: '-6 hours', changeColor: '#EF4444', icon: 'time-outline' as const },
  { label: 'Efficiency', value: '93%', change: '+12%', changeColor: '#10B981', icon: 'stats-chart-outline' as const },
];

const TASKS = [
  { name: 'Product Review for UI8 Market', status: 'In progress', statusColor: '#EF4444', hours: '4h' },
  { name: 'UX Research for Product', status: 'On hold', statusColor: '#F59E0B', hours: '8h' },
  { name: 'App design and development', status: 'Done', statusColor: '#10B981', hours: '32h' },
];

const SIDEBAR_ITEMS = ['Home', 'Projects', 'Tasks', 'Team', 'Settings'];
const SIDEBAR_ICONS = ['home-outline', 'folder-outline', 'checkmark-done-outline', 'people-outline', 'settings-outline'] as const;

const ACTIVITY = [
  { name: 'Floyd Miles', action: 'Commented on', project: 'Stark Project', time: '10:15 AM', message: "Hi! Next week we'll start a new project. I'll tell you all the details later" },
  { name: 'Guy Hawkins', action: 'Added a file to', project: '7Heros Project', time: '10:15 AM', file: 'Homepage.fig' },
  { name: 'Kristin Watson', action: 'Commented on', project: '7Heros Project', time: '10:15 AM' },
];

// ─── Helper: Get today's date ───────────────────────────────────────────────
const getFormattedDate = () => {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

// ─── Check if screen is wide (desktop/tablet) ──────────────────────────────
const useIsWide = () => {
  const { width } = Dimensions.get('window');
  return width >= 1024; // Use 1024 to ensure enough room for 3 columns without squishing
};

// ─── Main Dashboard Screen ──────────────────────────────────────────────────
export default function DashboardScreen() {
  // Extract the email and name passed from the login screen
  const { email, name } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isWide = useIsWide();

  // Colors based on system theme
  const c = colorScheme === 'dark' ? DARK : LIGHT;

  // Toggle for mobile sidebar drawer
  const [showMenu, setShowMenu] = useState(false);

  // Track dashboard screen view on mount
  useEffect(() => {
    try {
      const analyticsInstance = getAnalytics();
      logEvent(analyticsInstance, 'dashboard_viewed', {
        screen_name: 'Dashboard',
        user_name: String(name || 'User'),
      });
    } catch (analyticsError) {
      console.error('Analytics dashboard_viewed error:', analyticsError);
    }
  }, []);

  const handleLogout = async () => {
    setShowMenu(false);

    // Track user logout event
    try {
      const analyticsInstance = getAnalytics();
      await logEvent(analyticsInstance, 'logout');
    } catch (analyticsError) {
      console.error('Analytics logout error:', analyticsError);
    }

    router.replace('/');
  };

  const handleSettingsRouting = async () => {
    try {
      // Track navigation request to settings
      try {
        const analyticsInstance = getAnalytics();
        await logEvent(analyticsInstance, 'navigate_to_settings');
      } catch (analyticsError) {
        console.error('Analytics navigate_to_settings error:', analyticsError);
      }

      // Using our Axios instance! (Base URL is in api.ts)
      const response = await api.get('/settings-route');
      const data = response.data;

      // Assume the API returns something like { "route": "/settings" }
      if (data.route === "/settings") {
        router.push(data.route);
      } else {
        if (Platform.OS === 'web') alert("This page is not designed yet");
        else Alert.alert("Notice", "This page is not designed yet");
      }
    } catch (error) {
      console.log("Error fetching settings route:", error);
      if (Platform.OS === 'web') alert("This page is not designed yet");
      else Alert.alert("Notice", "This page is not designed yet");
    }
  };

  // ── Sidebar Content (shared between desktop sidebar and mobile drawer) ──
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <View style={styles.logoRow}>
        <View style={styles.logoIcon}>
          <Ionicons name="sparkles" size={16} color="#FFF" />
        </View>
        <Text style={[styles.logoText, { color: c.textPrimary }]}>logip</Text>
      </View>

      {/* Nav Items */}
      <View style={styles.navItems}>
        {SIDEBAR_ITEMS.map((item, i) => (
          <Pressable
            key={item}
            style={[styles.navItem, i === 0 && { backgroundColor: c.chipBg }]}
            onPress={() => {
              if (item === 'Settings') {
                setShowMenu(false); // Close mobile drawer if open
                handleSettingsRouting();
              }
            }}
          >
            <Ionicons name={SIDEBAR_ICONS[i]} size={20} color={i === 0 ? c.textPrimary : c.textSecondary} />
            <Text style={[styles.navText, { color: i === 0 ? c.textPrimary : c.textSecondary }]}>{item}</Text>
            {(item === 'Projects' || item === 'Tasks') && (
              <Ionicons name="add" size={18} color={c.textMuted} style={{ marginLeft: 'auto' }} />
            )}
          </Pressable>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      {/* Upgrade Card */}
      <View style={[styles.upgradeCard, { backgroundColor: c.chipBg }]}>
        <Text style={[styles.upgradeTitle, { color: c.textPrimary }]}>Upgrade to Pro</Text>
        <Text style={[styles.upgradeSubtitle, { color: c.textSecondary }]}>Get 1 month free{'\n'}and unlock</Text>
        <Pressable style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </Pressable>
      </View>

      {/* Bottom Links */}
      <Pressable style={styles.bottomLink}>
        <Ionicons name="information-circle-outline" size={22} color={c.textSecondary} />
        <Text style={[styles.navText, { color: c.textSecondary }]}>Help & Information</Text>
      </Pressable>

      {/* Logout */}
      <Pressable style={styles.bottomLink} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={c.logoutColor} />
        <Text style={[styles.navText, { color: c.logoutColor }]}>Log out</Text>
      </Pressable>
    </>
  );

  // ── Right Sidebar Content (shared between desktop right-rail and mobile bottom) ──
  const RightSidebarContent = () => (
    <>
      {/* Profile */}
      <View style={[styles.profileCard, !isWide && { backgroundColor: c.card, borderRadius: 16, padding: 20 }]}>
        <View style={[styles.avatar, { backgroundColor: c.avatarBg }]}>
          <Text style={styles.avatarText}>{(name as string || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={[styles.profileName, { color: c.textPrimary }]}>{name || 'User'}</Text>
        <Text style={[styles.profileHandle, { color: c.textMuted }]}>@{(email as string || 'user').split('@')[0]}</Text>
        <View style={styles.profileActions}>
          <Pressable style={[styles.profileActionBtn, { backgroundColor: c.chipBg }]}>
            <Ionicons name="call-outline" size={18} color={c.textPrimary} />
          </Pressable>
          <Pressable style={[styles.profileActionBtn, { backgroundColor: c.chipBg }]}>
            <Ionicons name="videocam-outline" size={18} color={c.textPrimary} />
          </Pressable>
          <Pressable style={[styles.profileActionBtn, { backgroundColor: c.chipBg }]}>
            <Ionicons name="ellipsis-vertical" size={18} color={c.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Activity */}
      <Text style={[styles.activityTitle, { color: c.textPrimary }]}>Activity</Text>
      {ACTIVITY.map((item, i) => (
        <View key={i} style={[styles.activityItem, !isWide && { backgroundColor: c.card, borderRadius: 12, padding: 12, marginBottom: 10 }]}>
          <View style={[styles.activityAvatar, { backgroundColor: c.chipBg }]}>
            <Text style={[styles.activityAvatarText, { color: c.textSecondary }]}>{item.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.activityHeader}>
              <Text style={[styles.activityName, { color: c.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.activityTime, { color: c.textMuted }]}>{item.time}</Text>
            </View>
            <Text style={[styles.activityAction, { color: c.textSecondary }]}>
              {item.action} <Text style={{ color: c.accent }}>{item.project}</Text>
            </Text>
            {item.message && (
              <View style={[styles.messageBubble, { backgroundColor: c.chipBg }]}>
                <Text style={[styles.messageText, { color: c.textSecondary }]}>{item.message}</Text>
              </View>
            )}
            {item.file && (
              <View style={[styles.fileBubble, { backgroundColor: c.chipBg }]}>
                <Text style={[styles.fileName, { color: c.textPrimary }]}>{item.file}</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Message Input */}
      <View style={[styles.messageInput, { backgroundColor: c.chipBg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="pencil-outline" size={16} color={c.textMuted} />
          <Text style={{ color: c.textMuted }}>Write a message...</Text>
        </View>
      </View>
    </>
  );

  // ════════ SAFE AREA VIEW EXPLANATION ════════
  // SafeAreaView acts like an invisible protective box for your app.
  // Modern phones have camera notches, dynamic islands, and rounded corners.
  // If we don't use this, our app's menu button might get hidden behind the phone's camera!
  // SafeAreaView automatically adds enough padding to push our app's content into the safe, visible part of the screen.
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.root, { backgroundColor: c.bg }]}>

        {/* ════════ LEFT SIDEBAR (Desktop only) ════════ */}
        {isWide && (
          <View style={[styles.sidebar, { backgroundColor: c.sidebar, borderRightColor: c.border }]}>
            <SidebarContent />
          </View>
        )}

        {/* ════════ CENTER SCROLLABLE CONTENT ════════ */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>

          {/* Mobile Top Bar with Hamburger */}
          {!isWide && (
            <View style={[styles.mobileTopBar, { backgroundColor: c.card, borderBottomColor: c.border }]}>
              <Pressable
                onPress={() => setShowMenu(true)}
                style={styles.hamburgerBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="menu" size={28} color={c.textPrimary} />
              </Pressable>
              <Text style={[styles.logoTextSmall, { color: c.textPrimary }]}>logip</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Pressable onPress={handleSettingsRouting} hitSlop={10}>
                  <Ionicons name="settings-outline" size={24} color={c.textPrimary} />
                </Pressable>
                <View style={[styles.mobileAvatar, { backgroundColor: c.avatarBg }]}>
                  <Text style={styles.mobileAvatarText}>{(name as string || 'U')[0].toUpperCase()}</Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Main Content Area ── */}
          <View style={styles.mainContent}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, { color: c.textPrimary }]}>Hello, {name || 'User'}</Text>
                <Text style={[styles.greetingSub, { color: c.textSecondary }]}>Track your team progress here. You almost reach a goal!</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.dateChip, { backgroundColor: c.card }]}>
                  <Text style={[styles.dateText, { color: c.textSecondary }]}>{getFormattedDate()}</Text>
                  <Ionicons name="calendar-outline" size={18} color={c.textSecondary} />
                </View>
                <Pressable style={[styles.dateChip, { backgroundColor: c.card, paddingHorizontal: 12 }]}>
                  <Ionicons name="settings-outline" size={20} color={c.textSecondary} />
                </Pressable>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              {STATS.map((stat) => (
                <View key={stat.label} style={[styles.statCard, { backgroundColor: c.card }]}>
                  <Ionicons name={stat.icon} size={28} color={c.textPrimary} />
                  <View>
                    <Text style={[styles.statLabel, { color: c.textSecondary }]}>{stat.label}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                      <Text style={[styles.statValue, { color: c.textPrimary }]}>{stat.value}</Text>
                      <Text style={[styles.statChange, { color: stat.changeColor }]}>{stat.change}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Performance */}
            <View style={[styles.sectionCard, { backgroundColor: c.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Performance</Text>
                <View style={[styles.dateChipSmall, { backgroundColor: c.chipBg }]}>
                  <Text style={[styles.dateChipText, { color: c.textSecondary }]}>01-07 May ▾</Text>
                </View>
              </View>
              <View style={styles.chartPlaceholder}>
                {[30, 50, 80, 60, 45, 55, 40].map((h, i) => (
                  <View key={i} style={styles.chartBar}>
                    <View style={[styles.chartBarFill, { height: `${h}%`, backgroundColor: i === 2 ? c.accent : (colorScheme === 'dark' ? '#374151' : '#DBEAFE') }]} />
                  </View>
                ))}
              </View>
            </View>

            {/* Tasks */}
            <View style={[styles.sectionCard, { backgroundColor: c.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>Current Tasks</Text>
                <Text style={[styles.donePercent, { color: c.textSecondary }]}>Done 30%</Text>
              </View>
              {TASKS.map((task) => (
                <View key={task.name} style={[styles.taskRow, { borderBottomColor: c.chipBg }]}>
                  <View style={styles.taskInfo}>
                    <View style={[styles.taskIcon, { backgroundColor: c.chipBg }]}>
                      <Ionicons name="clipboard-outline" size={18} color={c.textPrimary} />
                    </View>
                    <Text style={[styles.taskName, { color: c.textPrimary }]}>{task.name}</Text>
                  </View>
                  <View style={styles.taskRight}>
                    <View style={[styles.statusDot, { backgroundColor: task.statusColor }]} />
                    <Text style={[styles.taskStatus, { color: c.textSecondary }]}>{task.status}</Text>
                    <Text style={[styles.taskHours, { color: c.textSecondary }]}>{task.hours}</Text>
                    <Ionicons name="ellipsis-horizontal" size={18} color={c.textMuted} style={{ paddingLeft: 8 }} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* If Mobile: Render the Right Sidebar Content stacked at the bottom */}
          {!isWide && (
            <View style={[styles.rightSidebarMobile, { backgroundColor: 'transparent' }]}>
              <RightSidebarContent />
            </View>
          )}

        </ScrollView>


        {/* ════════ RIGHT SIDEBAR (Desktop only) ════════ */}
        {isWide && (
          <View style={[styles.rightSidebar, { backgroundColor: c.card, borderLeftColor: c.border }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <RightSidebarContent />
            </ScrollView>
          </View>
        )}

        {/* ════════ MOBILE DRAWER (using Modal for guaranteed overlay) ════════ */}
        <Modal
          visible={showMenu}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowMenu(false)}
        >
          <View style={styles.drawerOverlay}>
            {/* Tap backdrop to close */}
            {/* 
              ════════ PRESSABLE EXPLANATION ════════
              In standard HTML, you use a <button> to make something clickable. 
              In React Native, you use <Pressable>! It is an invisible wrapper that 
              detects when a user taps, presses, or holds down their finger on whatever is inside it. 
              Here, we are using it to detect when the user taps the dark background so we can close the menu.
            */}
            <Pressable style={styles.drawerBackdrop} onPress={() => setShowMenu(false)} />

            {/* Drawer Panel */}
            <View style={[styles.drawerPanel, { backgroundColor: c.sidebar }]}>
              {/* Close Button */}
              {/* This Pressable wraps the 'X' icon, turning it into a clickable button */}
              <Pressable style={styles.drawerCloseBtn} onPress={() => setShowMenu(false)}>
                <Ionicons name="close" size={28} color={c.textPrimary} />
              </Pressable>

              <SidebarContent />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  scrollContent: { flexGrow: 1 },

  // ── Left Sidebar (Desktop) ──
  sidebar: {
    width: 220,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRightWidth: 1,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '800' },
  navItems: { gap: 4 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, gap: 12 },
  navText: { fontSize: 14, fontWeight: '500' },
  upgradeCard: { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  upgradeTitle: { fontWeight: '700', fontSize: 14, marginBottom: 4 },
  upgradeSubtitle: { fontSize: 12, textAlign: 'center', marginBottom: 12 },
  upgradeButton: { backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  upgradeButtonText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  bottomLink: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12 },

  // ── Mobile Top Bar ──
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  hamburgerBtn: {
    padding: 8,
  },
  logoTextSmall: { fontSize: 16, fontWeight: '800' },
  mobileAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  mobileAvatarText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  // ── Mobile Drawer (Modal-based) ──
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerPanel: {
    width: 280,
    height: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  drawerCloseBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },

  // ── Main Content ──
  mainContent: { flex: 1, padding: 24, maxWidth: 1000, alignSelf: 'stretch' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  greeting: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  greetingSub: { fontSize: 14 },
  dateChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  dateText: { fontSize: 13, fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 140, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  statLabel: { fontSize: 13, marginBottom: 2 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statChange: { fontSize: 12, fontWeight: '600' },

  sectionCard: { borderRadius: 16, padding: 24, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  donePercent: { fontSize: 13, fontWeight: '500' },
  dateChipSmall: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  dateChipText: { fontSize: 12, fontWeight: '500' },

  chartPlaceholder: { flexDirection: 'row', height: 160, alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10 },
  chartBar: { width: 40, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  chartBarFill: { width: 20, borderRadius: 6 },

  taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, flexWrap: 'wrap', gap: 8 },
  taskInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 180 },
  taskIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  taskName: { fontSize: 14, fontWeight: '500' },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  taskStatus: { fontSize: 13, minWidth: 80 },
  taskHours: { fontSize: 13, fontWeight: '600' },

  // ── Right Sidebar ──
  rightSidebar: { width: 280, borderLeftWidth: 1, paddingTop: 24, paddingHorizontal: 20 },
  rightSidebarMobile: { paddingHorizontal: 24, paddingBottom: 40 },
  profileCard: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  profileName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  profileHandle: { fontSize: 13, marginBottom: 12 },
  profileActions: { flexDirection: 'row', gap: 12 },
  profileActionBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  activityTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  activityItem: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  activityAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  activityAvatarText: { fontSize: 14, fontWeight: '600' },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityName: { fontSize: 13, fontWeight: '600' },
  activityTime: { fontSize: 11 },
  activityAction: { fontSize: 12, marginTop: 2 },
  messageBubble: { borderRadius: 12, padding: 12, marginTop: 8 },
  messageText: { fontSize: 12, lineHeight: 18 },
  fileBubble: { borderRadius: 10, padding: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  fileName: { fontSize: 12, fontWeight: '600' },
  messageInput: { borderRadius: 12, padding: 14, marginTop: 12 },
});
