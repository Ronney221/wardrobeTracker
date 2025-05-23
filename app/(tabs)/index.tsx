import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  // Text, // Will use ThemedText or style existing Text
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

// Import our theme helpers
import { ThemedText } from '@/components/ThemedText'; // Import ThemedText
import { ThemedView } from '@/components/ThemedView';
import { getColor } from '@/src/constants/theme'; // Adjusted path

// Import the custom hook that manages all wardrobe logic
import { useWardrobeManager } from '@/src/context/WardrobeContext'; // Updated import
// Import the UI components we created
import { EditItemModal } from '@/src/components/wardrobe/EditItemModal'; // Import EditItemModal
import PendingItemView from '@/src/components/wardrobe/PendingItemView'; // Corrected import style
import WardrobeList from '@/src/components/wardrobe/WardrobeList'; // Corrected import style
import { CLOTHING_CATEGORIES } from '@/src/constants/wardrobe';
import { ClothingCategory, WardrobeItemData } from '@/src/types/wardrobe'; // Ensure WardrobeItemData is imported

// Main functional component for the Wardrobe Screen
export default function WardrobeScreen() {
  const {
    wardrobeItems,
    currentOutfitSelection,
    pendingPastedImage,
    setPendingPastedImage,
    isLoading,
    isInitialLoadComplete,
    isGlobalEditModeActive,
    toggleGlobalEditMode,
    handlePasteImage,
    handleCategorizeImage,
    handleSelectItemForOutfit,
    handleSaveCurrentOutfit,
    handleDeleteItem,
    handleSuggestRandomOutfit,
    userSubcategories,
    handleAddSubcategory,
    isCreatingOutfit,
    toggleOutfitCreationMode,
    handleUpdateWardrobeItemDetails, // Get the new handler
  } = useWardrobeManager();

  const insets = useSafeAreaInsets(); // Get insets
  const scheme = useColorScheme() ?? 'light';
  const styles = getStyles(scheme, insets.top, insets.bottom);

  // State for EditItemModal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<WardrobeItemData | null>(null);
  const [editingItemOriginalCategory, setEditingItemOriginalCategory] = useState<ClothingCategory | null>(null);

  const handleOpenEditModal = (item: WardrobeItemData, category: ClothingCategory) => {
    setItemToEdit(item);
    setEditingItemOriginalCategory(category);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setItemToEdit(null);
    setEditingItemOriginalCategory(null);
  };

  const handleSaveChangesFromModal = (itemId: string, newName: string, newSubcategory: string) => {
    if (editingItemOriginalCategory) { // Ensure category is not null
        handleUpdateWardrobeItemDetails(editingItemOriginalCategory, itemId, newName, newSubcategory);
    }
    handleCloseEditModal();
  };

  const handleDeleteFromModal = (itemId: string) => {
    if (editingItemOriginalCategory) { // Ensure category is not null before calling delete
        handleDeleteItem(editingItemOriginalCategory, itemId); 
    }
    handleCloseEditModal(); 
  };

  // Determine if the main wardrobe view (collections, outfits, actions) should be shown
  const showMainWardrobeView = !pendingPastedImage && !isCreatingOutfit;

  if (isLoading && !isInitialLoadComplete && !pendingPastedImage) {
    return (
      <ThemedView style={styles.fullScreenLoaderContainer}>
        <ActivityIndicator size="large" color={getColor('pinkBarbie', scheme)} />
        <ThemedText colorToken="textSecondary" style={styles.loadingText}>Loading your wardrobe...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ThemedView style={styles.container}>
        {pendingPastedImage && !isCreatingOutfit ? (
          <PendingItemView
            pendingImageUri={pendingPastedImage}
            onCancel={() => setPendingPastedImage(null)}
            onCategorizeImage={(category, name, subcategory) => {
              handleCategorizeImage(category, name, subcategory);
              setPendingPastedImage(null);
            }}
            availableCategories={CLOTHING_CATEGORIES}
            colorScheme={scheme}
            userSubcategories={userSubcategories || {}}
            onAddSubcategory={handleAddSubcategory}
            isLoading={isLoading}
          />
        ) : (
          <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1 }}>
            {showMainWardrobeView && (
              <View style={styles.titleContainer}>
                <TouchableOpacity style={styles.headerIconTouchableLeft} onPress={() => Alert.alert("Settings", "Settings pressed!")}>
                  <FontAwesome name="cog" size={24} color={getColor('textSecondary', scheme)} />
                </TouchableOpacity>
                <ThemedText type="title" colorToken="pinkRaspberry" style={styles.title}>My Archives</ThemedText>
                <TouchableOpacity style={styles.headerIconTouchableRight} onPress={() => Alert.alert("Profile", "Profile pressed!")}>
                  <FontAwesome name="user-circle" size={24} color={getColor('textSecondary', scheme)} />
                </TouchableOpacity>
              </View>
            )}

            {showMainWardrobeView && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={[styles.button, styles.actionButton]} onPress={handlePasteImage}>
                  <FontAwesome name="paste" size={20} color={getColor('textOnPinkBarbie', scheme)} />
                  <ThemedText colorToken="textOnPinkBarbie" style={styles.buttonText}>Paste Item</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.actionButton]} onPress={toggleOutfitCreationMode}>
                  <FontAwesome name={isCreatingOutfit ? "close" : "plus"} size={20} color={getColor('textOnPinkBarbie', scheme)} />
                  <ThemedText colorToken="textOnPinkBarbie" style={styles.buttonText}>
                    {isCreatingOutfit ? "Cancel Outfit" : "Create Outfit"}
                  </ThemedText>
                </TouchableOpacity>
                 <TouchableOpacity 
                    style={[styles.button, styles.editModeButton, isGlobalEditModeActive && styles.activeEditButton]}
                    onPress={toggleGlobalEditMode}
                  >
                    <FontAwesome name="edit" size={20} color={getColor(isGlobalEditModeActive ? 'textOnPinkBarbie' : 'textSecondary', scheme)} />
                    <ThemedText style={[styles.buttonText, styles.editModeButtonText, isGlobalEditModeActive && styles.activeEditModeButtonText]}>
                      {isGlobalEditModeActive ? "Done Editing" : "Edit Items"}
                    </ThemedText>
                  </TouchableOpacity>
              </View>
            )}

            {isCreatingOutfit && (
              <View style={styles.outfitCreationContainer}>
                <View style={styles.outfitCreationHeader}>
                  <TouchableOpacity onPress={toggleOutfitCreationMode} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={24} color={getColor('textSecondary', scheme)} />
                  </TouchableOpacity>
                  <ThemedText type="subtitle" colorToken="pinkRaspberry" style={styles.subHeader}>
                    Create New Outfit
                  </ThemedText>
                  <View style={{ width: styles.backButton.padding * 2 + 24 }} />
                </View>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity style={[styles.button, styles.suggestButton]} onPress={handleSuggestRandomOutfit}>
                      <FontAwesome name="random" size={20} color={getColor('textOnPinkBarbie', scheme)} />
                      <ThemedText style={styles.buttonText} colorToken="textOnPinkBarbie">Suggest Random</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* WardrobeList should be visible if not pasting, AND (either in main view OR creating an outfit) */}
            {/* It also needs wardrobeItems to be loaded */}
            {!pendingPastedImage && wardrobeItems && (showMainWardrobeView || isCreatingOutfit) && (
              <WardrobeList
                wardrobeItems={wardrobeItems}
                onTriggerEditItem={handleOpenEditModal} // Pass new handler for editing
                isCreatingOutfit={isCreatingOutfit}
                currentOutfitSelection={currentOutfitSelection}
                onSelectItemForOutfit={handleSelectItemForOutfit}
                isGlobalEditModeActive={isGlobalEditModeActive} 
                onToggleGlobalEditMode={toggleGlobalEditMode}
                pendingPastedImage={null} // When WardrobeList is shown, pendingPastedImage is handled or null
                isLoading={isLoading}       // Pass current loading state
              />
            )}
          </ScrollView>
        )}

        {/* Save Outfit Button - shown at the bottom only when creating an outfit */}
        {isCreatingOutfit && (
          <View style={styles.saveOutfitFooter}>
            <TouchableOpacity 
              style={[styles.button, styles.saveOutfitButton, styles.fullWidthButton]} // Add fullWidthButton style
              onPress={handleSaveCurrentOutfit} 
              disabled={Object.values(currentOutfitSelection).every(item => item === null || (Array.isArray(item) && item.length === 0))}
            >
              <FontAwesome name="save" size={20} color={getColor('textOnPinkBarbie', scheme)} />
              <ThemedText colorToken="textOnPinkBarbie" style={styles.buttonText}>Save Outfit</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
      {itemToEdit && editingItemOriginalCategory && (
        <EditItemModal
            isVisible={isEditModalVisible}
            onClose={handleCloseEditModal}
            itemToEdit={itemToEdit}
            originalCategory={editingItemOriginalCategory}
            onSaveChanges={handleSaveChangesFromModal}
            onDeleteItem={handleDeleteFromModal} // Pass the specific delete handler for the modal
            userSubcategories={userSubcategories || {}} // Ensure not null
            onAddSubcategory={handleAddSubcategory}
        />
      )}
    </SafeAreaView>
  );
}

// Styles function
const getStyles = (scheme: 'light' | 'dark', topInset: number, bottomInset: number) => StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: getColor('bgScreen', scheme),
  },
  safeArea: {
    flex: 1,
    backgroundColor: getColor('bgScreen', scheme),
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 8,
    flex: 1,
    backgroundColor: getColor('bgScreen', scheme),
    width: '100%',
    paddingBottom: bottomInset, // Apply bottom inset padding
  },
  titleContainer: {
    width: '100%',
    flexDirection: 'row', // Arrange icons and title in a row
    justifyContent: 'space-between', // Space out icons and title
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8, // Add padding to space icons from edges
  },
  title: {
    textAlign: 'center',
    flex: 1, // Allow title to take remaining space for centering
  },
  headerIconTouchableLeft: {
    padding: 8, 
    // Position absolutely or use flex to place on left
  },
  headerIconTouchableRight: {
    padding: 8,
    // Position absolutely or use flex to place on right
  },
  subHeader: {
    textAlign: 'center',
    marginVertical: 10,
    flex: 1, // Allow text to take available space in header
  },
  outfitCreationHeader: { // New style for the header of the outfit creation section
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8, // Match container padding
    marginBottom: 10,
  },
  backButton: { // Style for the new back button
    padding: 8, // Make it easier to tap
    // Adding explicit width/height for the touchable area might be useful if the icon is small
    // For now, padding should suffice. We calculate spacer based on this.
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', 
    flexWrap: 'wrap',
    width: '100%',
    alignItems: 'center', // Align items to center vertically if they wrap to new lines
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4, 
    elevation: 2, // Android shadow
    shadowColor: getColor('shadowDefault', scheme), // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    backgroundColor: getColor('pinkBarbie', scheme), 
  },
  actionButton: {
    // Main action buttons - "Paste Item", "Create Outfit"
    // These will use the default 'button' style primarily
    // You can add specific overrides here if needed in the future
  },
  editModeButton: { // New style for the "Edit Items" button (default state)
    backgroundColor: getColor('bgMuted', scheme),
    paddingHorizontal: 10, // Slightly less horizontal padding
    margin: 3, // Slightly smaller margin
  },
  editModeButtonText: { // Style for the text of the "Edit Items" button (default state)
    color: getColor('textSecondary', scheme),
    marginLeft: 6, // Slightly reduced margin for text
  },
  activeEditButton: {
    backgroundColor: getColor('pinkRaspberry', scheme), // Darker when active
  },
  activeEditModeButtonText: { // Style for text of "Edit Items" button when active
    color: getColor('textOnPinkBarbie', scheme),
  },
  saveOutfitButton: {
    backgroundColor: getColor('pinkRaspberry', scheme),
  },
  suggestButton: {
    backgroundColor: getColor('accentMagenta', scheme),
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  outfitCreationContainer: {
    width: '100%',
    padding: 8,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
    borderRadius: 8,
    backgroundColor: getColor('bgCard', scheme),
  },
  saveOutfitFooter: { // New style for the footer containing the save button
    width: '100%',
    padding: 8, 
    paddingBottom: bottomInset > 8 ? bottomInset : 8, // Ensure footer respects bottom inset
    borderTopWidth: 1,
    borderTopColor: getColor('borderSubtle', scheme),
    backgroundColor: getColor('bgScreen', scheme), // Match screen bg
  },
  fullWidthButton: { // Style for a button that takes more width, e.g., the save button
    width: '100%', // Make button take full width of its container
    margin: 0, // Remove horizontal margin if it's full width
  },
  fullScreenLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('bgScreen', scheme),
  },
  loadingText: {
    marginTop: 8,
  },
});