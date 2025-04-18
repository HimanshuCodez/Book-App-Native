import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,

  register: async (username, email, password, address) => {
    set({ isLoading: true });

    try {
      const response = await axios.post("https://book-app-native.onrender.com/api/v1/register", {
        username,
        email,
        password,
        address
      });

      const { user, token } = response.data;

   
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token,
        isLoading: false
      });

    } catch (error) {
      console.error("Registration failed:", error.message);
      set({ isLoading: false });
    }
  },

  // ✅ Load user from AsyncStorage (call this on app start)
  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({ token, user });
      }
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ Logout
  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ user: null, token: null });
  }
}));
