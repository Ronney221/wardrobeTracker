import { ThemedText } from '@/components/ThemedText';
import { getColor } from '@/src/constants/theme';
import { WardrobeItemData } from '@/src/types/wardrobe'; // Import WardrobeItemData
import React from 'react';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import WardrobeItem from './WardrobeItem'; // Import the WardrobeItem component

interface CategorySectionProps {
  title: string; // Title of the category (e.g., "Hats", "Shirts")
  items: WardrobeItemData[]; // Updated to WardrobeItemData[]
  // isLoading?: boolean; // Could be used to show loading state per section if needed
  onTriggerEditItem: (item: WardrobeItemData) => void; // New prop for editing
  isCreatingOutfit: boolean;
  currentOutfitSelectionForCategory: string[] | null; // Updated for multi-select
  onSelectItemForOutfit: (itemId: string) => void; // Changed to take itemId
  // Add new props for global edit mode
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
}

// Helper to group items by subcategory
const groupItemsBySubcategory = (items: WardrobeItemData[]): Record<string, WardrobeItemData[]> => {
  return items.reduce((acc, item) => {
    const subcategory = item.subcategory || 'Uncategorized'; // Group items without subcategory under 'Uncategorized'
    if (!acc[subcategory]) {
      acc[subcategory] = [];
    }
    acc[subcategory].push(item);
    return acc;
  }, {} as Record<string, WardrobeItemData[]>);
};

const CategorySection: React.FC<CategorySectionProps> = ({ title, items, isCreatingOutfit, currentOutfitSelectionForCategory, onSelectItemForOutfit, isGlobalEditModeActive, onToggleGlobalEditMode, onTriggerEditItem }) => {
  const scheme = useColorScheme() || 'light';
  const styles = getStyles(scheme);

  // If there are no items in this category, do not render the section.
  // This can be adjusted if you always want to show category titles even if empty.
  if (items.length === 0 && !isCreatingOutfit) { // Don't show empty category if not creating outfit and it has no items
    return (
        <View style={styles.categorySectionContainer}>
            <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>{title}</ThemedText>
            <ThemedText style={styles.emptyCategoryText}>No items in {title.toLowerCase()} yet.</ThemedText>
        </View>
    );
  }
  // If creating an outfit and category is empty, still render title but different message or nothing for items
   if (items.length === 0 && isCreatingOutfit) {
    return (
      <View style={styles.categorySectionContainer}>
        <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>{title}</ThemedText>
        <ThemedText style={styles.emptyCategoryText}>No items in {title.toLowerCase()} to select.</ThemedText>
      </View>
    );
  }

  const groupedItems = groupItemsBySubcategory(items);
  // Sort subcategories, perhaps with 'Uncategorized' last or first
  const sortedSubcategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Uncategorized') return 1; // Push 'Uncategorized' to the end
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b); // Alphabetical sort for others
  });

  return (
    <View style={styles.categorySectionContainer}>
      {/* Display the category title */}
      <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>{title}</ThemedText>
      {sortedSubcategories.map(subcategoryName => {
        const subcategoryItems = groupedItems[subcategoryName];
        if (subcategoryItems.length === 0) return null; // Should not happen if groupItemsBySubcategory is correct

        return (
          <View key={subcategoryName} style={styles.subcategoryGroupContainer}>
            {/* Display subcategory title only if it's not 'Uncategorized' OR if there's more than one group */}
            {(subcategoryName !== 'Uncategorized' || sortedSubcategories.length > 1) && (
                <ThemedText type="default" style={styles.subcategoryTitle}>{subcategoryName}</ThemedText>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemsScrollView}>
              {subcategoryItems.map(itemData => { // itemData is WardrobeItemData
                // isSelected logic updated
                const isSelected = 
                  Array.isArray(currentOutfitSelectionForCategory) && 
                  currentOutfitSelectionForCategory.includes(itemData.id);

                return (
                  <WardrobeItem
                    key={itemData.id}
                    itemData={itemData}
                    categoryName={title} // Main category title
                    onEdit={() => onTriggerEditItem(itemData)} // Pass the item to edit trigger
                    isCreatingOutfit={isCreatingOutfit}
                    isSelectedForOutfit={isSelected}
                    onSelectItemForOutfit={() => onSelectItemForOutfit(itemData.id)} // Pass itemData.id
                    isGlobalEditModeActive={isGlobalEditModeActive}
                    onToggleGlobalEditMode={onToggleGlobalEditMode}
                  />
                );
              })}
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  categorySectionContainer: {
    width: '100%', // Section takes full width
    marginBottom: 12, // Reduced margin slightly as subcategories add vertical space
  },
  categoryTitle: {
    marginBottom: 8,
    paddingHorizontal: '2.5%',
    fontSize: 18, // Slightly larger for main category
  },
  subcategoryGroupContainer: {
    marginBottom: 12, // Space between subcategory groups
  },
  subcategoryTitle: {
    marginBottom: 6,
    paddingHorizontal: '3.5%', // Indent subcategory title slightly
    fontSize: 15, // Slightly smaller for subcategory
    color: getColor('textSecondary', scheme),
  },
  itemsScrollView: {
    paddingLeft: '2.5%', // Start items with a bit of padding from the left edge
    paddingRight: 10, // Ensure last item doesn't get cut off by right edge if not enough space
    paddingVertical: 8, // Updated from 5
  },
  emptyCategoryText: {
    paddingHorizontal: '2.5%',
    marginBottom: 8,
    color: getColor('textDisabled', scheme),
  },
});

export default CategorySection; 