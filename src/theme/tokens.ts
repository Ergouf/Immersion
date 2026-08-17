import { useColorScheme } from 'react-native';

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
} as const;

export const radii = { sm: 10, md: 16, lg: 24 } as const;

export const typography = {
  title: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  heading: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
};

export const colors = {
  light: {
    background: '#F6F5F1',
    surface: '#FFFDF8',
    surfaceMuted: '#ECEAE2',
    text: '#252622',
    secondary: '#696B62',
    border: '#D8D7CF',
    accent: '#356859',
    accentText: '#FFFFFF',
    danger: '#9A4239',
    overlay: 'rgba(16, 18, 14, 0.34)',
  },
  dark: {
    background: '#1B1D1A',
    surface: '#272A26',
    surfaceMuted: '#343831',
    text: '#F1F0E9',
    secondary: '#B9BBAF',
    border: '#484C43',
    accent: '#8CC9AA',
    accentText: '#10281D',
    danger: '#F09A8E',
    overlay: 'rgba(0, 0, 0, 0.56)',
  },
} as const;

export type AppColors = { [Key in keyof typeof colors.light]: string };

export function useAppColors(): AppColors {
  return colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
