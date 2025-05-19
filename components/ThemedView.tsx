import { ColorToken, getColor } from '@/src/constants/theme'; // Path based on tsconfig alias
import { View, type ViewProps, useColorScheme } from 'react-native';

export type ThemedViewProps = ViewProps & {
  // lightColor and darkColor props are deprecated
  // lightColor?: string;
  // darkColor?: string;
  colorToken?: ColorToken;
};

export function ThemedView({ style, colorToken, ...otherProps }: ThemedViewProps) {
  const scheme = useColorScheme() || 'light';
  const resolvedColorToken = colorToken || 'bgCard'; // Default to 'bgCard' 
  const backgroundColor = getColor(resolvedColorToken, scheme);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
