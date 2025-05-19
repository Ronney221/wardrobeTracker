import { Appearance } from 'react-native';

// Define the names of our color tokens
export type ColorToken =
  | 'pinkBarbie'
  | 'pinkRaspberry'
  | 'pinkBlush'
  | 'pinkHighlight'
  | 'pinkBarbieTransparent'
  | 'accentMagenta'
  | 'textPrimary'
  | 'textSecondary'
  | 'textDisabled'
  | 'textOnPinkBarbie'
  | 'textOnPinkRaspberry'
  | 'textOnAccent'
  | 'bgScreen'
  | 'bgCard'
  | 'border'
  | 'borderSubtle'
  | 'systemDestructive'
  | 'systemSuccess'
  | 'systemWarning'
  | 'textOnSystem' // Generic text for system colors, choose wisely per system color
  | 'shadowDefault'
  | 'shadowMagentaStrong';

export type ColorScheme = 'light' | 'dark';

// Define the palette structure
type Palette = Record<ColorToken, string>;

// Light Mode Palette
const lightPalette: Palette = {
  pinkBarbie: '#E0218A',
  pinkRaspberry: '#ED5C9B',
  pinkBlush: '#F18DBC',
  pinkHighlight: '#FFF4F9',
  pinkBarbieTransparent: '#E0218A80',
  accentMagenta: '#A521E0',
  textPrimary: '#4A0D34',       // Dark magenta for text on light BGs
  textSecondary: '#722F5C',
  textDisabled: '#A16F91',
  textOnPinkBarbie: '#FFFFFF',
  textOnPinkRaspberry: '#1E0311', // Very dark magenta/almost black
  textOnAccent: '#FFFFFF',
  bgScreen: '#FFF4F9',
  bgCard: '#FFFFFF',
  border: '#F18DBC',
  borderSubtle: '#F8DAE9',
  systemDestructive: '#FF3B30',
  systemSuccess: '#34C759',
  systemWarning: '#FF9500',
  textOnSystem: '#1E0311', // Default dark text for system colors; use #FFFFFF if contrast is better
  shadowDefault: 'rgba(93,16,73,0.15)', // Pinkish shadow
  shadowMagentaStrong: '#B0126B',
};

// Dark Mode Palette
const darkPalette: Palette = {
  pinkBarbie: '#EE4B9F',        // Slightly lighter/more vibrant for dark mode
  pinkRaspberry: '#F4A0C9',
  pinkBlush: '#D31F7C',         // BarbiePink shade for dark mode blush
  pinkHighlight: '#4A0D34',     // Used as dark card background
  pinkBarbieTransparent: '#EE4B9F80',
  accentMagenta: '#C758F0',
  textPrimary: '#FCF0F7',       // Light pinkish-white for text on dark BGs
  textSecondary: '#F18DBC',
  textDisabled: '#8B4873',
  textOnPinkBarbie: '#1E0311',
  textOnPinkRaspberry: '#1E0311',
  textOnAccent: '#1E0311',
  bgScreen: '#2C0A1E',          // Very dark desaturated magenta
  bgCard: '#3B0A2A',            // Darker card surface
  border: '#722F5C',
  borderSubtle: '#4A0D34',
  systemDestructive: '#FF453A',
  systemSuccess: '#30D158',
  systemWarning: '#FF9F0A',
  textOnSystem: '#1E0311', // Default dark text; use #FFFFFF if contrast is better
  shadowDefault: 'rgba(0,0,0,0.5)', // Neutral dark shadow
  shadowMagentaStrong: '#8C1BAF',
};

// Theme object
export const AppTheme = {
  light: lightPalette,
  dark: darkPalette,
};

/**
 * Retrieves a color token value based on the current appearance/color scheme.
 * @param token The name of the color token.
 * @param scheme Optional: 'light' or 'dark'. Defaults to system's current color scheme.
 * @returns The hex or rgba color string.
 */
export const getColor = (token: ColorToken, scheme?: ColorScheme): string => {
  const currentScheme = scheme || Appearance.getColorScheme() || 'light';
  return AppTheme[currentScheme][token];
};

// Specific text color getters for clarity, ensuring contrast
// These could be expanded or used directly with getColor if preferred

/** Text color for use on `pinkBarbie` background. */
export const textOnPinkBarbie = (scheme?: ColorScheme): string => {
  const currentScheme = scheme || Appearance.getColorScheme() || 'light';
  return currentScheme === 'light' ? lightPalette.textOnPinkBarbie : darkPalette.textOnPinkBarbie;
}

/** Text color for use on `pinkRaspberry` background. */
export const textOnPinkRaspberry = (scheme?: ColorScheme): string => {
  const currentScheme = scheme || Appearance.getColorScheme() || 'light';
  return currentScheme === 'light' ? lightPalette.textOnPinkRaspberry : darkPalette.textOnPinkRaspberry;
}

/** Text color for use on `accentMagenta` background. */
export const textOnAccentMagenta = (scheme?: ColorScheme): string => {
  const currentScheme = scheme || Appearance.getColorScheme() || 'light';
  return currentScheme === 'light' ? lightPalette.textOnAccent : darkPalette.textOnAccent;
}

/**
 * Helper to get contrasting text for system colors.
 * Note: This is a simplified example. For `systemSuccess` in light mode, white text has low contrast.
 * A more robust solution might involve a mapping or specific text tokens for each system color.
 */
export const getSystemText = (systemToken: 'systemDestructive' | 'systemSuccess' | 'systemWarning', scheme?: ColorScheme): string => {
    const currentScheme = scheme || Appearance.getColorScheme() || 'light';
    const bgColor = getColor(systemToken, currentScheme);

    // Basic contrast check logic (simplified) - in a real scenario, use a proper contrast calculation library.
    // This is a placeholder, use specific textOnSystem tokens or direct color for better accuracy.
    if (systemToken === 'systemDestructive') { // Both FF3B30 and FF453A work well with white.
        return '#FFFFFF';
    }
    // For success and warning, default to dark text, but white might be needed for some dark mode variants if they become very dark.
    // The provided default 'textOnSystem' aims for dark text.
    return getColor('textOnSystem', currentScheme);
}

// You might also want to export common style patterns or typography settings here.
// For example:
// export const typography = { ... }
// export const spacing = { ... } 