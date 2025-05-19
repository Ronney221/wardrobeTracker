import { ThemedText } from '@/components/ThemedText';
import { getColor } from '@/src/constants/theme';
import { Outfit } from '@/src/types/wardrobe';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SavedOutfitItem, cardMarginHorizontal, cardWidth } from './SavedOutfitItem';

interface OutfitListProps {
  savedOutfits: Outfit[];
  onDeleteOutfit: (outfitId: string) => void;
  isGlobalEditModeActive: boolean;
  onToggleGlobalEditMode: () => void;
}

const snapInterval = cardWidth + (cardMarginHorizontal * 2);

export const OutfitList: React.FC<OutfitListProps> = ({ savedOutfits, onDeleteOutfit, isGlobalEditModeActive, onToggleGlobalEditMode }) => {
  const scheme = useColorScheme() || 'light';
  const styles = getStyles(scheme);
  const showEmptyState = (!savedOutfits || savedOutfits.length === 0) && !isGlobalEditModeActive;

  if (showEmptyState) {
    return (
      <View style={styles.emptyStateContainer}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={60} color={getColor('textDisabled', scheme)} />
        <ThemedText type="subtitle" style={styles.emptyStateTitle}>No Outfits Styled Yet! ✨</ThemedText>
        <ThemedText style={styles.emptyStateSubtitle}>
          Tap &apos;Create Outfit&apos; above to design your first look.
        </ThemedText>
      </View>
    );
  }

  if ((!savedOutfits || savedOutfits.length === 0) && isGlobalEditModeActive) {
    return (
      <View style={styles.listContainer}>
        <ThemedText type="subtitle" style={styles.title}>Saved Outfits</ThemedText>
        <ThemedText style={styles.emptyText}>No outfits. (Editing)</ThemedText>
      </View>
    )
  }

  const handleDelete = (outfitId: string, outfitName?: string) => {
    Alert.alert(
      "Delete Outfit",
      `Are you sure you want to delete the outfit${outfitName ? ` \"${outfitName}\"` : ''}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => onDeleteOutfit(outfitId), style: "destructive" },
      ]
    );
  };

  return (
    <View style={styles.listContainer}>
      <ThemedText type="subtitle" style={styles.title}>Saved Outfits</ThemedText>
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

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  listContainer: {
    marginTop: 20,
  },
  carouselScrollView: {
  },
  carouselContentContainer: {
    paddingHorizontal: cardMarginHorizontal,
  },
  title: {
    marginBottom: 16,
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    color: getColor('textSecondary', scheme),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: getColor('textDisabled', scheme),
  },
}); 