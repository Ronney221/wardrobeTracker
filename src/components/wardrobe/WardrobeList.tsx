import { ThemedText } from '@/components/ThemedText'; // Import ThemedText
import { getColor } from '@/src/constants/theme'; // Import getColor
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native'; // Removed Text, Added useColorScheme
import { CLOTHING_CATEGORIES } from '../../constants/wardrobe'; // Import clothing categories constant
import { ClothingCategory, OutfitSelection, WardrobeItems } from '../../types/wardrobe'; // Import WardrobeItems type and ClothingCategory
import CategorySection from './CategorySection'; // Import the CategorySection component

interface WardrobeListProps {
  wardrobeItems: WardrobeItems; // The object containing all categorized items
  pendingPastedImage: string | null; // To know if an item is pending, affecting empty state logic
  isLoading: boolean; // To know if data is currently being loaded
  // Add a callback prop for deleting an item, specifying category and index
  onDeleteItem: (category: ClothingCategory, itemIndex: number) => void; 
  // Add new props for outfit creation mode
  isCreatingOutfit: boolean;
  currentOutfitSelection: OutfitSelection;
  onSelectItemForOutfit: (category: ClothingCategory, itemUri: string) => void;
  // Add new props for global edit mode
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
}

const WardrobeList: React.FC<WardrobeListProps> = ({ 
  wardrobeItems, 
  pendingPastedImage, 
  isLoading, 
  onDeleteItem, 
  isCreatingOutfit, 
  currentOutfitSelection, 
  onSelectItemForOutfit, 
  // Destructure new props
  isGlobalEditModeActive,
  onToggleGlobalEditMode
}) => {
  const scheme = useColorScheme() || 'light';
  const styles = getStyles(scheme);
  const isWardrobeCompletelyEmpty = Object.values(wardrobeItems).every(categoryArray => categoryArray.length === 0);

  // Determine if we should show the main content or the empty state message
  // Don't show empty state if an image is pending or if it's initial loading phase (global loading handles this)
  const showEmptyState = isWardrobeCompletelyEmpty && !pendingPastedImage && !isLoading && !isCreatingOutfit && !isGlobalEditModeActive;

  return (
    <View style={styles.wardrobeListContainer}>
      {showEmptyState ? (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="hanger" size={60} color={getColor('textDisabled', scheme)} />
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>Your Wardrobe is Bare! 🧥</ThemedText>
          <ThemedText style={styles.emptyStateSubtitle}>
            Tap &apos;Paste Clothing Item&apos; above to start adding your clothes.
          </ThemedText>
        </View>
      ) : (
        <>
          <ThemedText type="subtitle" style={styles.wardrobeTitle}>
            {isCreatingOutfit ? "Select Items for Outfit" : "Your Collection"}
          </ThemedText>
          {CLOTHING_CATEGORIES.map(category => {
            const itemsForCategory = wardrobeItems[category] || [];
            if (itemsForCategory.length > 0 || isCreatingOutfit || isGlobalEditModeActive) {
              // Get the selection for the current category.
              // This can be string (for single-select) or string[] (for accessories) or null/undefined.
              const selectionForCategory = currentOutfitSelection[category as keyof OutfitSelection];

              return (
                <CategorySection
                  key={category}
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                  items={itemsForCategory}
                  onDeleteItem={(itemIndex) => onDeleteItem(category, itemIndex)}
                  isCreatingOutfit={isCreatingOutfit}
                  // Pass the direct selection (string, string[], or null after defaulting undefined)
                  currentOutfitSelectionForCategory={selectionForCategory || null} 
                  onSelectItemForOutfit={(itemUri) => onSelectItemForOutfit(category, itemUri)}
                  isGlobalEditModeActive={isGlobalEditModeActive}
                  onToggleGlobalEditMode={onToggleGlobalEditMode}
                />
              );
            }
            return null; 
          })}
        </>
      )}
    </View>
  );
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  wardrobeListContainer: {
    width: '100%', // Container takes full width
  },
  wardrobeTitle: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    marginLeft: '2.5%', // Align with overall container padding
  },
  emptyStateContainer: { // New style for the container of empty state elements
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40, // Kept as 40 (multiple of 8)
    paddingHorizontal: 24, // Updated from 20
  },
  emptyStateTitle: { // New style for the main title of empty state
    marginTop: 16,
    marginBottom: 8, // Kept as 8 (good)
    textAlign: 'center',
  },
  emptyStateSubtitle: { // New style for the subtitle/instruction of empty state
    textAlign: 'center',
    lineHeight: 22,
    color: getColor('textSecondary', scheme), // Explicitly set if not covered by ThemedText default
  },
  // Separator is not used here anymore, but kept if needed for other designs
  separator: {
    height: 1,
    width: '90%',
    backgroundColor: '#BDC3C7',
    marginVertical: 24, // This was already updated to 24, good.
    alignSelf: 'center',
  },
});

export default WardrobeList; 