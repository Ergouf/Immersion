export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
} as const;

export const radii = { sm: 0, md: 0, lg: 0 } as const;

export const typography = {
  title: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  heading: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
};

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F4F3',
    text: '#242120',
    secondary: '#686463',
    border: '#817D7B',
    accent: '#242120',
    accentText: '#FFFFFF',
    danger: '#9A4239',
    overlay: 'rgba(36, 33, 32, 0.28)',
  },
  dark: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F4F3',
    text: '#242120',
    secondary: '#686463',
    border: '#817D7B',
    accent: '#242120',
    accentText: '#FFFFFF',
    danger: '#9A4239',
    overlay: 'rgba(36, 33, 32, 0.28)',
  },
} as const;

export type AppColors = { [Key in keyof typeof colors.light]: string };

export function useAppColors(): AppColors {
  return colors.light;
}
