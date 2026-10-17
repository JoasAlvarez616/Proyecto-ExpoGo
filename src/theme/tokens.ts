// ============================================================================
// DESIGN TOKENS — SISTEMA VISUAL PREMIUM DARK / LIGHT
// ============================================================================

export const Palette = {
  // Primarios y fondos oscuros (Slate / Midnight)
  slate950: '#020617',
  slate900: '#0F172A', // Fondo principal Dark
  slate800: '#1E293B', // Superficie principal Dark
  slate700: '#334155', // Bordes / Elementos secundarios Dark
  slate600: '#475569',
  slate500: '#64748B', // Texto atenuado
  slate400: '#94A3B8',
  slate300: '#CBD5E1', // Texto secundario Light
  slate200: '#E2E8F0', // Bordes Light
  slate100: '#F1F5F9', // Superficie Light secundaria
  slate50: '#F8FAFC',  // Fondo principal Light
  white: '#FFFFFF',
  black: '#000000',

  // Acentos de marca
  cyan500: '#06B6D4',
  cyan400: '#22D3EE', // Acento Cyan Primario
  cyan300: '#67E8F9',
  cyan950: '#083344',

  violet600: '#7C3AED',
  violet500: '#8B5CF6',
  violet400: '#A78BFA', // Acento Violeta Secundario
  violet950: '#2E1065',

  // Semánticos
  emerald500: '#10B981', // Éxito / Ganancia / Pagada
  emerald400: '#34D399',
  emerald950: '#022C22',

  rose500: '#F43F5E',   // Error / Anulada / Pérdida
  rose400: '#FB7185',
  rose950: '#4C0519',

  amber500: '#F59E0B',  // Alerta / Stock Bajo / Pendiente
  amber400: '#FBBF24',
  amber950: '#451A03',

  indigo500: '#6366F1',
  indigo400: '#818CF8',
};

export const Gradients = {
  cyanPrimary: [Palette.cyan400, '#0284C7'] as const,
  violetSecondary: [Palette.violet400, '#7C3AED'] as const,
  emeraldSuccess: [Palette.emerald400, Palette.emerald500] as const,
  roseDanger: [Palette.rose400, Palette.rose500] as const,
  amberWarning: [Palette.amber400, Palette.amber500] as const,
  darkSurface: [Palette.slate800, '#141E33'] as const,
  darkGlass: ['rgba(30, 41, 59, 0.85)', 'rgba(15, 23, 42, 0.95)'] as const,
  lightSurface: [Palette.white, Palette.slate50] as const,
  brandMix: [Palette.cyan400, Palette.violet400] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20, // Requerido para tarjetas premium
  xl: 26,
  round: 9999,
};

export const Typography = {
  hero: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
    lineHeight: 38,
  },
  title1: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  title2: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  title3: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  mono: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },
};

export const Shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  glowCyan: {
    shadowColor: Palette.cyan400,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  glowViolet: {
    shadowColor: Palette.violet400,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  glowEmerald: {
    shadowColor: Palette.emerald500,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
};

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceGlass: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentCyan: string;
  accentViolet: string;
  success: string;
  successMuted: string;
  danger: string;
  dangerMuted: string;
  warning: string;
  warningMuted: string;
  info: string;
  divider: string;
  inputBackground: string;
  tabBarBackground: string;
}

export const DarkThemeColors: ThemeColors = {
  isDark: true,
  background: Palette.slate900,
  surface: Palette.slate800,
  surfaceSecondary: '#141E33',
  surfaceGlass: 'rgba(30, 41, 59, 0.85)',
  cardBorder: 'rgba(148, 163, 184, 0.15)',
  textPrimary: Palette.white,
  textSecondary: Palette.slate300,
  textMuted: Palette.slate500,
  accentCyan: Palette.cyan400,
  accentViolet: Palette.violet400,
  success: Palette.emerald400,
  successMuted: Palette.emerald950,
  danger: Palette.rose400,
  dangerMuted: Palette.rose950,
  warning: Palette.amber400,
  warningMuted: Palette.amber950,
  info: Palette.indigo400,
  divider: 'rgba(148, 163, 184, 0.12)',
  inputBackground: 'rgba(15, 23, 42, 0.75)',
  tabBarBackground: 'rgba(15, 23, 42, 0.94)',
};

export const LightThemeColors: ThemeColors = {
  isDark: false,
  background: Palette.slate50,
  surface: Palette.white,
  surfaceSecondary: Palette.slate100,
  surfaceGlass: 'rgba(255, 255, 255, 0.88)',
  cardBorder: Palette.slate200,
  textPrimary: Palette.slate900,
  textSecondary: Palette.slate600,
  textMuted: Palette.slate400,
  accentCyan: Palette.cyan500,
  accentViolet: Palette.violet600,
  success: Palette.emerald500,
  successMuted: '#ECFDF5',
  danger: Palette.rose500,
  dangerMuted: '#FFF1F2',
  warning: Palette.amber500,
  warningMuted: '#FFFBEB',
  info: Palette.indigo500,
  divider: Palette.slate200,
  inputBackground: Palette.slate100,
  tabBarBackground: 'rgba(255, 255, 255, 0.94)',
};
