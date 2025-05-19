import { ThemedText } from '@/components/ThemedText';
import { getColor, getSystemText } from '@/src/constants/theme';
import { WardrobeItemData } from '@/src/types/wardrobe';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

interface WardrobeItemProps {
  itemData: WardrobeItemData;
  categoryName: string;
  onDeleteItem: () => void;
  isCreatingOutfit: boolean;
  isSelectedForOutfit: boolean;
  onSelectItemForOutfit: () => void;
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
}

export const WardrobeItem: React.FC<WardrobeItemProps> = React.memo(({
  itemData,
  categoryName,
  onDeleteItem,
  isCreatingOutfit,
  isSelectedForOutfit,
  onSelectItemForOutfit,
  isGlobalEditModeActive,
  onToggleGlobalEditMode,
}) => {
  const scheme = useColorScheme() || 'light';
  const styles = getStyles(scheme);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const selectionProgress = useRef(new Animated.Value(0)).current;
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
            useNativeDriver: false,
          }),
          Animated.timing(rotationAnim, {
            toValue: -1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(rotationAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(rotationAnim, {
            toValue: -1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(rotationAnim, {
            toValue: 0,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: false,
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
        useNativeDriver: false,
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

  useEffect(() => {
    Animated.spring(selectionProgress, {
      toValue: isSelectedForOutfit && isCreatingOutfit ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [isSelectedForOutfit, isCreatingOutfit, selectionProgress]);

  const wiggleAnimatedStyle = {
    transform: [
      {
        rotate: rotationAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-1deg', '1deg'],
        }),
      },
    ],
  };

  const selectionAnimatedStyle = {
    borderWidth: selectionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 3],
    }),
    borderColor: selectionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', getColor('pinkBarbie', scheme)],
    }),
  };

  const overlayAnimatedStyle = {
    opacity: selectionProgress,
    transform: [
        {
            scale: selectionProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
            })
        }
    ]
  };

  const handleDeletePress = () => {
    let itemDisplayName = categoryName.toLowerCase();
    if (itemData.name) {
      itemDisplayName = `\"${itemData.name}\"`;
      if (itemData.subcategory) {
        itemDisplayName += ` (${itemData.subcategory}, ${categoryName.toLowerCase()})`;
      } else {
        itemDisplayName += ` (${categoryName.toLowerCase()})`;
      }
    } else if (itemData.subcategory) {
      itemDisplayName = `${categoryName.toLowerCase()} (${itemData.subcategory})`;
    }

    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete this ${itemDisplayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            onDeleteItem();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleItemPress = () => {
    if (isGlobalEditModeActive) {
      handleDeletePress();
    } else if (isCreatingOutfit) {
      onSelectItemForOutfit();
    }
  };

  const handleItemLongPress = () => {
    if (!isCreatingOutfit) {
      onToggleGlobalEditMode();
    }
  };

  return (
    <Pressable 
      onPress={handleItemPress} 
      onLongPress={handleItemLongPress}
      style={styles.pressableContainer}
    >
      <Animated.View style={[styles.container, wiggleAnimatedStyle, selectionAnimatedStyle]}> 
        <Image source={{ uri: itemData.uri }} style={styles.image} resizeMode="cover" />
        {(itemData.name || itemData.subcategory) && (
            <View style={styles.nameOverlayContainer}>
                {itemData.name && 
                    <ThemedText style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                        {itemData.name}
                    </ThemedText>
                }
                {itemData.subcategory &&
                    <ThemedText style={styles.subcategoryText} numberOfLines={1} ellipsizeMode="tail">
                        ({itemData.subcategory})
                    </ThemedText>
                }
            </View>
        )}
        {isCreatingOutfit && (
          <Animated.View style={[styles.selectionOverlay, overlayAnimatedStyle]}>
            {isSelectedForOutfit && <ThemedText style={styles.checkmark} colorToken="textOnPinkBarbie">✓</ThemedText>}
          </Animated.View>
        )}
        {isGlobalEditModeActive && !isCreatingOutfit && (
          <View style={styles.deleteIconContainer}>
            <ThemedText type="defaultSemiBold" style={[styles.deleteIconText, { color: getSystemText('systemDestructive', scheme) }]}>✕</ThemedText>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  pressableContainer: {
    marginRight: 10,
    borderRadius: 10,
  },
  container: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: getColor('bgCard', scheme),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  nameOverlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subcategoryText: {
    color: '#E0E0E0',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor('pinkBarbieTransparent', scheme),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  deleteIconContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: getColor('systemDestructive', scheme),
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: getColor('bgScreen', scheme),
  },
  deleteIconText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default WardrobeItem; 