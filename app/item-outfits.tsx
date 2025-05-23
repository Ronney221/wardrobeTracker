import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { OutfitList } from '../src/components/outfit/OutfitList'; // Assuming OutfitList can be used
import { CLOTHING_CATEGORIES } from '../src/constants/wardrobe';
import { useWardrobeManager } from '../src/hooks/useWardrobeManager';
import { Outfit } from '../src/types/wardrobe';

export default function ItemOutfitsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ itemId?: string }>();
  const { itemId } = params;

  const { savedOutfits, isLoading: isWardrobeLoading, wardrobeItems } = useWardrobeManager();
  const [itemName, setItemName] = useState<string>('');
  const [itemCategory, setItemCategory] = useState<string>('');


  useEffect(() => {
    if (itemId && wardrobeItems) {
      let foundCategory = '';
      let foundName = ''; // Placeholder for actual name if available, using URI for now.
      
      for (const category of CLOTHING_CATEGORIES) {
        if (wardrobeItems[category]?.includes(itemId)) {
          foundCategory = category.charAt(0).toUpperCase() + category.slice(1);
          // Potentially fetch more item details if needed, for now using URI as identifier
          foundName = itemId.substring(itemId.lastIndexOf('/') + 1, itemId.lastIndexOf('.jpeg')); // Basic name extraction
          break;
        }
      }
      setItemName(foundName || 'Item');
      setItemCategory(foundCategory);
    }
  }, [itemId, wardrobeItems]);

  const relevantOutfits = useMemo(() => {
    if (!itemId || !savedOutfits) {
      return [];
    }
    return savedOutfits.filter(outfit => {
      // Check all clothing categories (excluding id, name, notes which are not item URIs)
      for (const key in outfit) {
        if (key === 'id' || key === 'name' || key === 'notes') {
          continue;
        }
        const outfitItemOrItems = outfit[key as keyof Outfit];
        if (Array.isArray(outfitItemOrItems)) {
          if (outfitItemOrItems.includes(itemId)) return true;
        } else if (typeof outfitItemOrItems === 'string') {
          if (outfitItemOrItems === itemId) return true;
        }
      }
      return false;
    });
  }, [itemId, savedOutfits]);

  if (isWardrobeLoading && !savedOutfits.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading outfits...</Text>
      </View>
    );
  }

  if (!itemId) {
    return (
      <View style={styles.centered}>
        <Text>Item ID not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: itemName ? `Outfits with ${itemName}` : 'Item Outfits' }} />
      <View style={styles.headerContainer}>
        {itemId && <Image source={{ uri: itemId }} style={styles.itemImage} />}
        <Text style={styles.title}>
          Outfits Featuring:
        </Text>
        <Text style={styles.itemName}>{itemName || 'Selected Item'}</Text>
        {itemCategory && <Text style={styles.itemCategory}>Category: {itemCategory}</Text>}
      </View>

      {relevantOutfits.length > 0 ? (
        <OutfitList
          savedOutfits={relevantOutfits}
          onDeleteOutfit={() => {
            // Deletion might not be desired here, or needs careful consideration
            // For now, no-op or a specific handler if needed
            console.log('Delete outfit pressed on ItemOutfitsScreen');
          }}
          isGlobalEditModeActive={false} // Assuming not in edit mode here
          onToggleGlobalEditMode={() => {}} // No-op
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No outfits found featuring this item.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#e0e0e0', // Placeholder background
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
  }
}); 