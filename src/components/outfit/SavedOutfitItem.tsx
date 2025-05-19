import { ThemedText } from '@/components/ThemedText';
import { getColor, getSystemText } from '@/src/constants/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { CLOTHING_CATEGORIES } from '../../constants/wardrobe';
import { ClothingCategory, Outfit } from '../../types/wardrobe';

interface SavedOutfitItemProps {
  outfit: Outfit;
  onDeleteOutfit: () => void;
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
}

const CategoryDisplayOrder: readonly ClothingCategory[] = CLOTHING_CATEGORIES;

// Helper to get a display name for the category
const getCategoryDisplayName = (category: ClothingCategory): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Make cards thinner for carousel view
export const cardWidth = Dimensions.get('window').width * 0.7; // Changed from 0.8 to 0.7
export const cardMarginHorizontal = 8;

export const SavedOutfitItem: React.FC<SavedOutfitItemProps> = ({
  outfit,
  onDeleteOutfit,
  isGlobalEditModeActive,
  onToggleGlobalEditMode,
}) => {
  const router = useRouter();
  const scheme = useColorScheme() || 'light';
  const styles = getStyles(scheme);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const loopAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isGlobalEditModeActive) {
      if (loopAnimation.current) {
        loopAnimation.current.stop();
      }
      loopAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(rotationAnim, { 
            toValue: 1, 
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotationAnim, {
            toValue: -1, 
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotationAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotationAnim, {
            toValue: -1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(rotationAnim, {
            toValue: 0, 
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.delay(1000), 
        ])
      );
      loopAnimation.current.start();
    } else {
      if (loopAnimation.current) {
        loopAnimation.current.stop();
        loopAnimation.current = null;
      }
      Animated.spring(rotationAnim, { 
        toValue: 0,
        useNativeDriver: true,
        stiffness: 200,
        damping: 20,
      }).start();
    }

    return () => {
      if (loopAnimation.current) {
        loopAnimation.current.stop();
        loopAnimation.current = null;
      }
      rotationAnim.stopAnimation();
      rotationAnim.setValue(0);
    };
  }, [isGlobalEditModeActive, rotationAnim]);

  const animatedStyle = {
    transform: [
      {
        rotate: rotationAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-1.5deg', '1.5deg'],
        }),
      },
    ],
  };

  const handlePress = () => {
    console.log(`[SavedOutfitItem] Handle Press - Edit Mode: ${isGlobalEditModeActive}, Outfit ID: ${outfit.id}`);
    if (isGlobalEditModeActive) {
      console.log("[SavedOutfitItem] Calling onDeleteOutfit");
      onDeleteOutfit();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      console.log("[SavedOutfitItem] Navigating to detail view for outfit ID:", outfit.id);
      router.push({
        pathname: '/outfit/[id]',
        params: { id: outfit.id },
      });
      console.log("[SavedOutfitItem] Navigation initiated with ID only.");
    }
  };

  const handleLongPress = () => {
    console.log(`[SavedOutfitItem] Handle Long Press - Outfit ID: ${outfit.id}`);
    onToggleGlobalEditMode();
  };

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress} style={styles.pressableWrapper}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <ThemedText type="subtitle" style={styles.outfitName}>{outfit.name}</ThemedText>
        
        {/* Delete indicator for global edit mode */} 
        {isGlobalEditModeActive && (
          <View style={styles.deleteIconContainer}>
            <ThemedText type="defaultSemiBold" style={[styles.deleteIconText, { color: getSystemText('systemDestructive', scheme) }]}>✕</ThemedText>
          </View>
        )}

        <View style={styles.mannequinContainer}>
          {CategoryDisplayOrder.map((category) => {
            const itemUri = outfit[category];
            const isItemUriString = typeof itemUri === 'string';
            return (
              <View key={category} style={styles.categorySlot}>
                {isItemUriString && itemUri ? (
                  <Image source={{ uri: itemUri }} style={styles.itemImage} resizeMode="contain" />
                ) : (
                  <View style={styles.itemPlaceholderContainer}>
                    <ThemedText style={styles.itemPlaceholderText} colorToken="textDisabled">
                      {category === 'accessories' && Array.isArray(itemUri) && itemUri.length > 0 
                        ? `${itemUri.length} Accessories` 
                        : `No ${getCategoryDisplayName(category)}`}
                    </ThemedText>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  pressableWrapper: { 
    width: cardWidth, 
    marginHorizontal: cardMarginHorizontal,
  },
  cardContainer: {
    backgroundColor: getColor('bgCard', scheme),
    borderRadius: 12,
    padding: 16,
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, // Adjusted opacity for theme
    shadowRadius: 6,
    elevation: 4, // Keep elevation for Android
    position: 'relative',
  },
  outfitName: {
    // type="subtitle" in ThemedText will handle font size/weight
    textAlign: 'center',
    marginBottom: 16,
    // color will be handled by ThemedText default (textPrimary)
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: getColor('systemDestructive', scheme),
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: getColor('bgCard', scheme), // To make it pop from itself
  },
  deleteIconText: {
    // color is set directly using getSystemText
    // fontWeight: 'bold', // Handled by ThemedText type="defaultSemiBold"
    fontSize: 12,
    lineHeight: 16, // Adjust for centering if needed
  },
  mannequinContainer: {
    alignItems: 'center',
  },
  categorySlot: {
    width: '80%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: getColor('bgScreen', scheme), // Use a slightly different bg than card
    borderRadius: 8,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
  },
  itemImage: {
    width: '100%',
    height: '100%', 
    borderRadius: 6,
  },
  itemPlaceholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: getColor('bgScreen', scheme), // Already set on categorySlot
    borderRadius: 6,
  },
  itemPlaceholderText: {
    // fontSize: 14, // ThemedText default will handle
    // color: handled by colorToken="textDisabled"
    textAlign: 'center',
  },
}); 