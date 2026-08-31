import api from '../services/api';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Mock the expo-router so we can check if router.replace was called
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('API Command Center (Axios Interceptors)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Fake the .env file for the tests
    process.env.EXPO_PUBLIC_TEST_TOKEN = 'SUPER_SECRET_TEST_TOKEN_123';

    // Spy on the Alert box so we can check if it popped up
    jest.spyOn(Alert, 'alert');
  });

  // ─────────────────────────────────────────────────────────────
  // 1. TESTING THE REQUEST INTERCEPTOR
  // ─────────────────────────────────────────────────────────────
  it('automatically adds the hardcoded token to the headers', async () => {
    // We override Axios's normal internet-sending behavior (the "adapter")
    // so it doesn't actually try to talk to a real server during our test.
    // Instead, it just instantly replies with "Success!"
    api.defaults.adapter = async (config) => {
      // 🎯 VERIFY: By the time the request gets here, it should have the token!
      expect(config.headers.Authorization).toBe('Bearer SUPER_SECRET_TEST_TOKEN_123');

      return {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    // Trigger a fake GET request to test the interceptor
    await api.get('/test-endpoint');
  });

  // ─────────────────────────────────────────────────────────────
  // 2. TESTING THE RESPONSE INTERCEPTOR (UNAUTHORIZED)
  // ─────────────────────────────────────────────────────────────
  it('shows an alert and redirects to login if the server returns a 401 (Unauthorized)', async () => {
    // We force the fake server to reply with a 401 error
    api.defaults.adapter = async (config) => {
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'Token expired' },
        },
        config,
      });
    };

    // We trigger a request. Since the server replies with 401, our interceptor 
    // should catch it, show an alert, and call router.replace('/')
    try {
      await api.get('/secret-data');
    } catch (error) {
      // We expect the request to throw an error (so we catch it here),
      // BUT we also expect our interceptor to have kicked the user out!
    }

    // 🎯 VERIFY: Did the interceptor show the pop-up?
    expect(Alert.alert).toHaveBeenCalledWith("Unauthorized Access", "Please login again.");

    // 🎯 VERIFY: Did the interceptor call router.replace('/')?
    expect(router.replace).toHaveBeenCalledWith('/');
    expect(router.replace).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────
  // 3. TESTING THE RESPONSE INTERCEPTOR (OTHER ERRORS)
  // ─────────────────────────────────────────────────────────────
  it('does NOT redirect the user for other random errors (like 500 Server Crash)', async () => {
    // We force the fake server to reply with a 500 error
    api.defaults.adapter = async (config) => {
      return Promise.reject({
        response: {
          status: 500,
          data: { message: 'Database crashed' },
        },
        config,
      });
    };

    try {
      await api.get('/secret-data');
    } catch (error) {
      // Catch the error so the test doesn't fail
    }

    // 🎯 VERIFY: The router should NOT have kicked the user out!
    expect(router.replace).not.toHaveBeenCalled();
  });
});

