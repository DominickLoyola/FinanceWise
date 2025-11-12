import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
      const expenseCategory = categories.find(c => c.id === selectedCategory)?.label || '';
      
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
          <Text style={styles.backButtonText}>Swipe down to go Home</Text>
        </View>
        
        <Text style={styles.title}>FinanceWise</Text>
        
        <ScrollView style={styles.form}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="$20.00"
            placeholderTextColor="#666"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="What did you spend on?"
            placeholderTextColor="#666"
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
  categoryButton: {
    width: '30%',
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
});