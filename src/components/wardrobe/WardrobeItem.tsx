import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface WardrobeItemProps {
  uri: string;
  categoryName: string;
  onDeleteItem: () => void;
  isCreatingOutfit: boolean;
  isSelectedForOutfit: boolean;
  onSelectItemForOutfit: () => void;
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
}

export const WardrobeItem: React.FC<WardrobeItemProps> = React.memo(({
  uri,
  categoryName,
  onDeleteItem,
  isCreatingOutfit,
  isSelectedForOutfit,
  onSelectItemForOutfit,
  isGlobalEditModeActive,
  onToggleGlobalEditMode,
}) => {
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
      outputRange: ['transparent', '#007AFF'],
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
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete this ${categoryName.toLowerCase()}?`,
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
        <Image source={{ uri: uri }} style={styles.image} resizeMode="cover" />
        {isCreatingOutfit && (
          <Animated.View style={[styles.selectionOverlay, overlayAnimatedStyle]}>
            {isSelectedForOutfit && <Text style={styles.checkmark}>✓</Text>}
          </Animated.View>
        )}
        {isGlobalEditModeActive && !isCreatingOutfit && (
          <View style={styles.deleteIconContainer}>
            <Text style={styles.deleteIconText}>✕</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressableContainer: {
    margin: 4,
    borderRadius: 8,
  },
  container: {
    width: 100,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderRadius: 8,
  },
  checkmark: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  deleteIconContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(200, 50, 50, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  deleteIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WardrobeItem; 