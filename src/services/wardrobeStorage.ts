// src/services/wardrobeStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CLOTHING_CATEGORIES as NEW_CLOTHING_CATEGORIES, WARDROBE_STORAGE_KEY } from '../constants/wardrobe';
import { ClothingCategory, initialWardrobeState, WardrobeItemData, WardrobeItems } from '../types/wardrobe';

// Helper to generate a unique ID for items during migration if they don't have one
const generateMigrationId = (cat: string, idx: number) => `${cat}-${idx}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Loads wardrobe items from AsyncStorage and transforms old data if necessary.
 * @returns A Promise that resolves to WardrobeItems or null if no items are found or an error occurs.
 */
export const loadWardrobeFromStorage = async (): Promise<WardrobeItems | null> => {
  try {
    const storedItems = await AsyncStorage.getItem(WARDROBE_STORAGE_KEY);
    if (storedItems !== null) {
      const parsedJson = JSON.parse(storedItems);
      if (!parsedJson) return initialWardrobeState; // Handle empty/invalid storage

      // Initialize with new structure to ensure all new categories exist
      const migratedItems: WardrobeItems = JSON.parse(JSON.stringify(initialWardrobeState)); 
      let needsMajorMigration = false;
      let alertMessages: string[] = [];

      // Check for old category keys or old item formats
      const oldCategoryKeys = ['hat', 'shirt', 'jacket', 'pants', 'skirt', 'bodywear', 'underwear'];
      for (const oldCat of oldCategoryKeys) {
        if (parsedJson.hasOwnProperty(oldCat)) {
          needsMajorMigration = true;
          break;
        }
      }
      if (!needsMajorMigration) { // If no old keys, check format of items in new keys
        for (const categoryKey of NEW_CLOTHING_CATEGORIES) {
            const items = parsedJson[categoryKey as keyof WardrobeItems];
            if (items && items.length > 0 && typeof items[0] === 'string') {
                needsMajorMigration = true; // Old string URI format exists
                break;
            }
        }
      }

      if (needsMajorMigration) {
        console.log("Performing major wardrobe data migration...");
        alertMessages.push("Your wardrobe data is being updated to support new categories and subcategories.");

        const processCategory = (oldCatItems: any[], newCat: ClothingCategory, defaultSubcategory?: string) => {
          if (!Array.isArray(oldCatItems)) return;
          oldCatItems.forEach((item, index) => {
            let newItemData: WardrobeItemData;
            if (typeof item === 'string') { // Is an old URI string
              newItemData = {
                id: generateMigrationId(newCat, migratedItems[newCat].length + index),
                uri: item,
                subcategory: defaultSubcategory,
              };
            } else if (typeof item === 'object' && item !== null && item.uri) { // Is a WardrobeItemData-like object
              newItemData = {
                ...item, // Spread to keep existing id, uri, name
                id: item.id || generateMigrationId(newCat, migratedItems[newCat].length + index),
                subcategory: item.subcategory || defaultSubcategory,
              };
            } else {
              return; // Skip invalid item
            }
            migratedItems[newCat].push(newItemData);
          });
        };

        // Migration logic
        if (parsedJson.shirt) processCategory(parsedJson.shirt, 'top');
        if (parsedJson.pants) processCategory(parsedJson.pants, 'bottom', 'pants'); // Default subcategory
        if (parsedJson.jacket) processCategory(parsedJson.jacket, 'outerwear', 'jacket');
        if (parsedJson.hat) processCategory(parsedJson.hat, 'accessories', 'hat');
        if (parsedJson.skirt) processCategory(parsedJson.skirt, 'bottom', 'skirt');
        // bodywear and underwear are discarded

        // Handle items that might already be in new categories but in old string format
        for (const newCat of NEW_CLOTHING_CATEGORIES) {
            if (parsedJson[newCat] && !migratedItems[newCat].length) { // If not processed by old key logic
                const items = parsedJson[newCat];
                if (items.length > 0 && typeof items[0] === 'string') {
                    console.log(`Migrating string URIs in category: ${newCat}`);
                    migratedItems[newCat] = []; // Clear if it was just copied from initialWardrobeState potentially
                    processCategory(items, newCat);
                }
            }
        }

        // Preserve items already in new categories and new format if not touched by above
        for (const key of Object.keys(initialWardrobeState)) {
            const cat = key as ClothingCategory;
            if (parsedJson[cat] && !needsMajorMigration) { // if not already handled by major migration
                 // and if parsedJson[cat] is already WardrobeItemData[], copy it over
                if (Array.isArray(parsedJson[cat]) && (parsedJson[cat].length === 0 || (typeof parsedJson[cat][0] === 'object' && parsedJson[cat][0].uri))) {
                    migratedItems[cat] = parsedJson[cat];
                }
            }
        }

      } else {
        // No major structural changes (old categories gone), but could still be old string URIs in current cats
        // This case is now handled by the extended needsMajorMigration check above.
        // So, if not needsMajorMigration, assume it's in the correct WardrobeItemData format.
        console.log("Wardrobe data is already in or close to the new format. Applying minor checks.");
        // Ensure all new categories exist, copy from parsedJson if valid
        for (const key of NEW_CLOTHING_CATEGORIES) {
            const cat = key as ClothingCategory;
            if (parsedJson.hasOwnProperty(cat) && Array.isArray(parsedJson[cat])) {
                migratedItems[cat] = parsedJson[cat].map((item: any, index: number) => {
                    if (typeof item === 'string') { // Should have been caught by needsMajorMigration
                        return { id: generateMigrationId(cat, index), uri: item };
                    }
                    return { ...item, id: item.id || generateMigrationId(cat, index) }; // Ensure ID
                });
            }
        }
      }
      
      if (alertMessages.length > 0) {
        Alert.alert("Data Update", alertMessages.join('\n'));
      }
      return migratedItems;
    }
    return initialWardrobeState; // Nothing in storage, return fresh initial state
  } catch (error) {
    console.error('Failed to load or migrate wardrobe items from storage:', error);
    Alert.alert('Storage Error', 'Could not load saved wardrobe items. Returning to a default state.');
    return initialWardrobeState; // Return default state on error
  }
};

/**
 * Saves wardrobe items to AsyncStorage.
 * @param items The WardrobeItems object to save.
 * @returns A Promise that resolves to void.
 */
export const saveWardrobeToStorage = async (items: WardrobeItems): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(WARDROBE_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Failed to save wardrobe items to storage:', error);
    Alert.alert('Storage Error', 'Could not save wardrobe items. Please try again.');
  }
}; 