import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { CLOTHING_CATEGORIES } from '../../src/constants/wardrobe'; // Corrected path
import { useWardrobeManager } from '../../src/hooks/useWardrobeManager'; // Import the hook
import { ClothingCategory, Outfit } from '../../src/types/wardrobe'; // Corrected path

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
  const { savedOutfits, isLoading, isInitialLoadComplete, logOutfitForDate } = useWardrobeManager();

  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null | undefined>(undefined);
  // undefined: loading/not yet searched, null: not found, Outfit: found

  const outfitId = params.id as string;

  useEffect(() => {
    if (!isLoading && isInitialLoadComplete && savedOutfits && outfitId) {
      const foundOutfit = savedOutfits.find(o => o.id === outfitId);
      setCurrentOutfit(foundOutfit || null); // Set to null if not found, or the outfit itself
      if (foundOutfit) {
        console.log(`[OutfitDetailScreen] Outfit "${foundOutfit.name}" (ID: ${outfitId}) processed.`);
      } else {
        console.log(`[OutfitDetailScreen] Outfit with ID: ${outfitId} not found after load.`);
      }
    } else if (!isLoading && isInitialLoadComplete && !savedOutfits && outfitId) {
      // This case might occur if savedOutfits is unexpectedly null after loading
      console.log(`[OutfitDetailScreen] savedOutfits is null/undefined after load, cannot find ID: ${outfitId}.`);
      setCurrentOutfit(null); // Treat as not found
    }
  }, [isLoading, isInitialLoadComplete, savedOutfits, outfitId]);

  const handleWoreItToday = () => {
    if (currentOutfit) {
      const today = getFormattedDate(new Date());
      logOutfitForDate(currentOutfit.id, currentOutfit.name, today);
      // Alert.alert("Logged!", `Marked "${currentOutfit.name}" as worn today.`); // Already handled in useWardrobeManager
      // Optionally, navigate back or give other feedback
      // router.back();
    }
  };

  // Loading state: show spinner if hook is loading or if we haven't tried to find the outfit yet
  if (isLoading || currentOutfit === undefined) {
    return (
      <View style={styles.loadingContainer}> 
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading outfit details...</Text>
      </View>
    );
  }

  // Not found state: if currentOutfit is null after attempting to find it
  if (currentOutfit === null) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Outfit not found.</Text>
        <Text style={styles.errorSubText}>It might have been deleted or the ID is incorrect.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Outfit found, render details
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: currentOutfit.name || 'Outfit Details' }} />
      <Text style={styles.outfitName}>{currentOutfit.name}</Text>

      <TouchableOpacity style={styles.woreTodayButton} onPress={handleWoreItToday}>
        <Text style={styles.woreTodayButtonText}>Wore it Today ({getFormattedDate(new Date())})</Text>
      </TouchableOpacity>

      <View style={styles.fullLookContainer}>
        {CategoryDisplayOrder.map((category) => {
          const itemUri = currentOutfit![category]; 
          return (
            <View key={category} style={styles.categorySlot}>
              <Text style={styles.categoryTitle}>{getCategoryDisplayName(category)}</Text>
              {itemUri ? (
                <Image source={{ uri: itemUri }} style={styles.itemImage} resizeMode="contain" />
              ) : (
                <View style={styles.itemPlaceholderContainer}>
                  <Text style={styles.itemPlaceholderText}>Not specified</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.notesSection}>
        <Text style={styles.notesTitle}>Notes:</Text>
        <Text style={styles.notesText}>{currentOutfit.notes || 'No notes for this outfit yet.'}</Text>
      </View>

      <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, styles.bottomBackButton]}>
        <Text style={styles.backButtonText}>Back to Wardrobe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#34495E',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorSubText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  outfitName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  fullLookContainer: {
    marginBottom: 32,
  },
  categorySlot: {
    marginBottom: 16,
    alignItems: 'center', 
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
  },
  itemImage: {
    width: '90%', 
    aspectRatio: 1, 
    height: undefined, 
    borderRadius: 8,
    backgroundColor: '#E9E9E9',
  },
  itemPlaceholderContainer: {
    width: '90%',
    height: 150, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
  },
  itemPlaceholderText: {
    fontSize: 14,
    color: '#999999',
  },
  notesSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
  bottomBackButton: { 
      marginTop: 32,
      marginBottom: 24, 
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  woreTodayButton: {
    backgroundColor: '#2ECC71', // A nice green
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20, // Added margin
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  woreTodayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 