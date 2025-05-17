import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CLOTHING_CATEGORIES } from '../../constants/wardrobe';
import { ClothingCategory } from '../../types/wardrobe';

interface PendingItemViewProps {
  pendingImageUri: string;
  onCategorizeImage: (category: ClothingCategory) => void;
  isLoading?: boolean;
}

const PendingItemView: React.FC<PendingItemViewProps> = ({
  pendingImageUri,
  onCategorizeImage,
  isLoading = false,
}) => {
  return (
    <View style={styles.pendingItemContainer}>
      <Text style={styles.pendingTitle}>Review & Categorize Item:</Text>
      <ExpoImage source={{ uri: pendingImageUri }} style={styles.pendingImage} contentFit="contain" />

      <Text style={styles.categoryPromptText}>Select Category:</Text>
      <View style={styles.categoryButtonsContainer}>
        {CLOTHING_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, isLoading && styles.disabledButton]}
            onPress={() => onCategorizeImage(category)}
            disabled={isLoading}
          >
            <Text style={styles.categoryButtonText}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pendingItemContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '95%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#34495E',
  },
  pendingImage: {
    width: 220,
    height: 220,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  categoryPromptText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495E',
    marginBottom: 10,
    marginTop: 10,
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    opacity: 0.7,
  },
});

export default PendingItemView; 