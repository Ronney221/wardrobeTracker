import { ThemedText } from '@/components/ThemedText';
import { getColor, getSystemText } from '@/src/constants/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { CLOTHING_CATEGORIES } from '../../constants/wardrobe';
import { ClothingCategory, Outfit, WardrobeItemData, WardrobeItems } from '../../types/wardrobe';

interface SavedOutfitItemProps {
  outfit: Outfit;
  onDeleteOutfit: () => void;
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
  wardrobeItems: WardrobeItems;
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
  wardrobeItems,
}) => {
  const router = useRouter();
  const scheme = useColorScheme() || 'light';
  const styles = getStyles(scheme);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const loopAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isGlobalEditModeActive) {
      if (loopAnimation.current) loopAnimation.current.stop();
      loopAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(rotationAnim, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotationAnim, { toValue: -1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotationAnim, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotationAnim, { toValue: -1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(rotationAnim, { toValue: 0, duration: 100, easing: Easing.linear, useNativeDriver: true }),
          Animated.delay(1000), 
        ])
      );
      loopAnimation.current.start();
    } else {
      if (loopAnimation.current) loopAnimation.current.stop();
      loopAnimation.current = null;
      Animated.spring(rotationAnim, { toValue: 0, useNativeDriver: true, stiffness: 200, damping: 20 }).start();
    }
    return () => {
      if (loopAnimation.current) loopAnimation.current.stop();
      rotationAnim.stopAnimation(); rotationAnim.setValue(0);
    };
  }, [isGlobalEditModeActive, rotationAnim]);

  const animatedStyle = { transform: [{ rotate: rotationAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-1.5deg', '1.5deg'] }) }] };

  const handlePress = () => {
    if (isGlobalEditModeActive) {
      onDeleteOutfit(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      router.push({ pathname: '/outfit/[id]', params: { id: outfit.id } });
    }
  };

  const handleLongPress = () => { onToggleGlobalEditMode(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };

  const getItemDataById = (categoryId: ClothingCategory, itemId: string): WardrobeItemData | undefined => {
    const categoryItems = wardrobeItems[categoryId];
    return categoryItems?.find(item => item.id === itemId);
  };

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress} style={styles.pressableWrapper}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <ThemedText type="subtitle" style={styles.outfitName}>{outfit.name}</ThemedText>
        
        {isGlobalEditModeActive && (
          <View style={styles.deleteIconContainer}>
            <ThemedText type="defaultSemiBold" style={[styles.deleteIconText, { color: getSystemText('systemDestructive', scheme) }]}>✕</ThemedText>
          </View>
        )}

        <View style={styles.mannequinContainer}>
          {CategoryDisplayOrder.map((category) => {
            const categoryValue = outfit[category]; 
            let itemsToDisplay: WardrobeItemData[] = [];

            // Handle legacy direct string URIs first
            if (typeof categoryValue === 'string') {
              const strCategoryValue: string = categoryValue; // Explicitly typed new variable
              // Ensure the string is a valid URI format we can display
              if (strCategoryValue.startsWith('data:') || strCategoryValue.startsWith('http') || strCategoryValue.startsWith('file:')) {
                itemsToDisplay = [{ id: strCategoryValue, uri: strCategoryValue, name: 'Legacy Item (Direct URI)' }];
              }
            } else if (Array.isArray(categoryValue) && categoryValue.length > 0) { 
              // Handle new format (array of IDs or URIs)
              itemsToDisplay = categoryValue.map(idOrUri => {
                if (typeof idOrUri !== 'string') { // Ensure elements in the array are strings
                  return undefined; 
                }

                // Check if it's a data URI (e.g., pasted image)
                if (idOrUri.startsWith('data:')) {
                  return { id: idOrUri, uri: idOrUri, name: 'Pasted Item' };
                }

                // Try to find the item by ID in the wardrobe
                const itemDataFromId = getItemDataById(category, idOrUri);
                if (itemDataFromId) {
                  return itemDataFromId;
                }

                // Fallback for other string URIs (http, file) not found by ID
                // This handles cases where an array might contain direct URIs
                if (idOrUri.startsWith('http') || idOrUri.startsWith('file:')) {
                  return { id: idOrUri, uri: idOrUri, name: 'Legacy Array URI' };
                }
                
                return undefined; 
              }).filter(item => item !== undefined && item.uri) as WardrobeItemData[];
            }

            // If no items to display for this category, don't render the slot
            if (itemsToDisplay.length === 0) {
              return null;
            }

            return (
              <View key={category} style={styles.categorySlot}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.itemsScrollContainer}
                >
                  {itemsToDisplay.map((itemData) => (
                    <Image 
                      key={itemData.id} 
                      source={{ uri: itemData.uri }} 
                      style={styles.itemImageInScroll} 
                      resizeMode="contain" 
                    />
                  ))}
                </ScrollView>
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
  itemsScrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    height: '100%',
  },
  itemImageInScroll: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: getColor('bgScreen', scheme),
  },
  itemPlaceholderContainer: {
    width: '100%',
    height: '100%',
  },
}); 