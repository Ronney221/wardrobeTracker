import { ThemedText } from '@/components/ThemedText';
import { getColor } from '@/src/constants/theme';
import { ClothingCategory, UserSubcategories } from '@/src/types/wardrobe';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PendingItemViewProps {
  pendingImageUri: string;
  onCategorizeImage: (category: ClothingCategory, name?: string, subcategory?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  availableCategories: readonly ClothingCategory[];
  colorScheme: 'light' | 'dark';
  userSubcategories: UserSubcategories | Partial<UserSubcategories>; // Allow partial for initial load
  onAddSubcategory: (mainCategory: ClothingCategory, newSubcategoryName: string) => void;
}

const PendingItemView: React.FC<PendingItemViewProps> = ({
  pendingImageUri,
  onCategorizeImage,
  onCancel,
  isLoading = false,
  availableCategories,
  colorScheme,
  userSubcategories,
  onAddSubcategory,
}) => {
  const styles = getStyles(colorScheme);
  const [itemName, setItemName] = useState('');
  const [enteredSubcategory, setEnteredSubcategory] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<ClothingCategory | null>(null);
  const [filteredSubcategories, setFilteredSubcategories] = useState<string[]>([]);

  useEffect(() => {
    if (selectedMainCategory && userSubcategories?.[selectedMainCategory]) {
      const subs = userSubcategories[selectedMainCategory] || [];
      if (enteredSubcategory.trim() === '') {
        setFilteredSubcategories(subs);
      } else {
        setFilteredSubcategories(
          subs.filter((sub: string) => sub.toLowerCase().includes(enteredSubcategory.toLowerCase()))
        );
      }
    } else {
      setFilteredSubcategories([]);
    }
  }, [selectedMainCategory, enteredSubcategory, userSubcategories]);

  const handleCategorize = () => {
    if (!selectedMainCategory) {
      // Optionally, show an alert if no main category is selected
      console.warn("Please select a main category.");
      return;
    }
    const finalSubcategory = enteredSubcategory.trim();
    if (finalSubcategory && selectedMainCategory) {
      const currentSubsForMainCat = userSubcategories?.[selectedMainCategory] || [];
      if (!currentSubsForMainCat.some((sub: string) => sub.toLowerCase() === finalSubcategory.toLowerCase())) {
        onAddSubcategory(selectedMainCategory, finalSubcategory);
      }
    }
    onCategorizeImage(selectedMainCategory, itemName.trim() || undefined, finalSubcategory || undefined);
  };

  const selectSubcategory = (subcategory: string) => {
    setEnteredSubcategory(subcategory);
    // Optionally, clear filter or perform other actions
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.pendingItemContainer}>
      <ThemedText type="subtitle" style={styles.pendingTitle} colorToken="textPrimary">Review & Categorize Item:</ThemedText>
      <ExpoImage source={{ uri: pendingImageUri }} style={styles.pendingImage} contentFit="contain" />

      <ThemedText type="defaultSemiBold" style={styles.promptText} colorToken="textSecondary">
        Item Name (Optional):
      </ThemedText>
      <TextInput
        style={styles.inputField}
        placeholder="e.g., My Favorite Blue Shirt"
        placeholderTextColor={getColor('textDisabled', colorScheme)}
        value={itemName}
        onChangeText={setItemName}
        editable={!isLoading}
      />

      <ThemedText type="defaultSemiBold" style={styles.categoryPromptText} colorToken="textSecondary">Select Main Category:</ThemedText>
      <View style={styles.categoryButtonsContainer}>
        {availableCategories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedMainCategory === category && styles.selectedCategoryButton,
              isLoading && styles.disabledButton
            ]}
            onPress={() => {
              setSelectedMainCategory(category);
              setEnteredSubcategory(''); // Reset subcategory when main category changes
            }}
            disabled={isLoading}
          >
            <ThemedText 
              style={selectedMainCategory === category ? styles.selectedCategoryButtonText : styles.categoryButtonText}
              colorToken={selectedMainCategory === category ? 'textOnPinkBarbie' : 'textOnPinkBarbie'}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMainCategory && (
        <>
          <ThemedText type="defaultSemiBold" style={styles.promptText} colorToken="textSecondary">
            Subcategory for {selectedMainCategory} (Optional, type or select):
          </ThemedText>
          <TextInput
            style={styles.inputField}
            placeholder="e.g., Casual, Work, Summer"
            placeholderTextColor={getColor('textDisabled', colorScheme)}
            value={enteredSubcategory}
            onChangeText={setEnteredSubcategory}
            editable={!isLoading}
          />
          {filteredSubcategories.length > 0 && (
            <FlatList
              horizontal
              data={filteredSubcategories}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.subcategoryChip} 
                  onPress={() => selectSubcategory(item)}
                  disabled={isLoading}
                >
                  <Text style={styles.subcategoryChipText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              style={styles.subcategoryList}
            />
          )}
          {(userSubcategories?.[selectedMainCategory]?.length || 0) === 0 && enteredSubcategory.trim() === '' && (
             <ThemedText style={styles.infoText} colorToken="textDisabled">No subcategories yet for {selectedMainCategory}. Type to add one.</ThemedText>
          )}
        </>
      )}

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.mainActionButton, styles.cancelButton, isLoading && styles.disabledButton]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <ThemedText colorToken="textOnPinkRaspberry" style={styles.mainActionButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mainActionButton, 
            styles.categorizeButton, 
            (!selectedMainCategory || isLoading) && styles.disabledButton
          ]}
          onPress={handleCategorize}
          disabled={!selectedMainCategory || isLoading}
        >
          <ThemedText colorToken="textOnPinkBarbie" style={styles.mainActionButtonText}>Categorize Item</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  scrollContainer: {
    width: '100%',
  },
  pendingItemContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Ensure space for the last button
    paddingHorizontal: 15,
    backgroundColor: getColor('bgScreen', scheme), // Match screen background
    width: '100%',
  },
  pendingTitle: {
    marginVertical: 15,
    textAlign: 'center',
  },
  pendingImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
  },
  promptText: {
    marginTop: 15,
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontSize: 16,
  },
  inputField: {
    width: '100%',
    height: 45,
    borderColor: getColor('border', scheme),
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
    color: getColor('textPrimary', scheme),
    backgroundColor: getColor('bgCard', scheme), // Slightly different from screen for emphasis
  },
  categoryPromptText: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    fontSize: 16,
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: getColor('pinkBlush', scheme),
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: getColor('pinkRaspberry', scheme),
  },
  selectedCategoryButton: {
    backgroundColor: getColor('pinkRaspberry', scheme),
    borderColor: getColor('pinkBarbie', scheme),
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: getColor('pinkRaspberry',scheme) // Text color for non-selected main category
  },
  selectedCategoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold', // Make selected category text bold
    color: getColor('textOnPinkRaspberry', scheme) // Ensure contrast for selected button
  },
  subcategoryList: {
    maxHeight: 50, // Limit height of horizontal scroll
    marginBottom: 15,
  },
  subcategoryChip: {
    backgroundColor: getColor('pinkHighlight', scheme),
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
    borderColor: getColor('pinkBlush', scheme),
    borderWidth: 1,
  },
  subcategoryChipText: {
    fontSize: 14,
    color: getColor('textSecondary', scheme),
  },
  infoText: {
    fontSize: 12,
    marginVertical: 10,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  mainActionButton: {
    flex: 1, // Each button takes half space
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categorizeButton: {
    backgroundColor: getColor('pinkBarbie', scheme),
  },
  cancelButton: {
    backgroundColor: getColor('pinkBlush', scheme), // Softer for cancel
    borderColor: getColor('pinkRaspberry', scheme),
    borderWidth: 1,
  },
  mainActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: getColor('bgDisabled', scheme),
    opacity: 0.7,
    borderColor: getColor('textDisabled', scheme),
  },
});

export default PendingItemView; 