import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "./firebaseConfig";

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  docId: string;
}

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

  async function deleteGoal(docId: string) {
    if (!docId) return;
    try {
      await deleteDoc(doc(db, "goals", docId));
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error deleting goal. Please try again.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Financial Goals</Text>
        
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={80}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {goals.length === 0 ? (
              <Text style={styles.emptyText}>No goals yet. Add one below!</Text>
            ) : (
              <View style={{ marginBottom: 12 }}>
                {goals.map((item) => {
                  const pct = Math.min(100, Math.round((item.current / item.target) * 100));
                  return (
                    <View key={item.id} style={styles.goalCard}>
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
                              backgroundColor: pct === 100 ? "#20b86a" : "#719AFF",
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.percentText}>{pct}% complete</Text>
                    </View>
                  );
                })}
              </View>
            )}
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
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                />
                <TextInput
                  value={target}
                  placeholder="Target $"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  onChangeText={setTarget}
                  style={[styles.input, { flex: 1 }]}
                />
              </View>
              <Button title={loading ? "Adding..." : "+ Add Goal"} onPress={addGoal} disabled={loading} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Navigation */}
        <View style={styles.tabBar}>
        <Pressable style={styles.tabItem} onPress={() => router.push("/home")}>  
          <Ionicons name="home" size={22} color="#777" />
          <Text style={styles.tabLabel}>Home</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => router.push("/lessons")}>  
          <Ionicons name="book" size={22} color="#777" />
          <Text style={styles.tabLabel}>Learn</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => router.push("/ai")}>  
          <Ionicons name="sparkles" size={22} color="#777" />
          <Text style={styles.tabLabel}>AI Advisor</Text>
        </Pressable>
        <View style={styles.tabItem}>
          <Ionicons name="flag" size={22} color="#1f6bff" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Goals</Text>
        </View>
        <Pressable style={styles.tabItem} onPress={() => router.push("/profile")}>  
          <Ionicons name="person" size={22} color="#777" />
          <Text style={styles.tabLabel}>Profile</Text>
        </Pressable>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ECE9FC",
  },
  container: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 35,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 75,
    paddingTop: 12,
  },
  emptyText: { textAlign: "center", margin: 10, color: "#719AFF", fontWeight: "500" },
  goalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#719AFF",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderWidth: 1,
    borderColor: "#ebecff",
  },
  goalCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalCardTitle: { fontSize: 20, fontWeight: "700", color: "#719AFF" },
  deleteBtn: { fontSize: 20, color: "#ee3232", padding: 2 },
  goalCardAmount: { fontSize: 15, color: "#4e85ee", marginTop: 4, fontWeight: "600", marginBottom: 4 },
  progressBg: { height: 8, backgroundColor: "#eee", borderRadius: 5, marginVertical: 7 },
  progressBar: { height: 8, borderRadius: 5 },
  percentText: { color: "#333", fontSize: 13, fontWeight: "400", marginTop: 3 },
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#719AFF",
    shadowOpacity: 0.1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#ebecff",
    marginTop: 6,
  },
  inputCardTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#719AFF",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#fcfcff",
    color: "#222",
  },
  inputRow: { flexDirection: "row", gap: 0, marginBottom: 6 },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    height: 64,
    zIndex: 10,
  },
  tabItem: {
    alignItems: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: "#777",
  },
  tabLabelActive: {
    color: "#1f6bff",
    fontWeight: "700",
  },
});
