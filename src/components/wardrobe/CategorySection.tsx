import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import WardrobeItem from './WardrobeItem'; // Import the WardrobeItem component

interface CategorySectionProps {
  title: string; // Title of the category (e.g., "Hats", "Shirts")
  items: string[]; // Array of image URIs for items in this category
  // isLoading?: boolean; // Could be used to show loading state per section if needed
  onDeleteItem: (itemIndex: number) => void; // Add a callback prop for when an item in this specific category needs to be deleted
  // Add new props for outfit creation mode
  isCreatingOutfit: boolean;
  currentOutfitSelectionForCategory: string | null; // URI of the item selected in this category for the current outfit, or null
  onSelectItemForOutfit: (itemUri: string) => void; // Callback when an item is selected for the outfit
  // Add new props for global edit mode
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, items, onDeleteItem, isCreatingOutfit, currentOutfitSelectionForCategory, onSelectItemForOutfit, isGlobalEditModeActive, onToggleGlobalEditMode }) => {
  // If there are no items in this category, do not render the section.
  // This can be adjusted if you always want to show category titles even if empty.
  if (items.length === 0 && !isCreatingOutfit) { // Don't show empty category if not creating outfit and it has no items
    return (
        <View style={styles.categorySectionContainer}>
            <Text style={styles.categoryTitle}>{title}</Text>
            <Text style={styles.emptyCategoryText}>No items in {title.toLowerCase()} yet.</Text>
        </View>
    );
  }
  // If creating an outfit and category is empty, still render title but different message or nothing for items
   if (items.length === 0 && isCreatingOutfit) {
    return (
      <View style={styles.categorySectionContainer}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.emptyCategoryText}>No items in {title.toLowerCase()} to select.</Text>
      </View>
    );
  }

  return (
    <View style={styles.categorySectionContainer}>
      {/* Display the category title */}
      <Text style={styles.categoryTitle}>{title}</Text>
      {/* Use a horizontal ScrollView to display items if they exist */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemsScrollView}>
        {/* Map over the items array and render a WardrobeItem for each URI */}
        {items.map((uri, index) => (
          <WardrobeItem
            key={`${title}_item_${index}_${uri.slice(0, 20)}`} // Unique key for each item
            uri={uri} // Pass the image URI to the WardrobeItem component
            categoryName={title} // Pass category name
            onDeleteItem={() => onDeleteItem(index)} // Pass a function to WardrobeItem's onDeleteItem prop that calls the onDeleteItem prop of this component, pre-filled with the current item's index.
            // Pass outfit related props to WardrobeItem
            isCreatingOutfit={isCreatingOutfit}
            isSelectedForOutfit={currentOutfitSelectionForCategory === uri} // Check if this item is selected
            onSelectItemForOutfit={() => onSelectItemForOutfit(uri)} // Pass the URI of this item
            // Pass global edit mode props
            isGlobalEditModeActive={isGlobalEditModeActive}
            onToggleGlobalEditMode={onToggleGlobalEditMode}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categorySectionContainer: {
    width: '100%', // Section takes full width
    marginBottom: 24, // Updated from 25 (or 20 based on earlier thought)
  },
  categoryTitle: {
    fontSize: 18, // Kept 18 for sub-section title
    fontWeight: '600',
    marginBottom: 8, // Updated from 10
    color: '#34495E',
    paddingHorizontal: '2.5%', // Align with overall container padding
  },
  itemsScrollView: {
    paddingLeft: '2.5%', // Start items with a bit of padding from the left edge
    paddingRight: 10, // Ensure last item doesn't get cut off by right edge if not enough space
    paddingVertical: 8, // Updated from 5
  },
  emptyCategoryText: {
    fontSize: 14,
    color: '#999999', // Updated from #7F8C8D
    paddingHorizontal: '2.5%',
    marginBottom: 8, // Updated from 10 to align with title margin
  },
});

export default CategorySection; 