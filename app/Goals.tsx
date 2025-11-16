import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

// Goal type
type Goal = {
  id: string;
  title: string;
  current: number;
  target: number;
  docId?: string;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(db, "goals"),
      where("userId", "==", currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const goalsArr: Goal[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        goalsArr.push({
          id: docSnap.id,
          title: data.title,
          current: data.current,
          target: data.target,
          docId: docSnap.id,
        });
      });
      setGoals(goalsArr);
    }, (error) => {
      console.error("Error fetching goals:", error);
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  async function addGoal() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Not signed in", "Please sign in first.");
      return;
    }
    if (!title || !current || !target) {
      Alert.alert("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await addDoc(collection(db, "goals"), {
        userId: currentUser.uid,
        title,
        current: Number(current),
        target: Number(target),
      });
      setTitle("");
      setCurrent("");
      setTarget("");
    } catch (error) {
      console.error("Error adding goal:", error);
      Alert.alert("Error adding goal. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteGoal(docId?: string) {
    if (!docId) return;
    try {
      await deleteDoc(doc(db, "goals", docId));
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error deleting goal. Please try again.");
    }
  }

  return (
    <View style={styles.screenBg}>
      {/* Navigation / Hero Section */}
      <View style={styles.headerWrap}>
        <TouchableOpacity onPress={() => router.push("/home")}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Your Financial Goals</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
      </View>

      {/* Card List */}
      <FlatList
        data={goals}
        ListEmptyComponent={<Text style={styles.emptyText}>No goals yet. Add one below!</Text>}
        keyExtractor={(item) => item.id}
        style={{marginBottom:12}}
        renderItem={({ item }) => {
          const pct = Math.min(100, Math.round((item.current / item.target) * 100));
          return (
            <View style={styles.goalCard}>
              <View style={styles.goalCardHeader}>
                <Text style={styles.goalCardTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => deleteGoal(item.docId)}>
                  <Text style={styles.deleteBtn}>✗</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.goalCardAmount}>${item.current} / ${item.target}</Text>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${pct}%`,
                      backgroundColor: pct === 100 ? '#20b86a' : '#719AFF',
                    },
                  ]}
                />
              </View>
              <Text style={styles.percentText}>{pct}% complete</Text>
            </View>
          );
        }}
      />

      {/* Add Goal Section */}
      <View style={styles.inputCard}>
        <Text style={styles.inputCardTitle}>Add New Goal</Text>
        <TextInput
          value={title}
          placeholder="Goal Name"
          placeholderTextColor="#666"
          onChangeText={setTitle}
          style={styles.input}
        />
        <View style={styles.inputRow}>
          <TextInput
            value={current}
            placeholder="Current $"
            placeholderTextColor="#666"
            keyboardType="numeric"
            onChangeText={setCurrent}
            style={[styles.input, {flex:1, marginRight:8}]}
          />
          <TextInput
            value={target}
            placeholder="Target $"
            placeholderTextColor="#666"
            keyboardType="numeric"
            onChangeText={setTarget}
            style={[styles.input, {flex:1}]}
          />
        </View>
        <Button title={loading ? "Adding..." : "+ Add Goal"} onPress={addGoal} disabled={loading} />
      </View>
      <View style={{height:24}}/>
    </View>
  );
}

const styles = StyleSheet.create({
  screenBg: { flex: 1, backgroundColor: '#f5f7fb' },
  headerWrap: {
    paddingTop: 32,
    paddingBottom: 10,
    backgroundColor: '#719AFF',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 18,
    shadowColor: '#719AFF',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  backButton: { position: 'absolute', top: 32, left: 24, zIndex: 5 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pageTitle: { fontSize: 25, fontWeight: '700', color: '#fff', marginBottom: 2 },
  dateText: { fontSize: 14, color: '#eef2ff' },
  emptyText: { textAlign:'center', margin: 10, color:'#719AFF', fontWeight:'500' },

  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#719AFF',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 1,
    borderColor: '#ebecff',
  },
  goalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems:'center' },
  goalCardTitle: { fontSize: 20, fontWeight: '700', color: '#719AFF' },
  deleteBtn: { fontSize: 20, color: '#ee3232', padding: 2 },
  goalCardAmount: { fontSize: 15, color: '#4e85ee', marginTop: 4, fontWeight: '600', marginBottom:4 },
  progressBg: { height: 8, backgroundColor: '#eee', borderRadius: 5, marginVertical: 7 },
  progressBar: { height: 8, borderRadius: 5, },
  percentText: { color: '#333', fontSize: 13, fontWeight: '400', marginTop:3 },

  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#719AFF',
    shadowOpacity: 0.10,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: '#ebecff',
    marginTop: 6
  },
  inputCardTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#719AFF',
    marginBottom: 12,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fcfcff',
    color: '#222',
  },
  inputRow: { flexDirection: 'row', gap: 0, marginBottom: 6 },
});
