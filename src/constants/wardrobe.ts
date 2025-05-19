// src/constants/wardrobe.ts

// Define clothing categories as a constant array for easier mapping and iteration
export const CLOTHING_CATEGORIES = [
  'hat',
  'top',
  'jacket',
  'bottom',
  'skirt',
  'shoes',
  'accessories'
] as const;

// Storage key for wardrobe items
export const WARDROBE_STORAGE_KEY = 'MyWardrobeItems';

// Storage key for saved outfits
export const OUTFITS_STORAGE_KEY = 'MySavedOutfits';

// Storage key for outfit log (calendar feature)
export const OUTFIT_LOG_STORAGE_KEY = 'MyOutfitLog';

// Old keys below are removed:
// export const STORAGE_KEY = '@MyWardrobeApp:items';
// export const OUTFITS_STORAGE_KEY = '@MyWardrobeApp:outfits'; // For saved outfits