import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkThemeColors, LightThemeColors, ThemeColors } from '../theme/tokens';

const THEME_STORAGE_KEY = '@compra_venta_theme_mode';

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
  setTheme: (isDark: boolean) => Promise<void>;
  loadSavedTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true, // Modo oscuro por defecto (Dark First)
  colors: DarkThemeColors,

  toggleTheme: async () => {
    const nextIsDark = !get().isDark;
    const nextColors = nextIsDark ? DarkThemeColors : LightThemeColors;
    set({ isDark: nextIsDark, colors: nextColors });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('Error saving theme preference to AsyncStorage:', e);
    }
  },

  setTheme: async (isDark: boolean) => {
    const nextColors = isDark ? DarkThemeColors : LightThemeColors;
    set({ isDark, colors: nextColors });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('Error saving theme preference to AsyncStorage:', e);
    }
  },

  loadSavedTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved !== null) {
        const isDark = saved === 'dark';
        set({ isDark, colors: isDark ? DarkThemeColors : LightThemeColors });
      }
    } catch (e) {
      console.warn('Error loading theme preference from AsyncStorage:', e);
    }
  },
}));

