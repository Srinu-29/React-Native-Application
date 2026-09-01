import axios from 'axios';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';

// ══════════════════════════════════════════════════════════════════
// THE API "COMMAND CENTER"
// Think of this file as the "Post Office" for your app. 
// Every time your app wants to send or receive data from the server, 
// it goes through here first!
// ══════════════════════════════════════════════════════════════════

const api = axios.create({
  // baseURL reads from our newly created .env file!
  // We use EXPO_PUBLIC_ so that Expo automatically loads it without extra packages.
  // We also keep the hardcoded URL as a backup just in case the .env fails to load.
  baseURL: process.env.EXPO_PUBLIC_API_URL,

  // timeout is our safety net. If the server doesn't answer in 10 seconds (10,000 milliseconds),
  // Axios stops waiting and throws a "Network Error". This prevents endless loading screens!
  timeout: 10000,

  // headers tell the server what kind of data we are sending. 
  // 'application/json' means we are sending regular text data formatted as JSON objects.
  headers: {
    'Content-Type': 'application/json',
  }
});

// ══════════════════════════════════════════════════════════════════
// 1. REQUEST INTERCEPTOR (The "Outgoing Mail Check")
// This code pauses every request right BEFORE it leaves your phone.
// ══════════════════════════════════════════════════════════════════
api.interceptors.request.use(
  async (config) => {
    // We log the URL to the console so we can see what the app is trying to do
    console.log(`[Network] 📡 Sending ${config.method?.toUpperCase()} request to ${config.url}`);

    // ─────────────────────────────────────────────────────────────
    // HARDCODED TOKEN FOR TESTING
    // ─────────────────────────────────────────────────────────────
    // We are reading this test token directly from our .env file!

    const hardcodedToken = process.env.EXPO_PUBLIC_TEST_TOKEN;

    // We add it to the headers. 'Bearer' is just a standard word servers expect 
    // before the token (like saying "I am the bearer of this VIP pass: <token>")
    config.headers.Authorization = `Bearer ${hardcodedToken}`;
    console.log(`[Network] 🔑 Attached hardcoded token: ${hardcodedToken}`);

    // Finally, release the request so it can go to the server
    return config;
  },
  (error: any) => {
    // If something breaks before the request even sends, we catch it here
    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════════
// 2. RESPONSE INTERCEPTOR (The "Incoming Mail Check")
// This code pauses every response AFTER the server replies, 
// but BEFORE it reaches your screen (like dashboard.tsx or index.tsx).
// ══════════════════════════════════════════════════════════════════
api.interceptors.response.use(
  (response) => {
    // If the server says "Success! Here is your data!" (status 200)
    // We log a checkmark and pass the data forward to your screen.
    console.log(`[Network] ✅ Success from ${response.config.url}`);
    return response;
  },
  (error: any) => {
    // If the server says "Error!" (status 400 or 500) or if the internet is down.
    console.error(`[Network] ❌ Error from ${error.config?.url}:`, error.message);

    // A 401 error means "Unauthorized" (the user's VIP pass/token expired)
    // We can catch it here globally! Instead of writing logout code on every single screen,
    // we just check for a 401 right here and boot the user back to the login screen!
    if (error.response?.status === 401) {
      console.log("⚠️ Unauthorized! Token expired or invalid. (Time to log out!)");
      
      // Show an alert to the user so they know WHY they were kicked out
      if (Platform.OS === 'web') {
        alert("Unauthorized Access. Please login again.");
      } else {
        Alert.alert("Unauthorized Access", "Please login again.");
      }

      // Send the user back to the login screen immediately!
      router.replace('/');
    }

    // We pass the error forward so the screen can show an Alert pop-up to the user
    return Promise.reject(error);
  }
);

// We export this 'api' object so our screens can import it and use it!
export default api;
