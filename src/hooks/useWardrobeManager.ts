// src/hooks/useWardrobeManager.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { CLOTHING_CATEGORIES, OUTFIT_LOG_STORAGE_KEY, OUTFITS_STORAGE_KEY } from '../constants/wardrobe';
import { loadWardrobeFromStorage, saveWardrobeToStorage } from '../services/wardrobeStorage';
import { ClothingCategory, initialOutfitSelection, initialWardrobeState, Outfit, OutfitLogEntry, OutfitSelection, WardrobeItemData, WardrobeItems } from '../types/wardrobe';

export const useWardrobeManager = () => {
  // State for all categorized wardrobe items, initialized with the default structure
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItems>(initialWardrobeState);
  // State for the URI of an image pasted but not yet categorized/edited
  const [pendingPastedImage, setPendingPastedImage] = useState<string | null>(null);
  // State to indicate if an operation (pasting, editing, saving, loading) is in progress
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to indicate if the initial load from storage is complete
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(false);

  // useRef to track if the component has mounted to prevent saving on initial effect runs before data is loaded.
  const isMounted = useRef(false); 

  // --- Global Edit Mode State ---
  const [isGlobalEditModeActive, setIsGlobalEditModeActive] = useState<boolean>(false);

  // --- Outfit State ---
  const [isCreatingOutfit, setIsCreatingOutfit] = useState<boolean>(false);
  const [currentOutfitSelection, setCurrentOutfitSelection] = useState<OutfitSelection>(initialOutfitSelection);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);

  // New state for outfit log
  const [outfitLog, setOutfitLog] = useState<OutfitLogEntry[]>([]);

  // Load wardrobe data from storage when the hook is first used (component mounts)
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const loadedItems = await loadWardrobeFromStorage();
        if (loadedItems) setWardrobeItems(loadedItems);

        const storedOutfits = await AsyncStorage.getItem(OUTFITS_STORAGE_KEY);
        if (storedOutfits) setSavedOutfits(JSON.parse(storedOutfits));

        // Load outfit log
        const storedOutfitLog = await AsyncStorage.getItem(OUTFIT_LOG_STORAGE_KEY);
        if (storedOutfitLog) setOutfitLog(JSON.parse(storedOutfitLog));

      } catch (error) {
        console.error('Failed during initial data load:', error);
        Alert.alert('Error', 'Could not load all app data.');
      } finally {
        setIsLoading(false);
        setIsInitialLoadComplete(true);
        isMounted.current = true; // Set mounted after initial load
      }
    };
    loadInitialData();
  }, []);

  // Save wardrobe data to storage whenever wardrobeItems changes, but only after initial load is complete
  useEffect(() => {
    if (isMounted.current) {
      saveWardrobeToStorage(wardrobeItems);
    }
  }, [wardrobeItems]);

  // --- Save Saved Outfits ---
  useEffect(() => {
    if (isMounted.current) {
      AsyncStorage.setItem(OUTFITS_STORAGE_KEY, JSON.stringify(savedOutfits)).catch(error => {
        console.error('Failed to save outfits:', error);
        Alert.alert('Error', 'Could not save outfits.');
      });
    }
  }, [savedOutfits]);

  // Save outfit log
  useEffect(() => {
    if (isMounted.current) {
      AsyncStorage.setItem(OUTFIT_LOG_STORAGE_KEY, JSON.stringify(outfitLog)).catch(error => {
        console.error('Failed to save outfit log:', error);
        Alert.alert('Error', 'Could not save the outfit log.');
      });
    }
  }, [outfitLog]);

  // Callback function to handle pasting an image from the clipboard
  const handlePasteImage = useCallback(async () => {
    if (isCreatingOutfit || isGlobalEditModeActive) {
      Alert.alert("Action Disabled", "Please exit outfit creation or edit mode to paste an item.");
      return;
    }
    if (Platform.OS !== 'ios') {
      Alert.alert("Feature Info", "Pasting images from clipboard is best supported on iOS. Behavior on other platforms may vary.");
    }
    setIsLoading(true);
    try {
      const imageResult = await Clipboard.getImageAsync({ format: 'png' });
      if (imageResult && imageResult.data) {
        setPendingPastedImage(imageResult.data);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Alert.alert(
          'No Image Found',
          'Could not find an image on the clipboard, or permission to paste was denied.'
        );
      }
    } catch (error) {
      console.error('Failed to paste image:', error);
      Alert.alert('Error', 'Failed to paste image from clipboard.');
    } finally {
      setIsLoading(false);
    }
  }, [isCreatingOutfit, isGlobalEditModeActive]);

  // Callback function to handle categorizing the pending image
  const handleCategorizeImage = useCallback((category: ClothingCategory, name?: string) => {
    if (pendingPastedImage) {
      const newItem: WardrobeItemData = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15), // More unique ID
        uri: pendingPastedImage,
        name: name || undefined, // Ensure name is explicitly undefined if empty
      };

      setWardrobeItems(prevItems => ({
        ...prevItems,
        [category]: [newItem, ...(prevItems[category] || [])],
      }));
      setPendingPastedImage(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Categorized!', `Item added to ${category}${name ? ` as "${name}"` : ""}.`);
    }
  }, [pendingPastedImage]);

  // New function to handle deleting an item
  const handleDeleteItem = useCallback((category: ClothingCategory, itemIndex: number) => {
    // Confirmation dialog before deleting
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setWardrobeItems(prevItems => {
              // Get the current list of items for the specified category
              const itemsInCategory = prevItems[category] || [];
              // Filter out the item at the given index
              const updatedItemsInCategory = itemsInCategory.filter((_, index) => index !== itemIndex);
              // Return the new state with the updated category list
              const newWardrobeItems = {
                ...prevItems,
                [category]: updatedItemsInCategory,
              };
              saveWardrobeToStorage(newWardrobeItems);
              return newWardrobeItems;
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Deleted", "Item removed from your collection.");
          }
        }
      ]
    );
  }, []); // No dependencies needed as it uses setWardrobeItems updater form

  // --- Outfit Handler Functions ---
  const toggleOutfitCreationMode = useCallback(() => {
    if (isGlobalEditModeActive) {
      setIsGlobalEditModeActive(false); // Exit edit mode if starting/cancelling outfit creation
    }
    setIsCreatingOutfit(prev => {
      if (prev) { // If turning OFF outfit creation mode
        setCurrentOutfitSelection(initialOutfitSelection); // Clear current selection
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return !prev; // Toggle the mode
    });
  }, [currentOutfitSelection, isGlobalEditModeActive]);

  const handleSelectOutfitItem = useCallback((category: ClothingCategory, itemUri: string) => {
    if (!isCreatingOutfit) return;

    setCurrentOutfitSelection(prevSelection => {
      if (category === 'accessories') {
        const currentAccessories = prevSelection.accessories || [];
        const isAlreadySelected = currentAccessories.includes(itemUri);
        let newAccessories;
        if (isAlreadySelected) {
          newAccessories = currentAccessories.filter(uri => uri !== itemUri);
        } else {
          newAccessories = [...currentAccessories, itemUri];
        }
        return {
          ...prevSelection,
          accessories: newAccessories,
        };
      } else {
        // For single-selection categories (including new ones like bodywear, underwear)
        const currentSelectionForCategory = prevSelection[category as Exclude<ClothingCategory, 'accessories'>];
        const newSelectionForCategory = currentSelectionForCategory === itemUri ? null : itemUri;
        return {
          ...prevSelection,
          [category]: newSelectionForCategory,
        };
      }
    });
    Haptics.selectionAsync();
  }, [isCreatingOutfit]);

  const handleSaveCurrentOutfit = useCallback(() => {
    // Check if at least one item is selected (including accessories)
    const isAnySingleItemSelected = Object.entries(currentOutfitSelection)
      .filter(([key]) => key !== 'accessories')
      .some(([,uri]) => uri !== null && uri !== undefined);
    
    const accessoriesSelected = currentOutfitSelection.accessories && currentOutfitSelection.accessories.length > 0;

    if (!isAnySingleItemSelected && !accessoriesSelected) {
      Alert.alert("Empty Outfit", "Please select at least one item for the outfit.");
      return;
    }

    Alert.prompt(
      "Name Your Outfit",
      "Enter a name for this outfit:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (outfitName) => {
            if (!outfitName || outfitName.trim() === "") {
              Alert.alert("Invalid Name", "Outfit name cannot be empty.");
              return;
            }
            const newOutfit: Outfit = {
              id: Date.now().toString(),
              name: outfitName.trim(),
              // Explicitly type the selection before spreading for safety with new structure
              ...currentOutfitSelection as OutfitSelection,
              // Ensure accessories is an array or null, even if currentOutfitSelection.accessories is undefined
              accessories: currentOutfitSelection.accessories || [], 
            };
            setSavedOutfits(prevOutfits => [newOutfit, ...prevOutfits]); // Add to the beginning
            setCurrentOutfitSelection(initialOutfitSelection); // Reset selection
            setIsCreatingOutfit(false); // Exit outfit creation mode
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Outfit Saved!", `"${outfitName}" has been added to your outfits.`);
          },
        },
      ],
      "plain-text" // Prompt type
    );
  }, [currentOutfitSelection]); // Depends on the current selection

  const handleDeleteOutfit = useCallback((outfitId: string) => {
    setSavedOutfits(prevOutfits => prevOutfits.filter(outfit => outfit.id !== outfitId));
    // Confirmation Alert is now handled by the component calling this, if needed, or we can keep it here.
    // For now, let's assume the component handles confirmation just before calling this if in edit mode.
    saveWardrobeToStorage(wardrobeItems);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [wardrobeItems, saveWardrobeToStorage]);

  // --- Global Edit Mode Handler ---
  const toggleGlobalEditMode = useCallback(() => {
    setIsGlobalEditModeActive(prev => !prev);
    // When entering edit mode, ensure other modes are off
    if (!isGlobalEditModeActive) { // This condition is based on state *before* toggle
        if(isCreatingOutfit) {
            setIsCreatingOutfit(false);
            setCurrentOutfitSelection(initialOutfitSelection); // Also reset selection
        }
        if(pendingPastedImage) setPendingPastedImage(null); 
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isCreatingOutfit, pendingPastedImage, isGlobalEditModeActive]); 

  // --- Suggest Random Outfit Handler ---
  const handleSuggestRandomOutfit = useCallback(() => {
    const allCategoriesEmpty = CLOTHING_CATEGORIES.every(cat => {
      const items = wardrobeItems[cat as keyof WardrobeItems];
      return !items || items.length === 0;
    });

    if (allCategoriesEmpty) {
      Alert.alert("No Items", "Your wardrobe is empty. Add some items to get outfit suggestions.");
      return;
    }

    const randomSelection: OutfitSelection = JSON.parse(JSON.stringify(initialOutfitSelection)); // Deep copy initial state
    let itemsSelected = 0;

    CLOTHING_CATEGORIES.forEach(categoryKey => {
      const category = categoryKey as ClothingCategory;
      const itemsInCategory = wardrobeItems[category];

      if (itemsInCategory && itemsInCategory.length > 0) {
        const randomIndex = Math.floor(Math.random() * itemsInCategory.length);
        const selectedItem = itemsInCategory[randomIndex]; // This is WardrobeItemData

        if (selectedItem && selectedItem.uri) { // Ensure selectedItem and its URI exist
          if (category === 'accessories') {
            if (Math.random() > 0.5) { 
              randomSelection.accessories = [selectedItem.uri]; // Use .uri
              itemsSelected++;
            }
          } else {
            (randomSelection[category as Exclude<ClothingCategory, 'accessories'>]) = selectedItem.uri; // Use .uri
            itemsSelected++;
          }
        }
      }
    });

    if (itemsSelected === 0) {
        // This case should ideally be caught by allCategoriesEmpty, but as a fallback:
        Alert.alert("No Items", "Could not select any items for a suggestion. Try adding more clothes!");
        return;
    }

    setCurrentOutfitSelection(randomSelection);
    setIsCreatingOutfit(true); // Enter outfit creation mode with the suggestion
    if (isGlobalEditModeActive) {
      setIsGlobalEditModeActive(false); // Ensure global edit mode is off
    }
    if (pendingPastedImage) {
        setPendingPastedImage(null); // Clear any pending item
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Outfit Suggested!", "Here's a random outfit suggestion. You can modify and save it.");

  }, [wardrobeItems, isGlobalEditModeActive, pendingPastedImage]); // Add dependencies

  // Function to log an outfit for a specific date
  const logOutfitForDate = useCallback((outfitId: string, outfitName: string | undefined, date: string) => {
    setOutfitLog(prevLog => {
      const newEntry: OutfitLogEntry = { date, outfitId, outfitName };
      // Remove any existing entry for this date, then add the new one
      const filteredLog = prevLog.filter(entry => entry.date !== date);
      return [...filteredLog, newEntry];
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Outfit Logged", `${outfitName || 'Outfit'} marked for ${date}.`);
  }, []);

  // Return the state variables and handler functions to be used by the component
  return {
    wardrobeItems,
    pendingPastedImage,
    isLoading,
    isInitialLoadComplete,
    handlePasteImage,
    handleCategorizeImage,
    handleDeleteItem, // Expose the new delete handler
    // Outfit related exports
    isCreatingOutfit,
    currentOutfitSelection,
    savedOutfits,
    toggleOutfitCreationMode,
    handleSelectOutfitItem,
    handleSaveCurrentOutfit,
    handleDeleteOutfit, // Expose the new outfit delete handler
    // Global Edit Mode
    isGlobalEditModeActive,
    toggleGlobalEditMode,
    handleSuggestRandomOutfit, // Expose the new handler
    // Calendar feature exports
    outfitLog,
    logOutfitForDate,
  };
}; 