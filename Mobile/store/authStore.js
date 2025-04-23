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
  
      console.log("Register response:", response.data);
      set({ isLoading: false });
  
      return { success: true };
  
    } catch (error) {
      console.error("Registration failed:", error.message);
      set({ isLoading: false });
  
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  },
  


  login: async (email, password) => {
    set({ isLoading: true });
  
    try {
      const response = await axios.post("https://book-app-native.onrender.com/api/v1/sign-in", {
        email,
        password
      });
  
      const { token, id } = response.data;
  
      const userInfo = await axios.get("https://book-app-native.onrender.com/api/v1/get-user-info", {
        headers: {
          Authorization: `Bearer ${token}`,
          id: id
        }
      });
  
      const user = userInfo.data;
  
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
  
      set({
        user,
        token,
        isLoading: false
      });
  
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.message);
      set({ isLoading: false });
  
      return { success: false, error: error.response?.data?.message || "Login failed" }; 
    }
  },
  
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

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ user: null, token: null });
  }
}));
