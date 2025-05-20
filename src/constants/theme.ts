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
  | 'shadowMagentaStrong'
  | 'iconPrimary'
  | 'iconSecondary'
  | 'buttonPrimary'
  | 'buttonSecondary'
  | 'systemError'
  | 'systemInfo'
  | 'bgDisabled'
  | 'bgElevated'
  | 'bgMuted'
  | 'accentGreen'
  | 'textOnAccentGreen';

export type ColorScheme = 'light' | 'dark';

// This is the shape of our actual theme palette objects (lightTheme, darkTheme)
export type ThemePalette = Record<ColorToken, string>;

const lightPaletteValues: ThemePalette = {
  pinkBarbie: '#FF69B4',
  pinkRaspberry: '#E30B5C',
  pinkBlush: '#F8C8DC',
  pinkHighlight: '#FFF0F5',
  textPrimary: '#333333',
  textSecondary: '#555555',
  textOnPinkRaspberry: '#FFFFFF',
  textOnPinkBarbie: '#FFFFFF',
  bgScreen: '#FFFFFF',
  bgCard: '#FDFDFD',
  bgElevated: '#F8F8F8',
  bgMuted: '#F0F0F0',
  border: '#E0E0E0',
  borderSubtle: '#F0F0F0',
  iconPrimary: '#E30B5C',
  iconSecondary: '#FF69B4',
  buttonPrimary: '#FF69B4',
  buttonSecondary: '#E30B5C',
  systemError: '#D32F2F',
  systemWarning: '#FFA000',
  systemSuccess: '#388E3C',
  systemInfo: '#1976D2',
  textDisabled: '#BDBDBD',
  bgDisabled: '#E0E0E0',
  systemDestructive: '#D32F2F',
  pinkBarbieTransparent: 'rgba(255, 105, 180, 0.1)',
  accentMagenta: '#A521E0',
  accentGreen: '#2ECC71',
  textOnAccent: '#FFFFFF',
  textOnAccentGreen: '#FFFFFF',
  textOnSystem: '#1E0311',
  shadowDefault: 'rgba(93,16,73,0.15)',
  shadowMagentaStrong: '#B0126B',
};

const darkPaletteValues: ThemePalette = {
  pinkBarbie: '#FF85C4',
  pinkRaspberry: '#F32B7C',
  pinkBlush: '#5E2E43',
  pinkHighlight: '#4A2135',
  textPrimary: '#F5F5F5',
  textSecondary: '#CCCCCC',
  textOnPinkRaspberry: '#FFFFFF',
  textOnPinkBarbie: '#000000',
  bgScreen: '#121212',
  bgCard: '#1E1E1E',
  bgElevated: '#242424',
  bgMuted: '#2C2C2C',
  border: '#424242',
  borderSubtle: '#2C2C2C',
  iconPrimary: '#F32B7C',
  iconSecondary: '#FF85C4',
  buttonPrimary: '#FF85C4',
  buttonSecondary: '#F32B7C',
  systemError: '#EF5350',
  systemWarning: '#FFB74D',
  systemSuccess: '#66BB6A',
  systemInfo: '#42A5F5',
  textDisabled: '#757575',
  bgDisabled: '#424242',
  systemDestructive: '#EF5350',
  pinkBarbieTransparent: 'rgba(255, 133, 196, 0.1)',
  accentMagenta: '#C758F0',
  accentGreen: '#52D689',
  textOnAccent: '#1E0311',
  textOnAccentGreen: '#000000',
  textOnSystem: '#1E0311',
  shadowDefault: 'rgba(0,0,0,0.5)',
  shadowMagentaStrong: '#8C1BAF',
};

// Export the palettes to be used by the theme provider and getColor function
export const lightTheme: ThemePalette = lightPaletteValues;
export const darkTheme: ThemePalette = darkPaletteValues;

/**
 * Retrieves a color token value based on the current appearance/color scheme.
 * @param token The name of the color token.
 * @param scheme Optional: 'light' or 'dark'. Defaults to system's current color scheme.
 * @returns The hex or rgba color string.
 */
export const getColor = (token: ColorToken, scheme?: ColorScheme): string => {
  const currentScheme = scheme || Appearance.getColorScheme() || 'light';
  return currentScheme === 'light' ? lightTheme[token] : darkTheme[token];
};

// Specific text color getters for clarity, ensuring contrast
// These could be expanded or used directly with getColor if preferred

/** Text color for use on `pinkBarbie` background. */
export const textOnPinkBarbie = (scheme?: ColorScheme): string => {
  const currentScheme = scheme || Appearance.getColorScheme() || 'light';
  return currentScheme === 'light' ? lightTheme.textOnPinkBarbie : darkTheme.textOnPinkBarbie;
}

/** Text color for use on `pinkRaspberry` background. */
export const textOnPinkRaspberry = (scheme?: ColorScheme): string => {
  const currentScheme = scheme || Appearance.getColorScheme() || 'light';
  return currentScheme === 'light' ? lightTheme.textOnPinkRaspberry : darkTheme.textOnPinkRaspberry;
}

/** Text color for use on `accentMagenta` background. */
export const textOnAccentMagenta = (scheme?: ColorScheme): string => {
  const currentScheme = scheme || Appearance.getColorScheme() || 'light';
  return currentScheme === 'light' ? lightTheme.textOnAccent : darkTheme.textOnAccent;
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

// Helper to get system text color based on a system color token (e.g., error, success)
// This is a placeholder. You might want more sophisticated logic, 
// for example, checking contrast ratio or having specific text tokens for each system color.
export const getSystemTextColor = (systemToken: Extract<ColorToken, 'systemError' | 'systemWarning' | 'systemSuccess' | 'systemInfo' | 'systemDestructive'>, scheme: ColorScheme): ColorToken => {
  // Basic logic: for light theme, darker text on system colors; for dark theme, lighter text.
  // This might need adjustment based on the actual system color values.
  // For now, let's assume 'textOnPinkRaspberry' (white) for dark themes and a dark color for light themes.
  // A more robust solution would be to have dedicated tokens like 'textOnSystemErrorLight', 'textOnSystemErrorDark', etc.
  if (scheme === 'dark') {
    // These system colors in dark theme are light enough to warrant dark text if textOnPinkBarbie is dark
    if (systemToken === 'systemWarning' || systemToken === 'systemSuccess' || systemToken === 'systemInfo') {
        return darkTheme.textOnPinkBarbie === '#000000' ? 'textOnPinkBarbie' : 'textOnPinkRaspberry'; 
    }
    return 'textOnPinkRaspberry'; // Default to light text on dark system colors
  }
  // For light theme, system colors are generally dark, so light text is usually fine.
  // However, some light theme system colors (like warning) can be light.
  // Using textPrimary (dark) for light theme system colors as a general rule.
  return 'textPrimary'; 
}; 