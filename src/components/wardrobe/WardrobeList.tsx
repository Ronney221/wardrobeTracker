import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
  const isWardrobeCompletelyEmpty = Object.values(wardrobeItems).every(categoryArray => categoryArray.length === 0);

  // Determine if we should show the main content or the empty state message
  // Don't show empty state if an image is pending or if it's initial loading phase (global loading handles this)
  const showEmptyState = isWardrobeCompletelyEmpty && !pendingPastedImage && !isLoading && !isCreatingOutfit && !isGlobalEditModeActive;

  return (
    <View style={styles.wardrobeListContainer}>
      {showEmptyState ? (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="hanger" size={60} color="#BDC3C7" />
          <Text style={styles.emptyStateTitle}>Your Wardrobe is Bare! 🧥</Text>
          <Text style={styles.emptyStateSubtitle}>
            Tap &apos;Paste Clothing Item&apos; above to start adding your clothes.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.wardrobeTitle}>
            {isCreatingOutfit ? "Select Items for Outfit" : "Your Collection"}
          </Text>
          {CLOTHING_CATEGORIES.map(category => {
            const itemsForCategory = wardrobeItems[category] || [];
            // Only render CategorySection if it has items OR if we are in outfit creation mode (to show empty slots)
            // OR if global edit mode is active (to potentially delete last item and see empty state)
            if (itemsForCategory.length > 0 || isCreatingOutfit || isGlobalEditModeActive) {
              return (
                <CategorySection
                  key={category}
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                  items={itemsForCategory}
                  // Pass a function to CategorySection's onDeleteItem prop.
                  // This function calls the onDeleteItem prop of WardrobeList, 
                  // pre-filling it with the current category.
                  onDeleteItem={(itemIndex) => onDeleteItem(category, itemIndex)}
                  // Pass outfit related props to CategorySection
                  isCreatingOutfit={isCreatingOutfit}
                  currentOutfitSelectionForCategory={currentOutfitSelection[category] || null} // Pass only the relevant part
                  onSelectItemForOutfit={(itemUri) => onSelectItemForOutfit(category, itemUri)}
                  // Pass global edit mode props down to CategorySection
                  isGlobalEditModeActive={isGlobalEditModeActive}
                  onToggleGlobalEditMode={onToggleGlobalEditMode}
                />
              );
            }
            return null; // Don't render empty categories if not creating outfit or in edit mode
          })}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wardrobeListContainer: {
    width: '100%', // Container takes full width
  },
  wardrobeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16, // Updated from 15
    color: '#2C3E50',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495E',
    marginTop: 16, // Updated from 15
    marginBottom: 8, // Kept as 8 (good)
    textAlign: 'center',
  },
  emptyStateSubtitle: { // New style for the subtitle/instruction of empty state
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
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