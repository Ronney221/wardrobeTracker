import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
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
import PendingItemView from '@/src/components/wardrobe/PendingItemView'; // Corrected import style
import WardrobeList from '@/src/components/wardrobe/WardrobeList'; // Corrected import style
import { CLOTHING_CATEGORIES } from '@/src/constants/wardrobe';

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
  } = useWardrobeManager();

  const insets = useSafeAreaInsets(); // Get insets
  const scheme = useColorScheme() ?? 'light';
  const styles = getStyles(scheme, insets.bottom);

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
                <ThemedText type="title" colorToken="pinkRaspberry" style={styles.title}>My Wardrobe</ThemedText>
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
                      style={[styles.button, styles.actionButton, isGlobalEditModeActive && styles.activeEditButton]} 
                      onPress={toggleGlobalEditMode}
                    >
                      <FontAwesome name="edit" size={20} color={getColor(isGlobalEditModeActive ? 'textOnPinkBarbie' : 'textOnPinkBarbie', scheme)} />
                      <ThemedText colorToken={isGlobalEditModeActive ? 'textOnPinkBarbie' : 'textOnPinkBarbie'} style={styles.buttonText}>
                        {isGlobalEditModeActive ? "Done Editing" : "Edit Items"}
                      </ThemedText>
                    </TouchableOpacity>
                </View>
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
                onDeleteItem={handleDeleteItem}
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
    </SafeAreaView>
  );
}

// Styles function
const getStyles = (scheme: 'light' | 'dark', bottomInset: number) => StyleSheet.create({
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
    paddingTop: 16, // Explicit top padding
    paddingHorizontal: 8,
    flex: 1,
    backgroundColor: getColor('bgScreen', scheme),
    width: '100%',
    paddingBottom: bottomInset, // Apply bottom inset padding
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
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
    justifyContent: 'center', // Center the suggest button if it's the only one
    flexWrap: 'wrap',
    width: '100%',
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
    // Potentially add specific styles or keep relying on generic button styles
  },
  activeEditButton: {
    backgroundColor: getColor('pinkRaspberry', scheme), // Darker when active
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