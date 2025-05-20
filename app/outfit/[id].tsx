import { ThemedText } from '@/components/ThemedText';
import { getColor } from '@/src/constants/theme';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { CLOTHING_CATEGORIES } from '../../src/constants/wardrobe';
import { useWardrobeManager } from '../../src/context/WardrobeContext';
import { ClothingCategory, Outfit, WardrobeItemData } from '../../src/types/wardrobe';

const CategoryDisplayOrder: readonly ClothingCategory[] = CLOTHING_CATEGORIES;

const getCategoryDisplayName = (category: ClothingCategory): string => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Helper to format date to YYYY-MM-DD
const getFormattedDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export default function OutfitDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme() || 'light';
  const { 
    savedOutfits, 
    isLoading: isWardrobeLoading,
    isInitialLoadComplete, 
    logOutfitForDate,
    wardrobeItems,
    handleUpdateOutfitNotes
  } = useWardrobeManager();

  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null | undefined>(undefined);
  const [isLoadingOutfit, setIsLoadingOutfit] = useState<boolean>(true);
  const [editableNotes, setEditableNotes] = useState<string>("");
  const [orderedMainItems, setOrderedMainItems] = useState<{ category: ClothingCategory; items: WardrobeItemData[] }[]>([]);
  const [accessoryItems, setAccessoryItems] = useState<WardrobeItemData[]>([]);

  const outfitId = params.id as string;

  useEffect(() => {
    setIsLoadingOutfit(true);
    if (!isWardrobeLoading && isInitialLoadComplete && savedOutfits && outfitId && wardrobeItems) {
      const foundOutfit = savedOutfits.find(o => o.id === outfitId);
      setCurrentOutfit(foundOutfit || null); 
      if (foundOutfit) {
        setEditableNotes(foundOutfit.notes || "");
        
        const mainCategoriesInOrder: ClothingCategory[] = ['top', 'outerwear', 'bottom', 'shoes'];
        const processedMainItems: { category: ClothingCategory; items: WardrobeItemData[] }[] = [];
        let processedAccessoryItems: WardrobeItemData[] = [];

        CategoryDisplayOrder.forEach(category => {
          const categoryValue = foundOutfit[category];
          let itemsToDisplayFromCategory: WardrobeItemData[] = [];

          if (typeof categoryValue === 'string') {
            const strCategoryValue: string = categoryValue;
            if (strCategoryValue.startsWith('data:') || strCategoryValue.startsWith('http') || strCategoryValue.startsWith('file:')) {
              itemsToDisplayFromCategory = [{ id: strCategoryValue, uri: strCategoryValue, name: 'Legacy Item (Direct URI)' }];
            }
          } else if (Array.isArray(categoryValue)) {
            itemsToDisplayFromCategory = categoryValue.map(idOrUri => {
              if (typeof idOrUri !== 'string') return undefined;
              if (idOrUri.startsWith('data:')) return { id: idOrUri, uri: idOrUri, name: 'Pasted Item' };
              const itemDataFromId = getItemDataById(category, idOrUri);
              if (itemDataFromId) return itemDataFromId;
              if (idOrUri.startsWith('http') || idOrUri.startsWith('file:')) return { id: idOrUri, uri: idOrUri, name: 'Legacy Array URI' };
              return undefined;
            }).filter(item => item !== undefined && item.uri) as WardrobeItemData[];
          }

          if (category === 'accessories') {
            processedAccessoryItems.push(...itemsToDisplayFromCategory);
          } else if (mainCategoriesInOrder.includes(category)) {
            // Add to main items if it's one of the specified categories and has items
            if (itemsToDisplayFromCategory.length > 0) {
                 processedMainItems.push({ category, items: itemsToDisplayFromCategory });
            }
          }
        });
        
        // Ensure main items are in the specified order and include categories even if empty, for consistent layout
        const finalOrderedMainItems = mainCategoriesInOrder.map(catOrder => {
            const found = processedMainItems.find(p => p.category === catOrder);
            return found || { category: catOrder, items: [] }; // Add placeholder for empty main categories
        });

        setOrderedMainItems(finalOrderedMainItems);
        setAccessoryItems(processedAccessoryItems);

      }
      setIsLoadingOutfit(false);
    } else if (!isWardrobeLoading && isInitialLoadComplete) {
      setCurrentOutfit(null);
      setIsLoadingOutfit(false);
    }
  }, [isWardrobeLoading, isInitialLoadComplete, savedOutfits, outfitId, wardrobeItems]);

  const getItemDataById = (categoryId: ClothingCategory, itemId: string): WardrobeItemData | undefined => {
    if (!wardrobeItems || !wardrobeItems[categoryId]) {
      return undefined;
    }
    const categoryItems = wardrobeItems[categoryId];
    return categoryItems?.find(item => item.id === itemId);
  };

  const handleNotesChange = (text: string) => {
    setEditableNotes(text);
  };

  const handleSaveNotes = () => {
    if (currentOutfit && typeof editableNotes === 'string') {
      handleUpdateOutfitNotes(currentOutfit.id, editableNotes);
    }
  };

  const handleWoreItToday = () => {
    if (currentOutfit) {
      const today = getFormattedDate(new Date());
      logOutfitForDate(currentOutfit.id, currentOutfit.name, today);
    }
  };

  // Dynamic styles based on scheme
  const styles = getStyles(scheme);

  if (isWardrobeLoading || isLoadingOutfit) {
    return (
      <View style={styles.loadingContainer}> 
        <ActivityIndicator size="large" color={getColor('pinkBarbie', scheme)} />
        <ThemedText style={styles.loadingText}>Loading outfit details...</ThemedText>
      </View>
    );
  }

  if (currentOutfit === null) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText type="title" style={styles.errorText}>Outfit Not Found</ThemedText>
        <ThemedText style={styles.errorSubText}>It might have been deleted or the link is incorrect.</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.buttonStyle}>
          <ThemedText style={styles.buttonTextStyle}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!currentOutfit) {
    return (
      <View style={styles.errorContainer}>
        <ThemedText type="title" style={styles.errorText}>Error</ThemedText>
        <ThemedText style={styles.errorSubText}>An unexpected error occurred loading the outfit.</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.buttonStyle}>
          <ThemedText style={styles.buttonTextStyle}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: currentOutfit.name || 'Outfit Details' }} />
      <ThemedText type="title" style={styles.outfitName}>{currentOutfit.name}</ThemedText>

      {/* New Structured Outfit Display */}
      <View style={styles.outfitDisplayContainer}> 
        {/* Main Items Column */}
        <View style={[styles.mainItemsColumn, accessoryItems.length > 0 && { marginRight: 10 }]}>
          {orderedMainItems.map(({ category, items }) => (
            <View key={category} style={styles.mainCategorySlot}>
              <ThemedText type="defaultSemiBold" style={styles.mainCategoryTitle}>{getCategoryDisplayName(category)}</ThemedText>
              {items.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.horizontalItemScrollContainer}
                >
                  {items.map(item => (
                    <Image 
                      key={item.id} 
                      source={{ uri: item.uri }} 
                      style={styles.outfitItemImage} 
                      resizeMode="contain" 
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.outfitItemPlaceholder}>
                  <ThemedText style={styles.itemPlaceholderText}>-</ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Accessories Column/Area */}
        {accessoryItems.length > 0 && (
            <View style={styles.accessoriesColumn}>
                <ThemedText type="defaultSemiBold" style={styles.accessoriesTitle}>Accessories</ThemedText>
                <ScrollView 
                    contentContainerStyle={styles.accessoriesScrollContainer} 
                    showsVerticalScrollIndicator={false} // Or horizontal if preferred
                >
                {accessoryItems.map(item => (
                    <Image 
                        key={item.id} 
                        source={{ uri: item.uri }} 
                        style={styles.accessoryItemImage} 
                        resizeMode="contain" 
                    />
                ))}
                </ScrollView>
            </View>
        )}
      </View>
      
      {/* Spacer if no accessories but main items exist, to prevent notes from jumping up too much */}
      {orderedMainItems.some(cat => cat.items.length > 0) && accessoryItems.length === 0 && (
        <View style={{height: 50}} /> // Adjust as needed
      )}

      {/* Notes Section */}
      <View style={styles.notesSection}>
        <ThemedText type="subtitle" style={styles.notesTitle}>Notes:</ThemedText>
        <TextInput
          style={styles.notesInput}
          value={editableNotes}
          onChangeText={handleNotesChange}
          onBlur={handleSaveNotes}
          placeholder="Add your notes here..."
          placeholderTextColor={getColor('textDisabled', scheme)}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.woreTodayButton} onPress={handleWoreItToday}>
        <ThemedText style={styles.woreTodayButtonText}>Wore it Today ({getFormattedDate(new Date())})</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={[styles.buttonStyle, styles.bottomBackButton]}>
        <ThemedText style={styles.buttonTextStyle}>Back to Wardrobe</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Updated styles using theme
const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('bgScreen', scheme),
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('bgScreen', scheme),
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: getColor('textSecondary', scheme),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: getColor('bgScreen', scheme),
  },
  errorText: {
    color: getColor('systemDestructive', scheme),
    textAlign: 'center',
    marginBottom: 12,
  },
  errorSubText: {
    fontSize: 16,
    color: getColor('textSecondary', scheme),
    textAlign: 'center',
    marginBottom: 20,
  },
  outfitName: {
    color: getColor('textPrimary', scheme),
    textAlign: 'center',
    marginBottom: 24,
  },
  fullLookContainer: {
    marginBottom: 32,
  },
  categorySlot: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: getColor('textSecondary', scheme),
    marginBottom: 10,
    textAlign: 'center',
  },
  itemsScrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    height: 120,
  },
  itemImageInScroll: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginHorizontal: 6,
    backgroundColor: getColor('bgElevated', scheme),
  },
  itemPlaceholderContainer: {
    width: '90%',
    height: 100, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('bgMuted', scheme),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
    alignSelf: 'center',
  },
  itemPlaceholderText: {
    fontSize: 14,
    color: getColor('textDisabled', scheme),
  },
  notesSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: getColor('bgCard', scheme),
    borderRadius: 12,
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesTitle: {
    color: getColor('textPrimary', scheme),
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: getColor('textSecondary', scheme),
    lineHeight: 22,
  },
  notesInput: {
    fontSize: 16,
    color: getColor('textPrimary', scheme),
    lineHeight: 22,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: getColor('bgScreen', scheme),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
  },
  buttonStyle: {
    backgroundColor: getColor('pinkBarbie', scheme),
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
    minWidth: 150,
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonTextStyle: {
      color: getColor('textOnPinkBarbie', scheme),
      fontSize: 16,
      fontWeight: 'bold',
  },
  bottomBackButton: { 
      marginTop: 32,
      marginBottom: 24, 
      backgroundColor: getColor('pinkRaspberry', scheme),
  },
  woreTodayButton: {
    backgroundColor: getColor('accentGreen', scheme),
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignSelf: 'center',
  },
  woreTodayButtonText: {
    color: getColor('textOnAccentGreen', scheme),
    fontSize: 16,
    fontWeight: 'bold',
  },
  outfitDisplayContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    width: '100%',
  },
  mainItemsColumn: {
    flex: 1,
  },
  mainCategorySlot: {
    marginBottom: 15,
    alignItems: 'center',
  },
  mainCategoryTitle: {
    color: getColor('textSecondary', scheme),
    marginBottom: 8,
  },
  horizontalItemScrollContainer: {
    paddingHorizontal: 4,
    height: 110,
  },
  outfitItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: getColor('bgElevated', scheme),
  },
  outfitItemPlaceholder: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('bgMuted', scheme),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
    marginHorizontal: 4,
  },
  accessoriesColumn: {
    flex: 0.6,
    alignItems: 'center',
  },
  accessoriesTitle: {
    color: getColor('textSecondary', scheme),
    marginBottom: 8,
  },
  accessoriesScrollContainer: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  accessoryItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: getColor('bgElevated', scheme),
  },
}); 