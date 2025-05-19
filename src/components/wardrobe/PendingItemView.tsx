import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getColor } from '@/src/constants/theme';
import { CLOTHING_CATEGORIES } from '@/src/constants/wardrobe';
import { ClothingCategory } from '@/src/types/wardrobe';
import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

interface PendingItemViewProps {
  pendingImageUri: string;
  onCategorizeImage: (category: ClothingCategory, name?: string) => void;
  isLoading?: boolean;
}

const PendingItemView: React.FC<PendingItemViewProps> = ({
  pendingImageUri,
  onCategorizeImage,
  isLoading = false,
}) => {
  const scheme = useColorScheme() || 'light';
  const styles = getStyles(scheme);
  const [itemName, setItemName] = useState('');

  return (
    <ThemedView style={styles.pendingItemContainer} colorToken="bgCard">
      <ThemedText type="subtitle" style={styles.pendingTitle}>Review & Categorize Item:</ThemedText>
      <ExpoImage source={{ uri: pendingImageUri }} style={styles.pendingImage} contentFit="contain" />

      <ThemedText type="defaultSemiBold" style={styles.namePromptText}>
        Item Name (Optional):
      </ThemedText>
      <TextInput
        style={styles.nameInput}
        placeholder="e.g., My Favorite Blue Shirt"
        placeholderTextColor={getColor('textDisabled', scheme)}
        value={itemName}
        onChangeText={setItemName}
        editable={!isLoading}
      />

      <ThemedText type="defaultSemiBold" style={styles.categoryPromptText}>Select Category:</ThemedText>
      <View style={styles.categoryButtonsContainer}>
        {CLOTHING_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, isLoading && styles.disabledButton]}
            onPress={() => onCategorizeImage(category, itemName.trim() || undefined)}
            disabled={isLoading}
          >
            <ThemedText colorToken="textOnPinkBarbie" style={styles.categoryButtonText}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  pendingItemContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    width: '95%',
    elevation: 3,
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  pendingTitle: {
    marginBottom: 15,
  },
  pendingImage: {
    width: 220,
    height: 220,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
    overflow: 'hidden',
  },
  namePromptText: {
    marginTop: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  nameInput: {
    width: '90%',
    height: 40,
    borderColor: getColor('border', scheme),
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: getColor('textPrimary', scheme),
    backgroundColor: getColor('bgScreen', scheme),
  },
  categoryPromptText: {
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryButton: {
    backgroundColor: getColor('pinkBarbie', scheme),
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: getColor('textDisabled', scheme),
    opacity: 0.7,
  },
});

export default PendingItemView; 