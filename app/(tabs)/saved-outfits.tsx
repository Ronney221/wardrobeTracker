import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { OutfitList } from '@/src/components/outfit/OutfitList';
import { getColor } from '@/src/constants/theme';
import { useWardrobeManager } from '@/src/context/WardrobeContext';

export default function SavedOutfitsScreen() {
  const {
    savedOutfits,
    isLoading, // To show loading indicator if outfits are being fetched
    isInitialLoadComplete,
    isGlobalEditModeActive,
    toggleGlobalEditMode,
    handleDeleteOutfit,
    wardrobeItems, // Get wardrobeItems from the hook
  } = useWardrobeManager();

  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const styles = getStyles(scheme, insets.bottom);

  if (isLoading && !isInitialLoadComplete) {
    return (
      <ThemedView style={styles.fullScreenLoaderContainer}>
        <ActivityIndicator size="large" color={getColor('pinkBarbie', scheme)} />
        <ThemedText colorToken="textSecondary" style={styles.loadingText}>Loading saved outfits...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ThemedView style={styles.container}>
        <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" colorToken="pinkRaspberry" style={styles.title}>Saved Outfits</ThemedText>
            {/* Global Edit Mode Toggle Button for Outfits */}
            {savedOutfits && savedOutfits.length > 0 && (
                 <TouchableOpacity 
                    style={[styles.button, styles.actionButton, isGlobalEditModeActive && styles.activeEditButton]} 
                    onPress={toggleGlobalEditMode} // This will toggle edit mode for outfits
                >
                    <FontAwesome name="edit" size={20} color={getColor(isGlobalEditModeActive ? 'textOnPinkBarbie' : 'textOnPinkBarbie', scheme)} />
                    <ThemedText colorToken={isGlobalEditModeActive ? 'textOnPinkBarbie' : 'textOnPinkBarbie'} style={styles.buttonText}>
                    {isGlobalEditModeActive ? "Done Editing" : "Edit Outfits"}
                    </ThemedText>
                </TouchableOpacity>
            )}
          </View>

          {savedOutfits && savedOutfits.length > 0 ? (
            <OutfitList
              savedOutfits={savedOutfits}
              onDeleteOutfit={handleDeleteOutfit}
              isGlobalEditModeActive={isGlobalEditModeActive}
              onToggleGlobalEditMode={toggleGlobalEditMode} // Pass this down if OutfitList items can individually toggle it (currently not the case)
              wardrobeItems={wardrobeItems} // Pass wardrobeItems to OutfitList
            />
          ) : (
            !isLoading && isInitialLoadComplete && (
              <View style={styles.emptyStateContainer}>
                <FontAwesome5 name="archive" size={50} color={getColor('textDisabled', scheme)} />
                <ThemedText style={styles.emptyStateText}>No saved outfits yet.</ThemedText>
                <ThemedText style={styles.emptyStateSubText}>Try creating some from your wardrobe!</ThemedText>
              </View>
            )
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const getStyles = (scheme: 'light' | 'dark', bottomInset: number) => StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: getColor('bgScreen', scheme),
  },
  container: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 8,
    flex: 1,
    width: '100%',
    paddingBottom: bottomInset, // Apply bottom inset for safe area
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'column', // Changed to column for title and button
    justifyContent: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Add some margin from the top
  },
  emptyStateText: {
    fontSize: 18,
    color: getColor('textSecondary', scheme),
    marginTop: 16,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: getColor('textDisabled', scheme),
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
   button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginVertical: 8, // Adjusted margin for vertical stacking
    elevation: 2, 
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    backgroundColor: getColor('pinkBarbie', scheme), // Default button color
  },
  actionButton: {
    // Specific styles for action buttons if different from general button
  },
  activeEditButton: {
    backgroundColor: getColor('pinkRaspberry', scheme),
  },
  buttonText: {
    marginLeft: 8,
    // color is set by colorToken in ThemedText
    fontSize: 14,
    fontWeight: '600', // A bit bolder
  },
}); 