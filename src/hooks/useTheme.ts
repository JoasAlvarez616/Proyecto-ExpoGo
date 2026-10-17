import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const isDark = useThemeStore((state) => state.isDark);
  const colors = useThemeStore((state) => state.colors);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return {
    isDark,
    colors,
    toggleTheme,
    setTheme,
  };
}

