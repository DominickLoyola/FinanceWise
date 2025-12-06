import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from './firebaseConfig';

export const categories = [
  { id: 'food', icon: '🍔', label: 'Food' },
  { id: 'transport', icon: '🚗', label: 'Transport' },
  { id: 'housing', icon: '🏠', label: 'Housing' },
  { id: 'entertainment', icon: '🎮', label: 'Entertainment' },
  { id: 'shopping', icon: '🛍️', label: 'Shopping' },
  { id: 'health', icon: '🏥', label: 'Health' },
];

export default function Modal() {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customCategories, setCustomCategories] = useState<Array<{ id: string; icon: string; label: string }>>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📝');

  // Load custom categories from Firestore
  useEffect(() => {
    const loadCustomCategories = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const savedCategories = userData.customCategories || [];
          setCustomCategories(savedCategories);
        }
      } catch (error) {
        console.error("Error loading custom categories:", error);
      }
    };

    loadCustomCategories();
  }, []);

  // Get all categories (default + custom)
  const allCategories = [...categories, ...customCategories];

  // Handle creating a new custom category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (!auth.currentUser) {
      alert('You must be logged in to create categories');
      return;
    }

    // Check if category name already exists
    const categoryExists = allCategories.some(
      cat => cat.label.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (categoryExists) {
      alert('This category already exists');
      return;
    }

    try {
      const newCategory = {
        id: `custom_${Date.now()}`,
        icon: newCategoryIcon || '📝',
        label: newCategoryName.trim(),
      };

      const updatedCategories = [...customCategories, newCategory];
      setCustomCategories(updatedCategories);

      // Save to Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        customCategories: updatedCategories,
      });

      // Reset form
      setNewCategoryName('');
      setNewCategoryIcon('📝');
      setShowCreateCategory(false);
      
      // Auto-select the newly created category
      setSelectedCategory(newCategory.id);
    } catch (error) {
      console.error("Error saving custom category:", error);
      alert('Failed to save category. Please try again.');
    }
  };

  // Handle deleting a custom category
  const handleDeleteCategory = async (categoryId: string, categoryLabel: string) => {
    if (!auth.currentUser) {
      alert('You must be logged in to delete categories');
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryLabel}"? This will not delete expenses that used this category.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCategories = customCategories.filter(cat => cat.id !== categoryId);
              setCustomCategories(updatedCategories);

              // Save to Firestore
              if (!auth.currentUser) return;
              const userDocRef = doc(db, "users", auth.currentUser.uid);
              await updateDoc(userDocRef, {
                customCategories: updatedCategories,
              });

              // Clear selection if the deleted category was selected
              if (selectedCategory === categoryId) {
                setSelectedCategory('');
              }
            } catch (error) {
              console.error("Error deleting custom category:", error);
              alert('Failed to delete category. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) {
      alert('Please fill in amount and select a category');
      return;
    }

    if (!auth.currentUser) {
      alert('You must be logged in to add expenses');
      return;
    }

    try {
      const expenseAmount = parseFloat(amount);
      const selectedCategoryData = allCategories.find(c => c.id === selectedCategory);
      const expenseCategory = selectedCategoryData?.label || '';
      
      if (!expenseCategory) {
        alert('Please select a valid category');
        return;
      }
      
      // Get current user data
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        alert('User data not found');
        return;
      }

      const userData = userDoc.data();
      const currentBalance = userData.currentBalance || 0;
      const currentTotalSpent = userData.totalSpent || 0;

      // Calculate new values
      const newBalance = currentBalance - expenseAmount;
      const newTotalSpent = currentTotalSpent + expenseAmount;

      // Create the expense object
      const expense = {
        amount: expenseAmount,
        category: expenseCategory,
        categoryIcon: selectedCategoryData?.icon || '',
        description: description || expenseCategory,
        date: date.toISOString(),
        createdAt: serverTimestamp(),
      };

      // Save expense to Firestore subcollection
      await addDoc(collection(db, "users", auth.currentUser.uid, "expenses"), expense);

      // Update user balance and totalSpent in Firestore
      await updateDoc(userDocRef, {
        currentBalance: newBalance,
        totalSpent: newTotalSpent,
      });

      // Navigate back
      router.back();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert('Failed to save expense. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Button Header */}
        <View style={styles.backButton}>
          <Text style={styles.backButtonText}>Swipe down to go back</Text>
        </View>
        
        <Text style={styles.title}>FinanceWise</Text>
        
        <ScrollView style={styles.form}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="$20.00"
            placeholderTextColor="#bab8b8"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {allCategories.map((category) => {
              const isCustomCategory = category.id.startsWith('custom_');
              return (
                <View key={category.id} style={styles.categoryButtonWrapper}>
                  <Pressable
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.categoryButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </Pressable>
                  {isCustomCategory && (
                    <Pressable
                      style={styles.deleteCategoryButton}
                      onPress={() => handleDeleteCategory(category.id, category.label)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.deleteCategoryIcon}>✕</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
            <Pressable
              style={[styles.categoryButton, styles.createCategoryButton]}
              onPress={() => setShowCreateCategory(!showCreateCategory)}
            >
              <Text style={styles.categoryIcon}>➕</Text>
              <Text style={styles.categoryLabel}>Custom</Text>
            </Pressable>
          </View>

          {showCreateCategory && (
            <View style={styles.createCategoryContainer}>
              <Text style={styles.label}>Create Custom Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Category name"
                placeholderTextColor="#bab8b8"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TextInput
                style={[styles.input, styles.iconInput]}
                placeholder="Icon (emoji)"
                placeholderTextColor="#bab8b8"
                value={newCategoryIcon}
                onChangeText={setNewCategoryIcon}
                maxLength={2}
              />
              <View style={styles.createCategoryActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowCreateCategory(false);
                    setNewCategoryName('');
                    setNewCategoryIcon('📝');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.saveCategoryButton}
                  onPress={handleCreateCategory}
                >
                  <Text style={styles.saveCategoryButtonText}>Create</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="What did you spend on?"
            placeholderTextColor="#bab8b8"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Date</Text>
          <Pressable 
            style={styles.input} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {date.toLocaleDateString()}
            </Text>
          </Pressable>

          {showDatePicker && (
            <View style={Platform.OS === 'ios' ? styles.datePickerIOS : undefined}>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
                themeVariant="light"
                textColor="#000000"
                accentColor="#1f6bff"
              />
            </View>
          )}

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Save Expense</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerIOS: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8fb',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1f6bff',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryButtonWrapper: {
    width: '30%',
    position: 'relative',
  },
  categoryButton: {
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  categoryButtonSelected: {
    backgroundColor: '#e8f0ff',
    borderColor: '#1f6bff',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#1f6bff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  createCategoryButton: {
    borderStyle: 'dashed',
  },
  createCategoryContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  iconInput: {
    marginBottom: 16,
  },
  createCategoryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveCategoryButton: {
    flex: 1,
    backgroundColor: '#1f6bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  saveCategoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  deleteCategoryButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff3c3c',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: 'white',
  },
  deleteCategoryIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});