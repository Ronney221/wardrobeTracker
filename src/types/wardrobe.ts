// src/types/wardrobe.ts

// Import CLOTHING_CATEGORIES to derive the ClothingCategory type
// This creates a dependency, so ensure constants are defined in a way that this can be resolved.
// Alternatively, if CLOTHING_CATEGORIES is primarily used for runtime logic and this is just for type safety,
// you could redefine the literal types here or import from a constants file.

// Define a TypeScript type for a single clothing category based on the constant array
// typeof CLOTHING_CATEGORIES[number] creates a union type of all possible values in CLOTHING_CATEGORIES
export type ClothingCategory = 'hat' | 'top' | 'jacket' | 'bottom' | 'skirt' | 'shoes' | 'accessories';

// Define the structure for an individual wardrobe item
export interface WardrobeItemData {
  id: string; // Unique identifier for the item
  uri: string; // Image URI
  name?: string; // Optional user-defined name
}

// Define the structure for our wardrobe items using a TypeScript interface
// Each category will hold an array of WardrobeItemData objects
export interface WardrobeItems {
  hat: WardrobeItemData[];
  top: WardrobeItemData[];
  jacket: WardrobeItemData[];
  bottom: WardrobeItemData[];
  skirt: WardrobeItemData[];
  shoes: WardrobeItemData[];
  accessories: WardrobeItemData[];
}

// Define the initial state structure for the wardrobe, ensuring all categories are present with empty arrays
export const initialWardrobeState: WardrobeItems = {
  hat: [],
  top: [],
  jacket: [],
  bottom: [],
  skirt: [],
  shoes: [],
  accessories: [],
};

// --- Outfit Types ---

// Represents the items selected for a single outfit.
export interface Outfit extends Partial<Record<Exclude<ClothingCategory, 'accessories'>, string | null>> {
  id: string;
  name: string;
  accessories: string[] | null; // Accessories can be multiple, all other categories are single string|null via Record
  notes?: string; // Optional notes for the outfit
}

// For selecting items for an outfit
export interface OutfitSelection extends Partial<Record<Exclude<ClothingCategory, 'accessories'>, string | null>> {
  // All non-accessory categories are string|null via Record
  accessories?: string[] | null; // Accessories can be multiple
}

// New type for logging when an outfit was worn
export interface OutfitLogEntry {
  date: string; // YYYY-MM-DD format
  outfitId: string;
  outfitName?: string; // Denormalized for easier display in logs/calendar, optional
}

// Initial state for an outfit selection process (all categories start with no selection)
export const initialOutfitSelection: OutfitSelection = {
  hat: null,
  top: null,
  jacket: null,
  bottom: null,
  skirt: null,
  shoes: null,
  accessories: [], // Initialize accessories as an empty array
}; 