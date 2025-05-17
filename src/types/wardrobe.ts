// src/types/wardrobe.ts

// Import CLOTHING_CATEGORIES to derive the ClothingCategory type
// This creates a dependency, so ensure constants are defined in a way that this can be resolved.
// Alternatively, if CLOTHING_CATEGORIES is primarily used for runtime logic and this is just for type safety,
// you could redefine the literal types here or import from a constants file.

// Define a TypeScript type for a single clothing category based on the constant array
// typeof CLOTHING_CATEGORIES[number] creates a union type of all possible values in CLOTHING_CATEGORIES
export type ClothingCategory = 'hat' | 'shirt' | 'jacket' | 'pants' | 'shoes' | 'bodywear' | 'underwear' | 'accessories';

// Define the structure for our wardrobe items using a TypeScript interface
// Each category (hat, shirt, etc.) will hold an array of image URIs (strings)
export interface WardrobeItems {
  hat: string[];
  shirt: string[];
  jacket: string[];
  pants: string[];
  shoes: string[];
  bodywear: string[];
  underwear: string[];
  accessories: string[];
  // We can also use a mapped type if categories become more dynamic, but for a fixed set this is clear:
  // [key in ClothingCategory]?: string[];
}

// Define the initial state structure for the wardrobe, ensuring all categories are present with empty arrays
export const initialWardrobeState: WardrobeItems = {
  hat: [],
  shirt: [],
  jacket: [],
  pants: [],
  shoes: [],
  bodywear: [],
  underwear: [],
  accessories: [],
};

// --- Outfit Types ---

// Represents the items selected for a single outfit.
// Each category can have at most one item (URI string) or null if no item is selected for that category.
export interface Outfit extends Partial<Record<Exclude<ClothingCategory, 'accessories'>, string | null>> {
  id: string;
  name: string;
  accessories: string[] | null;
  notes?: string; // Optional notes for the outfit
}

// For selecting items for an outfit
export interface OutfitSelection extends Partial<Record<Exclude<ClothingCategory, 'accessories'>, string | null>> {
  accessories?: string[] | null;
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
  shirt: null,
  jacket: null,
  pants: null,
  shoes: null,
  bodywear: null,
  underwear: null,
  accessories: [],
}; 