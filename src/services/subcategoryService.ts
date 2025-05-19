import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { ClothingCategory } from '../types/wardrobe'; // Assuming ClothingCategory is defined here

export type UserSubcategories = Partial<Record<ClothingCategory, string[]>>;

const SUBCATEGORIES_STORAGE_KEY = 'UserSubcategories';

// Pre-populated default subcategories
const defaultSubcategories: UserSubcategories = {
  top: ['T-Shirt', 'Blouse', 'Sweater', 'Tank Top', 'Dress Shirt'],
  bottom: ['Jeans', 'Pants', 'Shorts', 'Skirt', 'Leggings'],
  outerwear: ['Jacket', 'Coat', 'Hoodie', 'Blazer', 'Vest'],
  shoes: ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Dress Shoes'],
  accessories: ['Hat', 'Scarf', 'Belt', 'Jewelry', 'Bag', 'Tie', 'Sunglasses'],
};

/**
 * Loads user-defined subcategories from AsyncStorage.
 * If no subcategories are found, it initializes with defaults.
 * @returns A Promise that resolves to UserSubcategories.
 */
export const loadUserSubcategories = async (): Promise<UserSubcategories> => {
  try {
    const storedSubcategories = await AsyncStorage.getItem(SUBCATEGORIES_STORAGE_KEY);
    if (storedSubcategories !== null) {
      const parsed = JSON.parse(storedSubcategories);
      // Basic validation: ensure it's an object
      if (typeof parsed === 'object' && parsed !== null) {
        // Ensure all main categories have at least an empty array if not present
        const completeSubcategories: UserSubcategories = { ...defaultSubcategories };
        for (const key in parsed) {
            if (Object.prototype.hasOwnProperty.call(parsed, key)) {
                completeSubcategories[key as ClothingCategory] = Array.isArray(parsed[key]) ? parsed[key] : [];
            }
        }
        return completeSubcategories;
      }
      // If stored data is invalid, fall back to defaults
      console.warn('Invalid subcategory data found in storage, falling back to defaults.');
      await AsyncStorage.setItem(SUBCATEGORIES_STORAGE_KEY, JSON.stringify(defaultSubcategories));
      return defaultSubcategories;
    }
    // No stored subcategories, initialize with defaults
    await AsyncStorage.setItem(SUBCATEGORIES_STORAGE_KEY, JSON.stringify(defaultSubcategories));
    return defaultSubcategories;
  } catch (error) {
    console.error('Failed to load subcategories from storage:', error);
    Alert.alert('Subcategory Error', 'Could not load custom subcategories. Using defaults.');
    // Attempt to save defaults if load failed catastrophically before any save
    try {
        await AsyncStorage.setItem(SUBCATEGORIES_STORAGE_KEY, JSON.stringify(defaultSubcategories));
    } catch (saveError) {
        console.error('Failed to save default subcategories after load error:', saveError);
    }
    return defaultSubcategories;
  }
};

/**
 * Saves user-defined subcategories to AsyncStorage.
 * @param subcategories The UserSubcategories object to save.
 * @returns A Promise that resolves to void.
 */
export const saveUserSubcategories = async (subcategories: UserSubcategories): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(subcategories);
    await AsyncStorage.setItem(SUBCATEGORIES_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Failed to save subcategories to storage:', error);
    Alert.alert('Subcategory Error', 'Could not save custom subcategories.');
  }
}; 