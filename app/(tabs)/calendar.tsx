import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { CLOTHING_CATEGORIES } from '../../src/constants/wardrobe';
import { useWardrobeManager } from '../../src/hooks/useWardrobeManager';
import { Outfit } from '../../src/types/wardrobe';

// Helper to format date to YYYY-MM-DD
const getFormattedDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export default function CalendarScreen() {
  const { outfitLog, savedOutfits, logOutfitForDate } = useWardrobeManager();
  const [selectedDate, setSelectedDate] = useState<string>(getFormattedDate(new Date()));
  const [displayedOutfitDetails, setDisplayedOutfitDetails] = useState<Outfit | null>(null);

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    outfitLog.forEach(entry => {
      marks[entry.date] = { 
        marked: true, 
        dotColor: '#007AFF', // Primary color for marker
        // You can add custom styling here or outfitName if needed for custom marker
      };
    });
    // Mark the currently selected date
    marks[selectedDate] = { 
      ...marks[selectedDate], 
      selected: true, 
      selectedColor: '#007AFF', 
      // selectedTextColor: 'white' // If you want text color to change on selection
    };
    return marks;
  }, [outfitLog, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const loggedOutfitEntry = outfitLog.find(entry => entry.date === day.dateString);

    if (loggedOutfitEntry) {
      const fullOutfitDetails = savedOutfits.find(o => o.id === loggedOutfitEntry.outfitId);
      setDisplayedOutfitDetails(fullOutfitDetails || null);
      if (!fullOutfitDetails) {
        Alert.alert("Outfit Data Missing", "The logged outfit's details could not be found. It might have been deleted.");
      }
      // Simplified alert, or could be removed if UI provides all options
      Alert.alert(
        `Outfit for ${day.dateString}`,
        `${fullOutfitDetails ? fullOutfitDetails.name : 'Details missing'}. You can log a new outfit for this day.`,
        [
          { text: 'OK' },
          { text: 'Log Different Outfit', onPress: () => promptForOutfitSelection(day.dateString) },
        ]
      );
    } else {
      setDisplayedOutfitDetails(null);
      Alert.alert(
        `No Outfit Logged for ${day.dateString}`,
        'Would you like to log an outfit for this day?',
        [
          { text: 'Cancel' },
          { text: 'Log Outfit', onPress: () => promptForOutfitSelection(day.dateString) },
        ]
      );
    }
  };

  const promptForOutfitSelection = (date: string) => {
    if (savedOutfits.length === 0) {
      Alert.alert("No Outfits", "You don't have any saved outfits to log.");
      return;
    }

    // Create buttons for each saved outfit for the Alert prompt
    const outfitButtons = savedOutfits.map(outfit => ({
      text: outfit.name,
      onPress: () => {
        logOutfitForDate(outfit.id, outfit.name, date);
      },
    }));

    Alert.alert(
      `Log Outfit for ${date}`,
      'Choose an outfit:',
      [
        ...outfitButtons,
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // Helper to get a display name for the category
  const getCategoryDisplayName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Outfit Calendar' }} />
      <Text style={styles.header}>Outfit Calendar</Text>
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={markedDates}
        monthFormat={'MMMM yyyy'}
        hideExtraDays={true}
        firstDay={1} // Monday as first day of the week
        theme={{
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
          // Add other theme properties if needed
        }}
      />
      <View style={styles.selectedDateInfoContainer}>
        <Text style={styles.selectedDateText}>Selected Date: {selectedDate}</Text>
        {displayedOutfitDetails ? (
          <View style={styles.outfitDetailsContainer}>
            <Text style={styles.outfitNameText}>Logged: {displayedOutfitDetails.name}</Text>
            {CLOTHING_CATEGORIES.map(category => {
              const itemUri = displayedOutfitDetails[category as keyof Outfit];
              if (itemUri && typeof itemUri === 'string') {
                return (
                  <View key={category} style={styles.outfitItemContainer}>
                    <Text style={styles.categoryNameText}>{getCategoryDisplayName(category)}:</Text>
                    <Image source={{ uri: itemUri }} style={styles.outfitItemImage} resizeMode="contain" />
                  </View>
                );
              }
              return null;
            })}
            <TouchableOpacity 
              style={styles.logDifferentButton}
              onPress={() => promptForOutfitSelection(selectedDate)}
            >
              <Text style={styles.logDifferentButtonText}>Log Different Outfit for {selectedDate}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.infoText}>
            {outfitLog.find(entry => entry.date === selectedDate) ? 'Outfit details not found (may have been deleted).' : 'No outfit logged for this day.'}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    paddingVertical: 16, // 8px grid
  },
  selectedDateInfoContainer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 10,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginTop: 8,
  },
  outfitDetailsContainer: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  outfitNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  outfitItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryNameText: {
    fontSize: 16,
    color: '#555',
    marginRight: 10,
    fontWeight: '500',
  },
  outfitItemImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#EFEFEF',
  },
  logDifferentButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logDifferentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
}); 