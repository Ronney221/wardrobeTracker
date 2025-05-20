import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { getColor } from '@/src/constants/theme';
import { ClothingCategory, UserSubcategories, WardrobeItemData } from '@/src/types/wardrobe';

interface EditItemModalProps {
  isVisible: boolean;
  onClose: () => void;
  itemToEdit: WardrobeItemData | null;
  originalCategory: ClothingCategory | null;
  onSaveChanges: (itemId: string, newName: string, newSubcategory: string) => void;
  onDeleteItem: (itemId: string) => void; // We'll call the main delete handler
  userSubcategories: UserSubcategories;
  onAddSubcategory: (mainCategory: ClothingCategory, newSubcategoryName: string) => Promise<boolean>;
  // We might not need all clothing categories if the main category cannot be changed here
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isVisible,
  onClose,
  itemToEdit,
  originalCategory,
  onSaveChanges,
  onDeleteItem,
  userSubcategories,
  onAddSubcategory,
}) => {
  const scheme = useColorScheme() || 'light';
  const styles = getStyles(scheme);

  const [itemName, setItemName] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setItemName(itemToEdit.name || '');
      setSelectedSubcategory(itemToEdit.subcategory || '');
    } else {
      // Reset fields when modal is hidden or itemToEdit is null
      setItemName('');
      setSelectedSubcategory('');
      setNewSubcategoryName('');
    }
  }, [itemToEdit]);

  if (!itemToEdit || !originalCategory) {
    return null; // Or a minimal modal if it's visible but itemToEdit is null unexpectedly
  }

  const currentCategorySubcategories = userSubcategories[originalCategory] || [];

  const handleSave = () => {
    onSaveChanges(itemToEdit.id, itemName, selectedSubcategory);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemToEdit.name || 'this item'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteItem(itemToEdit.id);
            onClose(); // Close modal after deletion starts
          },
        },
      ]
    );
  };

  const handleAddNewSubcategory = async () => {
    if (newSubcategoryName.trim() && originalCategory) {
        const success = await onAddSubcategory(originalCategory, newSubcategoryName.trim());
        if (success) {
            setSelectedSubcategory(newSubcategoryName.trim());
            setNewSubcategoryName(''); // Clear input
        }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView style={{width: '100%'}} contentContainerStyle={{alignItems: 'center'}}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Edit Item</ThemedText>
            
            <Image source={{ uri: itemToEdit.uri }} style={styles.itemImage} resizeMode="contain" />

            <ThemedText style={styles.label}>Name:</ThemedText>
            <TextInput
              style={styles.input}
              value={itemName}
              onChangeText={setItemName}
              placeholder="Item Name (Optional)"
              placeholderTextColor={getColor('textDisabled', scheme)}
            />

            <ThemedText style={styles.label}>Subcategory:</ThemedText>
            {currentCategorySubcategories.length > 0 && (
              <View style={styles.subcategorySelectionContainer}>
                {currentCategorySubcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    style={[
                      styles.subcategoryChip,
                      selectedSubcategory === sub && styles.selectedSubcategoryChip,
                    ]}
                    onPress={() => setSelectedSubcategory(sub)}
                  >
                    <ThemedText 
                        style={selectedSubcategory === sub ? styles.selectedSubcategoryText : styles.subcategoryText}
                    >
                        {sub}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <View style={styles.newSubcategoryContainer}>
                <TextInput
                    style={[styles.input, styles.newSubcategoryInput]}
                    placeholder={`New ${originalCategory} subcategory...`}
                    placeholderTextColor={getColor('textDisabled', scheme)}
                    value={newSubcategoryName}
                    onChangeText={setNewSubcategoryName}
                />
                <TouchableOpacity style={styles.addSubcategoryButton} onPress={handleAddNewSubcategory} disabled={!newSubcategoryName.trim()}>
                    <ThemedText style={styles.addSubcategoryButtonText}>Add</ThemedText>
                </TouchableOpacity>
            </View>
            {selectedSubcategory ? (
                <TouchableOpacity onPress={() => setSelectedSubcategory('')} style={styles.clearSubcategoryButton}>
                    <ThemedText style={styles.clearSubcategoryText}><FontAwesome name="times-circle" size={14} /> Clear Subcategory</ThemedText>
                </TouchableOpacity>
            ) : null}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                <ThemedText style={styles.buttonText}>Delete Item</ThemedText>
              </TouchableOpacity>
            </View>
            
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Dimmed background
  },
  modalView: {
    margin: 20,
    backgroundColor: getColor('bgCard', scheme),
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: getColor('shadowDefault', scheme),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '85%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    color: getColor('pinkRaspberry', scheme),
  },
  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: getColor('bgMuted', scheme),
  },
  label: {
    fontSize: 16,
    color: getColor('textSecondary', scheme),
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    backgroundColor: getColor('bgScreen', scheme),
    borderColor: getColor('borderSubtle', scheme),
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Adjust padding for platform differences
    fontSize: 16,
    color: getColor('textPrimary', scheme),
    marginBottom: 15,
  },
  subcategorySelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'center',
  },
  subcategoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: getColor('bgMuted', scheme),
    margin: 4,
    borderWidth: 1,
    borderColor: getColor('borderSubtle', scheme),
  },
  selectedSubcategoryChip: {
    backgroundColor: getColor('pinkBarbie', scheme),
    borderColor: getColor('pinkRaspberry', scheme),
  },
  subcategoryText: {
    color: getColor('textPrimary', scheme),
  },
  selectedSubcategoryText: {
    color: getColor('textOnPinkBarbie', scheme),
    fontWeight: 'bold',
  },
  newSubcategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  newSubcategoryInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0, // Remove bottom margin as it's part of a row
  },
  addSubcategoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: getColor('accentMagenta', scheme),
    borderRadius: 8,
    justifyContent: 'center',
  },
  addSubcategoryButtonText: {
    color: getColor('textOnAccent', scheme),
    fontWeight: 'bold',
  },
  clearSubcategoryButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
    padding: 4,
  },
  clearSubcategoryText: {
      color: getColor('textDisabled', scheme),
      fontSize: 13,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 10, // Adjust horizontal padding
    elevation: 2,
    minWidth: 120, // Ensure buttons have decent width
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: getColor('systemSuccess', scheme),
  },
  deleteButton: {
    backgroundColor: getColor('systemDestructive', scheme),
  },
  cancelButton: {
    backgroundColor: getColor('textDisabled', scheme),
    marginTop: 5,
  },
  buttonText: {
    color: '#FFFFFF', // Assuming most buttons have light text
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 