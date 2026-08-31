/**
 * ═══════════════════════════════════════════════════════════════════
 * LOGIN SCREEN TEST SUITE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * This file contains all unit tests for the Login Screen (index.tsx).
 * We test 4 things:
 *   1. Does the screen RENDER all the correct UI elements?
 *   2. Can the user INTERACT with inputs and buttons?
 *   3. Does VALIDATION work when fields are empty?
 *   4. Does the LOGIN FLOW work for correct and incorrect credentials?
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/index';
import { Alert } from 'react-native';

// ══════════════════════════════════════════════════════════════════
// MOCKS - Fake versions of external dependencies
// ══════════════════════════════════════════════════════════════════

// Mock the Expo Router
// Why? Our LoginScreen calls router.replace() to navigate to the dashboard.
// In a test, there's no real navigation stack, so we replace it with a
// fake function (jest.fn()) that just records "hey, I was called!".
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock SafeAreaContext
// Why? Our LoginScreen uses useSafeAreaInsets() to get phone notch sizes.
// In a test there's no real phone, so we return fake insets of 0.
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Ionicons (the icon library)
// Why? Ionicons loads native font assets which don't exist in a test.
// We replace every icon with a simple string so it doesn't crash.
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock the API (Axios)
// Why? We don't want tests to actually make network requests.
// We intercept api.post and pretend it returned success or failure.
jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

import api from '../services/api';

// Spy on Alert.alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: RENDERING TESTS
  // ─────────────────────────────────────────────────────────────

  it('renders the Login title', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Login')).toBeTruthy();
  });

  it('renders the subtitle text', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Please Sign in to continue.')).toBeTruthy();
  });

  it('renders the Username input field', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Username')).toBeTruthy();
  });

  it('renders the Password input field', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('renders the Sign In button', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('renders the Sign Up link', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('renders the Remember me checkbox', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Remember me next time')).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: INTERACTION TESTS
  // ─────────────────────────────────────────────────────────────

  it('allows typing in the Username field', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const usernameInput = getByPlaceholderText('Username');
    fireEvent.changeText(usernameInput, 'test@example.com');
    expect(usernameInput.props.value).toBe('test@example.com');
  });

  it('allows typing in the Password field', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'mypassword');
    expect(passwordInput.props.value).toBe('mypassword');
  });

  it('toggles the Remember Me checkbox when tapped', () => {
    const { getByText, queryByText } = render(<LoginScreen />);
    const rememberRow = getByText('Remember me next time');
    expect(queryByText('✓')).toBeNull();
    fireEvent.press(rememberRow);
    expect(getByText('✓')).toBeTruthy();
    fireEvent.press(rememberRow);
    expect(queryByText('✓')).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: VALIDATION TESTS
  // ─────────────────────────────────────────────────────────────

  it('shows an error when both fields are empty', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Sign In'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please enter both username and password.'
    );
  });

  it('shows an error when only username is entered (no password)', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Username'), 'test@example.com');
    fireEvent.press(getByText('Sign In'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please enter both username and password.'
    );
  });

  it('shows an error when only password is entered (no username)', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please enter both username and password.'
    );
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: LOGIN FLOW TESTS (Testing the API)
  // These tests check: "What happens when we actually try to log in?"
  // Since we are testing, we don't want to actually connect to a real server.
  // Instead, we "mock" (fake) the server's response.
  // ─────────────────────────────────────────────────────────────

  it('shows an error for incorrect credentials', async () => {
    // 1. FAKE THE SERVER RESPONSE
    // We tell our fake Axios API: "Hey, when the app tries to login, pretend it failed!"
    // (This simulates what happens when the user types a wrong password)
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: {
        data: { message: 'Incorrect username or password.' }
      }
    });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    // 2. SIMULATE USER ACTIONS
    // Type in wrong credentials and press the Sign In button
    fireEvent.changeText(getByPlaceholderText('Username'), 'wrong@email.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpass');
    fireEvent.press(getByText('Sign In'));

    // 3. WAIT AND VERIFY
    // Because API calls take time (they are "async"), we use waitFor() 
    // to pause the test until the app finishes processing the fake response.
    await waitFor(() => {
      // We check if the app correctly showed the error pop-up!
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Incorrect username or password.'
      );
    });
  });

  it('navigates to dashboard on successful login', async () => {
    // 1. FAKE THE SERVER RESPONSE
    // This time, we tell our fake Axios API: "Pretend the login was successful!"
    // We return some fake user data ({ name: 'Srinu' }) just like a real server would.
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { name: 'Srinu' }
    });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    // 2. SIMULATE USER ACTIONS
    // Enter CORRECT credentials and press Sign In
    fireEvent.changeText(getByPlaceholderText('Username'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    // 3. WAIT AND VERIFY
    // Wait for the app to process the success response
    await waitFor(() => {
      // Verify that the app tried to navigate to the dashboard!
      // mockReplace is our fake navigation function we set up at the top of the file.
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/dashboard',
        params: { email: 'test@example.com', name: 'Srinu' },
      });
    });
  });
});
