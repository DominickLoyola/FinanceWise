import { router } from 'expo-router'; // Add this import
import React, { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Goal = {
  id: string;
  title: string;
  current: number;
  target: number;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Emergency Fund', current: 350, target: 1000 },
    { id: '2', title: 'Vacation Savings', current: 780, target: 2000 },
    { id: '3', title: 'Credit Score', current: 680, target: 750 },
  ]);
  const [title, setTitle] = useState('');
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');

  function addGoal() {
    if (!title || !current || !target) return;
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        title,
        current: Number(current),
        target: Number(target),
      },
    ]);
    setTitle('');
    setCurrent('');
    setTarget('');
  }

  function deleteGoal(id: string) {
    setGoals(goals.filter(g => g.id !== id));
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.push("/home")} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Your Goals</Text>
      <FlatList
        data={goals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const pct = Math.min(100, Math.round((item.current / item.target) * 100));
          return (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <Text style={styles.amount}>${item.current} / ${item.target}</Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${pct}%`,
                      backgroundColor:
                        item.title === 'Emergency Fund'
                          ? '#4e85ee'
                          : item.title === 'Vacation Savings'
                          ? '#20b86a'
                          : '#9370DB',
                    },
                  ]}
                />
              </View>
              <Text style={styles.percent}>{pct}% complete</Text>
              <TouchableOpacity onPress={() => deleteGoal(item.id)}>
                <Text style={{ color: 'red', marginTop: 4 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <TextInput
        value={title}
        placeholder="Goal Name"
        placeholderTextColor="#666"
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        value={current}
        placeholder="Current Amount"
        placeholderTextColor="#666"
        keyboardType="numeric"
        onChangeText={setCurrent}
        style={styles.input}
      />
      <TextInput
        value={target}
        placeholder="Target Amount"
        placeholderTextColor="#666"
        keyboardType="numeric"
        onChangeText={setTarget}
        style={styles.input}
      />
      <Button title="+Add Goal" onPress={addGoal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  backButton: { marginTop: 50, marginBottom: 8, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8 },
  backButtonText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  header: { fontSize: 24, fontWeight: '600', textAlign: 'center', marginVertical: 16 },
  card: {
    backgroundColor: '#f9f9fb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  goalTitle: { fontSize: 19, fontWeight: '700' },
  amount: { fontSize: 15, color: '#555', fontWeight: '500' },
  progressBg: { height: 8, backgroundColor: '#eee', borderRadius: 5, marginVertical: 8 },
  progressBar: {
    height: 8,
    borderRadius: 5,
  },
  percent: { color: '#555', fontSize: 13, fontWeight: '400' },
  formHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 7,
    marginBottom: 10,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
