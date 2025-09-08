// MediQueue Color Palette & Theme Configuration
export const colors = {
  // Primary Palette
  lightBlue: '#d8f0f4',     // Fondo claro, elementos sutiles
  lightPink: '#d7c0c6',     // Elementos secundarios, bordes suaves  
  mediumBlue: '#77b8ce',    // Color principal, botones primarios
  darkGray: '#544e52',      // Texto principal, elementos oscuros
  coral: '#ea5d4b',         // Acentos, alertas, elementos de atención
  
  // Extended Palette
  white: '#ffffff',
  black: '#000000',
  
  // Semantic Colors
  success: '#4caf50',
  warning: '#ff9800', 
  error: '#ea5d4b',
  info: '#77b8ce',
  
  // Background Variations
  backgroundLight: '#f8fbfc',
  backgroundMedium: '#d8f0f4',
  backgroundDark: '#77b8ce',
  
  // Text Variations
  textPrimary: '#544e52',
  textSecondary: '#77b8ce', 
  textLight: '#d7c0c6',
  textWhite: '#ffffff',
  
  // Border Colors
  borderLight: '#d8f0f4',
  borderMedium: '#d7c0c6',
  borderStrong: '#77b8ce',
};

export const spacing = {
  xs: '4px',
  sm: '8px', 
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
};

export const typography = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    display: '48px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const shadows = {
  sm: '0 2px 4px rgba(84, 78, 82, 0.1)',
  md: '0 4px 12px rgba(84, 78, 82, 0.15)',
  lg: '0 8px 24px rgba(84, 78, 82, 0.2)',
  xl: '0 16px 32px rgba(84, 78, 82, 0.25)',
  inner: 'inset 0 2px 4px rgba(84, 78, 82, 0.05)',
};

export const borderRadius = {
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '50%',
};

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.mediumBlue} 0%, ${colors.darkGray} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.lightBlue} 0%, ${colors.mediumBlue} 100%)`,
  accent: `linear-gradient(135deg, ${colors.coral} 0%, #d94435 100%)`,
  background: `linear-gradient(135deg, ${colors.lightBlue} 0%, ${colors.mediumBlue} 100%)`,
  card: `linear-gradient(135deg, rgba(216, 240, 244, 0.3) 0%, rgba(255, 255, 255, 0.98) 100%)`,
};

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  widescreen: '1200px',
};

export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  gradients,
  breakpoints,
};
