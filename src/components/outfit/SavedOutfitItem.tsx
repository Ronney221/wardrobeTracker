import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
        <Text style={styles.outfitName}>{outfit.name}</Text>
        
        {/* Delete indicator for global edit mode */} 
        {isGlobalEditModeActive && (
          <View style={styles.deleteIconContainer}>
            <Text style={styles.deleteIconText}>✕</Text>
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
                    <Text style={styles.itemPlaceholderText}>
                      {category === 'accessories' && Array.isArray(itemUri) && itemUri.length > 0 
                        ? `${itemUri.length} Accessories` 
                        : `No ${getCategoryDisplayName(category)}`}
                    </Text>
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

const styles = StyleSheet.create({
  pressableWrapper: { 
    width: cardWidth, 
    marginHorizontal: cardMarginHorizontal,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  outfitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(200, 50, 50, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  deleteIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  itemPlaceholderText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
}); 