import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Outfit } from '../../types/wardrobe';
import { SavedOutfitItem, cardMarginHorizontal, cardWidth } from './SavedOutfitItem';

interface OutfitListProps {
  savedOutfits: Outfit[];
  onDeleteOutfit: (outfitId: string) => void;
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
}

const snapInterval = cardWidth + (cardMarginHorizontal * 2);

export const OutfitList: React.FC<OutfitListProps> = ({ savedOutfits, onDeleteOutfit, isGlobalEditModeActive, onToggleGlobalEditMode }) => {
  const showEmptyState = (!savedOutfits || savedOutfits.length === 0) && !isGlobalEditModeActive;

  if (showEmptyState) {
    return (
      <View style={styles.emptyStateContainer}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={60} color="#BDC3C7" />
        <Text style={styles.emptyStateTitle}>No Outfits Styled Yet! ✨</Text>
        <Text style={styles.emptyStateSubtitle}>
          Tap &apos;Create Outfit&apos; above to design your first look.
        </Text>
      </View>
    );
  }

  if ((!savedOutfits || savedOutfits.length === 0) && isGlobalEditModeActive) {
    return (
      <View style={styles.listContainer}>
        <Text style={styles.title}>Saved Outfits</Text>
        <Text style={styles.emptyText}>No outfits. (Editing)</Text>
      </View>
    )
  }

  const handleDelete = (outfitId: string, outfitName?: string) => {
    Alert.alert(
      "Delete Outfit",
      `Are you sure you want to delete the outfit${outfitName ? ` "${outfitName}"` : ''}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => onDeleteOutfit(outfitId), style: "destructive" },
      ]
    );
  };

  return (
    <View style={styles.listContainer}>
      <Text style={styles.title}>Saved Outfits</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContentContainer}
        style={styles.carouselScrollView}
        snapToInterval={snapInterval}
        decelerationRate="fast"
      >
        {savedOutfits.map((item) => (
          <SavedOutfitItem
            key={item.id}
            outfit={item}
            onDeleteOutfit={() => handleDelete(item.id, item.name)}
            isGlobalEditModeActive={isGlobalEditModeActive}
            onToggleGlobalEditMode={onToggleGlobalEditMode}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 20,
  },
  carouselScrollView: {
  },
  carouselContentContainer: {
    paddingHorizontal: cardMarginHorizontal,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495E',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
}); 