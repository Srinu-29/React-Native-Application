/**
 * ═══════════════════════════════════════════════════════════════════
 * SETTINGS SCREEN TEST SUITE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * This file contains all unit tests for the Settings Screen (settings.tsx).
 * We test 3 things:
 *   1. Does the screen RENDER the correct UI elements?
 *   2. Does the BACK BUTTON navigate correctly?
 *   3. Does the component render WITHOUT CRASHING? (smoke test)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../app/settings';
import { Alert, Platform } from 'react-native';

// ══════════════════════════════════════════════════════════════════
// MOCKS
// ══════════════════════════════════════════════════════════════════

// Mock Axios API
jest.mock('../services/api', () => ({
  get: jest.fn().mockResolvedValue({ data: {} }), // default mock so it doesn't crash on load
  post: jest.fn(),
}));
import api from '../services/api';

// Spy on Alert
jest.spyOn(Alert, 'alert');

// Mock Expo Router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement(View, { style }, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// ══════════════════════════════════════════════════════════════════
// TEST SUITE
// ══════════════════════════════════════════════════════════════════

describe('SettingsScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: RENDERING & NAVIGATION
  // ─────────────────────────────────────────────────────────────

  it('renders the Settings title in the top bar', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Settings')).toBeTruthy();
  });

  it('navigates back when the back arrow is pressed', () => {
    const tree = render(<SettingsScreen />);
    const backButton = tree.UNSAFE_root.findAllByProps({ hitSlop: 10 })[0];
    fireEvent.press(backButton);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('shows the static placeholder text', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Settings coming soon!')).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: API DATA SAVING (POST)
  // These tests check what happens when the user clicks the "Save" button.
  // ─────────────────────────────────────────────────────────────

  it('shows success alert when settings are saved', async () => {
    // 1. FAKE THE SERVER RESPONSE (Success!)
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true }
    });

    const { getByText } = render(<SettingsScreen />);

    // 2. SIMULATE BUTTON PRESS
    const saveBtn = getByText('Test Save Settings API');
    fireEvent.press(saveBtn);

    // 3. WAIT AND VERIFY
    // Make sure the "Success" alert popped up!
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Settings saved successfully!'
      );
    });
  });

  it('shows error alert when settings fail to save', async () => {
    // 1. FAKE THE SERVER RESPONSE (Error!)
    // Pretend the database crashed or the internet disconnected
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: {
        data: { message: 'Database error' }
      }
    });

    const { getByText } = render(<SettingsScreen />);

    // 2. SIMULATE BUTTON PRESS
    const saveBtn = getByText('Test Save Settings API');
    fireEvent.press(saveBtn);

    // 3. WAIT AND VERIFY
    // Make sure the "Error" alert popped up with the correct message!
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Database error'
      );
    });
  });
});
