// src/hooks/useWardrobeManager.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { CLOTHING_CATEGORIES, OUTFIT_LOG_STORAGE_KEY, OUTFITS_STORAGE_KEY } from '../constants/wardrobe';
import { loadUserSubcategories, saveUserSubcategories, UserSubcategories } from '../services/subcategoryService'; // Import subcategory service
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

  // New state for user subcategories
  const [userSubcategories, setUserSubcategories] = useState<UserSubcategories | null>(null);

  // Load wardrobe data from storage when the hook is first used (component mounts)
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const loadedItems = await loadWardrobeFromStorage();
        if (loadedItems) setWardrobeItems(loadedItems);

        const storedOutfits = await AsyncStorage.getItem(OUTFITS_STORAGE_KEY);
        if (storedOutfits) setSavedOutfits(JSON.parse(storedOutfits));
        
        const loadedSubcategories = await loadUserSubcategories(); // Load subcategories
        setUserSubcategories(loadedSubcategories); // Set subcategories state

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
  const handleCategorizeImage = useCallback((category: ClothingCategory, name?: string, subcategory?: string) => {
    if (pendingPastedImage) {
      const newItem: WardrobeItemData = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
        uri: pendingPastedImage,
        name: name || undefined,
        subcategory: subcategory || undefined, // Save subcategory
      };

      setWardrobeItems(prevItems => ({
        ...prevItems,
        [category]: [newItem, ...(prevItems[category] || [])],
      }));
      setPendingPastedImage(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      let alertMessage = `Item added to ${category}`;
      if (name) alertMessage += ` as "${name}"`;
      if (subcategory) alertMessage += ` (Subcategory: ${subcategory})`;
      alertMessage += ".";
      Alert.alert('Categorized!', alertMessage);
    }
  }, [pendingPastedImage]);

  // Updated function to handle deleting an item by ID
  const handleDeleteItem = useCallback((category: ClothingCategory, itemId: string) => {
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
              const itemsInCategory = prevItems[category] || [];
              // Filter out the item by its ID
              const updatedItemsInCategory = itemsInCategory.filter(item => item.id !== itemId);
              const newWardrobeItems = {
                ...prevItems,
                [category]: updatedItemsInCategory,
              };
              // saveWardrobeToStorage(newWardrobeItems); // Save is handled by useEffect on wardrobeItems
              return newWardrobeItems;
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Deleted", "Item removed from your collection.");
            // Also remove from any saved outfits if it was part of one
            setSavedOutfits(prevOutfits => 
              prevOutfits.map(outfit => {
                const updatedOutfit = { ...outfit };
                let outfitModified = false;
                if (Array.isArray(outfit[category]) && (outfit[category] as string[]).includes(itemId)) {
                  updatedOutfit[category] = (outfit[category] as string[]).filter(id => id !== itemId);
                  outfitModified = true;
                }
                return outfitModified ? updatedOutfit : outfit;
              }).filter(outfit => {
                // Remove outfit if it becomes empty after deleting an item
                // (Optional: or keep it and let user decide later)
                const hasItems = CLOTHING_CATEGORIES.some(cat => 
                  Array.isArray(outfit[cat]) && (outfit[cat] as string[]).length > 0
                );
                return hasItems;
              })
            );

          }
        }
      ]
    );
  }, []); // No explicit dependencies, setWardrobeItems and setSavedOutfits use functional updates

  // --- Outfit Handler Functions ---
  const toggleOutfitCreationMode = useCallback(() => {
    setIsCreatingOutfit(prev => !prev);
    if (isGlobalEditModeActive) {
      setIsGlobalEditModeActive(false); // Turn off global edit mode when toggling outfit creation
    }
    // Reset current outfit selection when exiting outfit creation mode
    if (isCreatingOutfit) { // Note: this checks the state *before* toggle, so if it was true, it means we are exiting
      setCurrentOutfitSelection(initialOutfitSelection);
    }
  }, [isGlobalEditModeActive, isCreatingOutfit]);

  const handleSelectItemForOutfit = useCallback((category: ClothingCategory, itemId: string) => {
    if (!isCreatingOutfit) return;

    setCurrentOutfitSelection(prevSelection => {
      // Ensure we're working with an array, defaulting to empty if undefined or null
      const currentSelectedIds = Array.isArray(prevSelection[category]) ? prevSelection[category] as string[] : [];
      let newSelectedIds: string[];

      if (currentSelectedIds.includes(itemId)) {
        // Item is already selected, remove it
        newSelectedIds = currentSelectedIds.filter(id => id !== itemId);
      } else {
        // Item is not selected, add it
        newSelectedIds = [...currentSelectedIds, itemId];
      }
      
      return {
        ...prevSelection,
        [category]: newSelectedIds, // Store the array (can be empty, matching initialOutfitSelection)
      };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isCreatingOutfit]);

  const handleSaveCurrentOutfit = useCallback(() => {
    // Updated check for empty outfit: at least one item in any category array
    const isAnyItemSelected = Object.values(currentOutfitSelection).some(
      (selectedIds) => Array.isArray(selectedIds) && selectedIds.length > 0
    );

    if (!isAnyItemSelected) {
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
              ...(currentOutfitSelection as OutfitSelection), // Spread the selection which now matches Outfit structure
            };

            setSavedOutfits(prevOutfits => [...prevOutfits, newOutfit]);
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
    if (Object.values(wardrobeItems).every(categoryItems => categoryItems.length === 0)) {
      Alert.alert("Empty Wardrobe", "Add some items to your wardrobe to get suggestions!");
      return;
    }

    const randomSelection: OutfitSelection = { ...initialOutfitSelection }; // Initialize with empty arrays
    let itemsSelected = 0;

    CLOTHING_CATEGORIES.forEach(category => {
      const itemsInCategory = wardrobeItems[category];
      if (itemsInCategory && itemsInCategory.length > 0) {
        const randomIndex = Math.floor(Math.random() * itemsInCategory.length);
        const selectedItem = itemsInCategory[randomIndex];
        if (selectedItem) {
          // All categories now expect string[], so assign [selectedItem.id]
          randomSelection[category] = [selectedItem.id]; 
          itemsSelected++;
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

  // Function to add a new subcategory to a main category
  const handleAddSubcategory = useCallback(async (mainCategory: ClothingCategory, newSubcategoryName: string) => {
    if (!newSubcategoryName || newSubcategoryName.trim() === "") {
      Alert.alert("Invalid Name", "Subcategory name cannot be empty.");
      return false;
    }
    const trimmedName = newSubcategoryName.trim();

    setUserSubcategories(prev => {
      const currentSubsForMainCat = prev?.[mainCategory] || [];
      if (currentSubsForMainCat.some(sub => sub.toLowerCase() === trimmedName.toLowerCase())) {
        Alert.alert("Duplicate", `Subcategory "${trimmedName}" already exists for ${mainCategory}.`);
        return prev; // Return previous state if duplicate
      }
      const updatedSubsForMainCat = [...currentSubsForMainCat, trimmedName].sort(); // Add and sort
      const newState = {
        ...prev,
        [mainCategory]: updatedSubsForMainCat,
      };
      saveUserSubcategories(newState); // Save to AsyncStorage
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Subcategory Added", `"${trimmedName}" added to ${mainCategory}.`);
      return newState;
    });
    return true; // Indicate success for UI purposes if needed
  }, []);

  // Return the state variables and handler functions to be used by the component
  return {
    wardrobeItems,
    pendingPastedImage,
    setPendingPastedImage,
    isLoading,
    isInitialLoadComplete,
    handlePasteImage,
    handleCategorizeImage,
    handleDeleteItem,
    isCreatingOutfit,
    setIsCreatingOutfit,
    currentOutfitSelection,
    handleSelectItemForOutfit,
    handleSaveCurrentOutfit,
    savedOutfits,
    handleDeleteOutfit,
    isGlobalEditModeActive,
    toggleGlobalEditMode,
    handleSuggestRandomOutfit,
    outfitLog,
    logOutfitForDate,
    userSubcategories,
    handleAddSubcategory,
    toggleOutfitCreationMode,
  };
}; 