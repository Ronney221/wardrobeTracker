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

// Import our theme helpers
import { ThemedText } from '@/components/ThemedText'; // Import ThemedText
import { ThemedView } from '@/components/ThemedView';
import { getColor } from '@/src/constants/theme'; // Adjusted path

// Import the custom hook that manages all wardrobe logic
import { useWardrobeManager } from '@/src/hooks/useWardrobeManager'; // Ensure this path is correct based on tsconfig
// Import the UI components we created
import { OutfitList } from '@/src/components/outfit/OutfitList'; // Ensure this path is correct
import PendingItemView from '@/src/components/wardrobe/PendingItemView'; // Ensure this path is correct
import WardrobeList from '@/src/components/wardrobe/WardrobeList'; // Ensure this path is correct
import { CLOTHING_CATEGORIES } from '@/src/constants/wardrobe';

// Main functional component for the Wardrobe Screen
export default function WardrobeScreen() {
  const {
    wardrobeItems,
    currentOutfitSelection,
    savedOutfits,
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
    handleDeleteOutfit,
    handleDeleteItem,
    handleSuggestRandomOutfit,
    userSubcategories,
    handleAddSubcategory,
    isCreatingOutfit,
    setIsCreatingOutfit,
    toggleOutfitCreationMode,
  } = useWardrobeManager();

  const scheme = useColorScheme() ?? 'light';
  const styles = getStyles(scheme);

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
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                <ThemedText type="subtitle" colorToken="pinkRaspberry" style={styles.subHeader}>
                  Create New Outfit
                </ThemedText>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.button, styles.saveOutfitButton]} 
                    onPress={handleSaveCurrentOutfit} 
                    disabled={Object.values(currentOutfitSelection).every(item => item === null || (Array.isArray(item) && item.length === 0))}
                  >
                    <FontAwesome name="save" size={20} color={getColor('textOnPinkBarbie', scheme)} />
                    <ThemedText colorToken="textOnPinkBarbie" style={styles.buttonText}>Save Outfit</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.suggestButton]} onPress={handleSuggestRandomOutfit}>
                      <FontAwesome name="random" size={20} color={getColor('textOnPinkBarbie', scheme)} />
                      <ThemedText style={styles.buttonText} colorToken="textOnPinkBarbie">Suggest Random</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {showMainWardrobeView && wardrobeItems && (
              <WardrobeList
                wardrobeItems={wardrobeItems}
                onDeleteItem={handleDeleteItem}
                isCreatingOutfit={isCreatingOutfit}
                currentOutfitSelection={currentOutfitSelection}
                onSelectItemForOutfit={handleSelectItemForOutfit}
                isGlobalEditModeActive={isGlobalEditModeActive} 
                onToggleGlobalEditMode={toggleGlobalEditMode}
                pendingPastedImage={null}
                isLoading={isLoading}
              />
            )}

            {showMainWardrobeView && <View style={styles.separator} />}

            {showMainWardrobeView && savedOutfits && (
              <OutfitList
                savedOutfits={savedOutfits}
                onDeleteOutfit={handleDeleteOutfit}
                isGlobalEditModeActive={isGlobalEditModeActive}
                onToggleGlobalEditMode={toggleGlobalEditMode} 
              />
            )}
          </ScrollView>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

// Styles function
const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
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
    paddingVertical: 16,
    paddingHorizontal: 8, 
    flexGrow: 1,
    backgroundColor: getColor('bgScreen', scheme),
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
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  },
  actionButton: {
    backgroundColor: getColor('buttonPrimary', scheme),
  },
  activeEditButton: {
    backgroundColor: getColor('pinkRaspberry', scheme), // Darker when active
  },
  saveOutfitButton: {
    backgroundColor: getColor('buttonPrimary', scheme),
  },
   suggestButton: {
    backgroundColor: getColor('buttonSecondary', scheme),
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  outfitCreationContainer: {
    width: '100%',
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
    borderRadius: 8,
    backgroundColor: getColor('bgCard', scheme),
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
    backgroundColor: getColor('bgScreen', scheme),
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
});