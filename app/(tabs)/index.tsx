import React from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    // Text, // Will use ThemedText or style existing Text
    TouchableOpacity,
    View,
    useColorScheme, // Import useColorScheme
} from 'react-native';

// Import our theme helpers
import { ThemedText } from '@/components/ThemedText'; // Import ThemedText
import { getColor } from '@/src/constants/theme'; // Adjusted path

// Import the custom hook that manages all wardrobe logic
import { useWardrobeManager } from '@/src/hooks/useWardrobeManager'; // Ensure this path is correct based on tsconfig
// Import the UI components we created
import { OutfitList } from '@/src/components/outfit/OutfitList'; // Ensure this path is correct
import PendingItemView from '@/src/components/wardrobe/PendingItemView'; // Ensure this path is correct
import WardrobeList from '@/src/components/wardrobe/WardrobeList'; // Ensure this path is correct

// Main functional component for the Wardrobe Screen
export default function WardrobeScreen() {
  const scheme = useColorScheme() || 'light'; // Get current color scheme
  const styles = getStyles(scheme); // Generate styles based on scheme

  // Use the custom hook to get state and handler functions
  const {
    wardrobeItems,
    pendingPastedImage,
    isLoading,
    isInitialLoadComplete, // Use this to potentially delay rendering parts of UI until loaded
    handlePasteImage,
    handleCategorizeImage,
    handleDeleteItem, // Get the delete handler from the hook
    // Outfit related state and handlers
    isCreatingOutfit,
    currentOutfitSelection, // Needed for WardrobeList to highlight selected items
    toggleOutfitCreationMode,
    handleSelectOutfitItem, // Needed for WardrobeList
    handleSaveCurrentOutfit,
    // Outfit list related
    savedOutfits, 
    handleDeleteOutfit,
    // Global Edit Mode
    isGlobalEditModeActive,
    toggleGlobalEditMode,
    // Suggest Outfit
    handleSuggestRandomOutfit,
  } = useWardrobeManager();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title" style={styles.title}>My Wardrobe</ThemedText>

        {/* Main action buttons area */}
        <View style={styles.mainActionsContainer}>
          {isGlobalEditModeActive ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.doneEditingButton]} 
              onPress={toggleGlobalEditMode} 
            >
              <ThemedText style={styles.actionButtonText} colorToken="textOnPinkBarbie">Done Editing</ThemedText>
            </TouchableOpacity>
          ) : (
            <>
              {!isCreatingOutfit && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.pasteButton, isLoading && styles.disabledButton]} 
                  onPress={handlePasteImage} 
                  disabled={isLoading}
                >
                  <ThemedText style={styles.actionButtonText} colorToken="textOnPinkBarbie">Paste Clothing Item</ThemedText>
                </TouchableOpacity>
              )}

              {/* Container for Create and Suggest Outfit buttons to be side-by-side or stacked if narrow */}
              <View style={styles.creationButtonsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    styles.halfWidthButton, 
                    isCreatingOutfit ? styles.cancelButton : styles.createOutfitButton, 
                    isLoading && !isCreatingOutfit && styles.disabledButton
                  ]} 
                  onPress={toggleOutfitCreationMode} 
                  disabled={isLoading && !isCreatingOutfit} 
                >
                  <ThemedText style={styles.actionButtonText} colorToken={isCreatingOutfit ? "textOnPinkRaspberry" : "textOnPinkBarbie"}>
                    {isCreatingOutfit ? "Cancel Creation" : "Create Outfit"} 
                  </ThemedText>
                </TouchableOpacity>

                {!isCreatingOutfit && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.halfWidthButton, styles.suggestOutfitButton, isLoading && styles.disabledButton]} 
                    onPress={handleSuggestRandomOutfit} 
                    disabled={isLoading}
                  >
                    <ThemedText style={styles.actionButtonText} colorToken="textOnPinkBarbie">Suggest Outfit</ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {isCreatingOutfit && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveOutfitButton, isLoading && styles.disabledButton]} 
                  onPress={handleSaveCurrentOutfit} 
                  disabled={isLoading}
                >
                  <ThemedText style={styles.actionButtonText} colorToken="textOnPinkBarbie">Save Outfit</ThemedText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Loading indicator */}
        {isLoading && !isGlobalEditModeActive && <ActivityIndicator size="large" color={getColor('pinkBarbie', scheme)} style={styles.activityIndicator} />}

        {/* Section for the pending image, if one exists and not in other modes - allow if global edit mode is NOT active */}
        {pendingPastedImage && !isCreatingOutfit && !isLoading && !isGlobalEditModeActive && (
          <PendingItemView
            pendingImageUri={pendingPastedImage}
            onCategorizeImage={handleCategorizeImage}
            isLoading={isLoading}
          />
        )}
        
        {/* Visual separator if a pending item is shown - allow if global edit mode is NOT active */}
        {pendingPastedImage && !isCreatingOutfit && !isLoading && !isGlobalEditModeActive && <View style={styles.separator} />}

        {/* Display the wardrobe list: always show if initial load complete and not actively loading overall. Edit mode will control item appearance. */}
        {isInitialLoadComplete && !isLoading && (
            <WardrobeList 
                wardrobeItems={wardrobeItems} 
                pendingPastedImage={pendingPastedImage} 
                isLoading={isLoading} 
                onDeleteItem={handleDeleteItem} // Pass the delete handler to WardrobeList
                // Outfit related props for WardrobeList
                isCreatingOutfit={isCreatingOutfit}
                currentOutfitSelection={currentOutfitSelection}
                onSelectItemForOutfit={handleSelectOutfitItem}
                // Pass global edit mode props
                isGlobalEditModeActive={isGlobalEditModeActive}
                onToggleGlobalEditMode={toggleGlobalEditMode}
            />
        )}

        {/* Display the Saved Outfits list: always show if initial load complete and not actively loading overall. Edit mode will control item appearance. */}
        {isInitialLoadComplete && !isLoading && (
            <>
                <View style={styles.separator} />
                <OutfitList 
                    savedOutfits={savedOutfits} 
                    onDeleteOutfit={handleDeleteOutfit} 
                    // Pass global edit mode props
                    isGlobalEditModeActive={isGlobalEditModeActive}
                    onToggleGlobalEditMode={toggleGlobalEditMode}
                />
            </>
        )}

        {/* Show a generic loading screen for initial data fetch if preferred */}
        {!isInitialLoadComplete && isLoading && (
            <View style={styles.fullScreenLoaderContainer}>
                <ActivityIndicator size="large" color={getColor('pinkBarbie', scheme)} />
                <ThemedText style={styles.loadingText}>Loading your wardrobe...</ThemedText>
            </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// Styles function
const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: getColor('bgScreen', scheme),
  },
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  title: { // Style for ThemedText type="title" will apply, this is for margin
    marginBottom: 24,
    textAlign: 'center', // Ensure title is centered if desired
  },
  mainActionsContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '90%',
    marginBottom: 16,
  },
  creationButtonsContainer: { // Added this style for the new View wrapper
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidthButton: { // Added for side-by-side buttons
    flex: 1, // Each button takes half the space
    marginHorizontal: 4, // Add some spacing between buttons
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20, // More playful
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 3, // Standard elevation
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8, // From theme example
    shadowRadius: 3,    // From theme example
  },
  actionButtonText: { // This style is applied to ThemedText, so colorToken prop is primary
    fontSize: 16,
    fontWeight: '600', // Ensure good weight
  },
  pasteButton: {
    backgroundColor: getColor('pinkBarbie', scheme),
  },
  createOutfitButton: {
    backgroundColor: getColor('pinkBarbie', scheme),
  },
  suggestOutfitButton: { // Using pinkRaspberry for variety
    backgroundColor: getColor('pinkRaspberry', scheme), 
  },
  cancelButton: {
    backgroundColor: getColor('pinkBlush', scheme), // Softer for cancel
    // Text color for cancelButton is now `textOnPinkRaspberry` (dark) by default, or `textPrimary` for `pinkBlush`
    // Ensure the ThemedText `colorToken` for cancel button text is appropriate
  },
  saveOutfitButton: {
    backgroundColor: getColor('pinkBarbie', scheme),
  },
  doneEditingButton: {
    backgroundColor: getColor('pinkBarbie', scheme),
  },
  disabledButton: {
    backgroundColor: getColor('textDisabled', scheme), // Use a disabled color token
    opacity: 0.7, // Keep opacity for visual cue
  },
  activityIndicator: {
    marginVertical: 16,
  },
  separator: {
    height: 1,
    width: '90%',
    backgroundColor: getColor('borderSubtle', scheme),
    marginVertical: 24,
    alignSelf: 'center',
  },
  fullScreenLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('bgScreen', scheme), // Ensure loader screen uses themed BG
  },
  loadingText: { // Style for ThemedText
    marginTop: 8,
  }
  // Ensure all other styles are defined if they were below line 250
});
