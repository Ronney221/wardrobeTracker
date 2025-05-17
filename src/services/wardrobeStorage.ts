// src/services/wardrobeStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { WARDROBE_STORAGE_KEY } from '../constants/wardrobe'; // Import the correct storage key
import { WardrobeItems } from '../types/wardrobe'; // Import the WardrobeItems type

/**
 * Loads wardrobe items from AsyncStorage.
 * @returns A Promise that resolves to WardrobeItems or null if no items are found or an error occurs.
 */
export const loadWardrobeFromStorage = async (): Promise<WardrobeItems | null> => {
  try {
    // Attempt to get the stringified wardrobe data from AsyncStorage using the defined key
    const storedItems = await AsyncStorage.getItem(WARDROBE_STORAGE_KEY);
    // If data exists in storage (is not null)
    if (storedItems !== null) {
      // Parse the JSON string back into a WardrobeItems object and return it
      return JSON.parse(storedItems) as WardrobeItems;
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