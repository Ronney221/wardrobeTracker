import { ColorToken, getColor } from '@/src/constants/theme'; // Path based on tsconfig alias
import { StyleSheet, Text, type TextProps, useColorScheme } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption';
  colorToken?: ColorToken; // Allow explicitly setting a color token
};

export function ThemedText({
  style,
  type = 'default',
  colorToken,
  ...rest
}: ThemedTextProps) {
  const scheme = useColorScheme() || 'light';

  let resolvedColorToken: ColorToken;
  if (colorToken) {
    resolvedColorToken = colorToken;
  } else {
    switch (type) {
      case 'title':
        resolvedColorToken = 'textPrimary'; // Or potentially 'pinkBarbie' for special titles
        break;
      case 'subtitle':
        resolvedColorToken = 'textSecondary';
        break;
      case 'link':
        resolvedColorToken = 'pinkBarbie'; 
        break;
      case 'caption':
        resolvedColorToken = 'textDisabled'; // Example for a more subtle text
        break;
      case 'defaultSemiBold':
      case 'default':
      default:
        resolvedColorToken = 'textPrimary';
        break;
    }
  }
  
  const color = getColor(resolvedColorToken, scheme);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: getColor('pinkBarbie', scheme) }] : undefined, // Ensure link color is from theme
        type === 'caption' ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: { // General link styling, color will be overridden by theme
    lineHeight: 30,
    fontSize: 16,
    fontWeight: '600', // Make links a bit bolder
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  }
});
