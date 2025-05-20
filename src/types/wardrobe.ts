// src/types/wardrobe.ts

// Import CLOTHING_CATEGORIES to derive the ClothingCategory type
// This creates a dependency, so ensure constants are defined in a way that this can be resolved.
// Alternatively, if CLOTHING_CATEGORIES is primarily used for runtime logic and this is just for type safety,
// you could redefine the literal types here or import from a constants file.

// Define a TypeScript type for a single clothing category based on the constant array
// typeof CLOTHING_CATEGORIES[number] creates a union type of all possible values in CLOTHING_CATEGORIES
export type ClothingCategory = 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessories';

// Define the structure for an individual wardrobe item
export interface WardrobeItemData {
  id: string; // Unique identifier for the item
  uri: string; // Image URI
  name?: string; // Optional user-defined name
  subcategory?: string; // Added optional subcategory
}

// Define the structure for our wardrobe items using a TypeScript interface
// Each category will hold an array of WardrobeItemData objects
export interface WardrobeItems {
  top: WardrobeItemData[];
  bottom: WardrobeItemData[];
  outerwear: WardrobeItemData[];
  shoes: WardrobeItemData[];
  accessories: WardrobeItemData[];
  // hat, jacket, skirt fields are removed
}

// Define the initial state structure for the wardrobe, ensuring all categories are present with empty arrays
export const initialWardrobeState: WardrobeItems = {
  top: [],
  bottom: [],
  outerwear: [],
  shoes: [],
  accessories: [],
  // hat, jacket, skirt fields are removed
};

// --- Outfit Types ---

// Represents the items selected for a single outfit.
export interface Outfit {
  id: string;
  name: string;
  createdAt: string; // Added for sorting by creation date
  notes?: string; 
  top?: string[] | null;        // Changed from string | null, now optional
  bottom?: string[] | null;    // Changed from string | null, now optional
  outerwear?: string[] | null; // Changed from string | null, now optional
  shoes?: string[] | null;     // Changed from string | null, now optional
  accessories?: string[] | null; // Was already string[] | null, now optional for consistency
}

// For selecting items for an outfit
export type OutfitSelection = {
  // All categories are now optional and can hold an array of item IDs or null.
  [K in ClothingCategory]?: string[] | null;
};

// New type for logging when an outfit was worn
export interface OutfitLogEntry {
  date: string; // YYYY-MM-DD format
  outfitId: string;
  outfitName?: string; // Denormalized for easier display in logs/calendar, optional
}

// Initial state for an outfit selection process
export const initialOutfitSelection: OutfitSelection = {
  top: [], // Initialize with empty arrays
  bottom: [],
  outerwear: [],
  shoes: [],
  accessories: [], 
}; 

// Type for storing user-defined subcategories
export type UserSubcategories = {
  [category in ClothingCategory]?: string[];
};

// Initial state for subcategories, can be empty or pre-populated with defaults
export const initialUserSubcategories: UserSubcategories = {
  top: [],
  bottom: [],
  outerwear: [],
  shoes: [],
  accessories: [],
}; 