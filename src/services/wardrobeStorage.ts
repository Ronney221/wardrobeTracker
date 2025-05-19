// src/services/wardrobeStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { WARDROBE_STORAGE_KEY } from '../constants/wardrobe'; // Import the correct storage key
import { WardrobeItems } from '../types/wardrobe'; // Import the WardrobeItems and WardrobeItemData types

/**
 * Loads wardrobe items from AsyncStorage and transforms old data if necessary.
 * @returns A Promise that resolves to WardrobeItems or null if no items are found or an error occurs.
 */
export const loadWardrobeFromStorage = async (): Promise<WardrobeItems | null> => {
  try {
    // Attempt to get the stringified wardrobe data from AsyncStorage using the defined key
    const storedItems = await AsyncStorage.getItem(WARDROBE_STORAGE_KEY);
    // If data exists in storage (is not null)
    if (storedItems !== null) {
      const parsedJson = JSON.parse(storedItems);
      // Check if migration is needed (e.g., by checking the structure of the first item in any category)
      // This is a simple check; more complex checks might be needed for more intricate migrations.
      let needsMigration = false;
      if (parsedJson) {
        for (const categoryKey in parsedJson) {
          if (Object.prototype.hasOwnProperty.call(parsedJson, categoryKey)) {
            const categoryItems = parsedJson[categoryKey];
            if (Array.isArray(categoryItems) && categoryItems.length > 0 && typeof categoryItems[0] === 'string') {
              needsMigration = true;
              break;
            }
            // If it's already an object, assume it's WardrobeItemData (or empty array)
            if (Array.isArray(categoryItems) && categoryItems.length > 0 && typeof categoryItems[0] === 'object' && categoryItems[0] !== null && 'uri' in categoryItems[0]) {
              needsMigration = false; // Already new format
              break;
            }
          }
        }
      }

      if (needsMigration) {
        console.log("Migrating old wardrobe data to new format...");
        const migratedItems: WardrobeItems = {} as WardrobeItems;
        for (const categoryKey in parsedJson) {
          if (Object.prototype.hasOwnProperty.call(parsedJson, categoryKey)) {
            const oldCategoryItems = parsedJson[categoryKey] as string[];
            migratedItems[categoryKey as keyof WardrobeItems] = oldCategoryItems.map((uri, index) => ({
              id: `${categoryKey}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              uri: uri,
              // name: undefined, // name will be undefined by default
            }));
          }
        }
        Alert.alert("Data Updated", "Your wardrobe items have been updated to a new format. Any new items will now support names!");
        return migratedItems;
      } else {
        // If no migration needed, or already new format, return as is (assuming it matches WardrobeItems)
        return parsedJson as WardrobeItems;
      }
    }
    // If no data is found, return null
    return null;
  } catch (error) {
    // Log any error encountered during the loading process
    console.error('Failed to load wardrobe items from storage:', error);
    // Inform the user about the failure to load data
    Alert.alert('Storage Error', 'Could not load saved wardrobe items. Please restart the app.');
    // Return null in case of an error
    return null;
  }
};

/**
 * Saves wardrobe items to AsyncStorage.
 * @param items The WardrobeItems object to save.
 * @returns A Promise that resolves to void.
 */
export const saveWardrobeToStorage = async (items: WardrobeItems): Promise<void> => {
  try {
    // Stringify the WardrobeItems object to a JSON string
    const jsonValue = JSON.stringify(items);
    // Save the JSON string to AsyncStorage using the defined key
    await AsyncStorage.setItem(WARDROBE_STORAGE_KEY, jsonValue);
  } catch (error) {
    // Log any error encountered during the saving process
    console.error('Failed to save wardrobe items to storage:', error);
    // Inform the user about the failure to save data
    Alert.alert('Storage Error', 'Could not save wardrobe items. Please try again.');
  }
}; 