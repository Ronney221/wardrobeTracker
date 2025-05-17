import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import the custom hook that manages all wardrobe logic
import { useWardrobeManager } from '../../src/hooks/useWardrobeManager';
// Import the UI components we created
import { OutfitList } from '../../src/components/outfit/OutfitList';
import PendingItemView from '../../src/components/wardrobe/PendingItemView';
import WardrobeList from '../../src/components/wardrobe/WardrobeList';

// Main functional component for the Wardrobe Screen
export default function WardrobeScreen() {
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
        <Text style={styles.title}>My Wardrobe</Text>

        {/* Main action buttons area */}
        <View style={styles.mainActionsContainer}>
          {isGlobalEditModeActive ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.doneEditingButton]} 
              onPress={toggleGlobalEditMode} 
            >
              <Text style={styles.actionButtonText}>Done Editing</Text>
            </TouchableOpacity>
          ) : (
            <>
              {!isCreatingOutfit && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.pasteButton, isLoading && styles.disabledButton]} 
                  onPress={handlePasteImage} 
                  disabled={isLoading}
                >
                  <Text style={styles.actionButtonText}>Paste Clothing Item</Text>
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
                  <Text style={styles.actionButtonText}>
                    {isCreatingOutfit ? "Cancel Creation" : "Create Outfit"} 
                  </Text>
                </TouchableOpacity>

                {!isCreatingOutfit && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.halfWidthButton, styles.suggestOutfitButton, isLoading && styles.disabledButton]} 
                    onPress={handleSuggestRandomOutfit} 
                    disabled={isLoading}
                  >
                    <Text style={styles.actionButtonText}>Suggest Outfit</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isCreatingOutfit && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveOutfitButton, isLoading && styles.disabledButton]} 
                  onPress={handleSaveCurrentOutfit} 
                  disabled={isLoading}
                >
                  <Text style={styles.actionButtonText}>Save Outfit</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Loading indicator, shown when isLoading is true and not in global edit mode (to avoid overlap with done button) */}
        {isLoading && !isGlobalEditModeActive && <ActivityIndicator size="large" color="#007AFF" style={styles.activityIndicator} />}

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
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading your wardrobe...</Text>
            </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for the main WardrobeScreen (can be further refined or use a global theme)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2C3E50',
  },
  mainActionsContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '90%',
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pasteButton: {
    backgroundColor: '#007AFF',
  },
  createOutfitButton: {
    backgroundColor: '#007AFF',
  },
  suggestOutfitButton: {
    backgroundColor: '#FFA500',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
  },
  saveOutfitButton: {
    backgroundColor: '#007AFF',
  },
  doneEditingButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    opacity: 0.7,
  },
  activityIndicator: {
    marginVertical: 16,
  },
  separator: {
    height: 1,
    width: '90%',
    backgroundColor: '#BDC3C7',
    marginVertical: 24,
    alignSelf: 'center',
  },
  fullScreenLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#34495E'
  },
  creationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidthButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
