import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "./firebaseConfig";

// Helper function to get icon based on category
const getCategoryIcon = (category) => {
  switch (category.toLowerCase()) {
    case "food": return "hamburger";
    case "transport": return "car";
    case "housing": return "home";
    case "entertainment": return "gamepad";
    case "shopping": return "shopping-bag";
    case "health": return "medkit";
    default: return "receipt";
  }
};

// Helper function to get color based on category
const getCategoryColor = (category) => {
  switch (category.toLowerCase()) {
    case "food": return "#49e4a8ff"; // Green for food
    case "transport": return "#3c89fdff"; // Blue for transport
    case "housing": return "#ff3c3cff"; // Red for housing
    case "entertainment": return "#6d34f3ff"; // Purple for entertainment
    case "shopping": return "#fada71ff"; // Yellow for shopping
    case "health": return "#f889f8ff"; // Pink for health
    default: return "#c48220ff"; // Default Brown
  }
};

// Helper function to format the date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function Index() {
  const [balance, setBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState("");
  const [annualIncome, setAnnualIncome] = useState(0);

  const fetchUserDataAndExpenses = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.currentBalance !== undefined && userData.currentBalance !== null) setBalance(userData.currentBalance);
        if (userData.name) setUserName(userData.name);
        if (userData.annualIncome !== undefined && userData.annualIncome !== null) setAnnualIncome(userData.annualIncome);
        if (userData.totalSpent !== undefined && userData.totalSpent !== null) setTotalSpent(userData.totalSpent);
      }

      const expensesRef = collection(db, "users", auth.currentUser.uid, "expenses");
      const expensesQuery = query(expensesRef, orderBy("date", "desc"));
      const expensesSnapshot = await getDocs(expensesQuery);

      const expensesList = [];
      expensesSnapshot.forEach((doc) => {
        const data = doc.data();
        expensesList.push({
          id: doc.id,
          title: data.description || data.category,
          category: data.category,
          amount: data.amount,
          date: data.date,
          icon: getCategoryIcon(data.category),
        });
      });

      setTransactions(expensesList);
    } catch (error) {
      console.error("Failed to fetch user data and expenses:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserDataAndExpenses();
  }, [fetchUserDataAndExpenses]);

  useFocusEffect(
    useCallback(() => {
      fetchUserDataAndExpenses();
    }, [fetchUserDataAndExpenses])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>FinanceWise</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={["#3960E3", "#843CE1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, styles.cardPrimary]}
          >
            <Text style={styles.welcomeTitle}>Welcome, {userName || "User"}! 👋</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Progress this week</Text>
              <Text style={styles.progressValue}>0%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#6F8DF1", "#9F72DB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, styles.cardSecondary]}
          >
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceMeta}>
                Income: ${annualIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.balanceMeta}>
                Spent: ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </LinearGradient>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/balance",
                params: { tx: JSON.stringify(transactions), balance: String(balance), spent: String(totalSpent) },
              })
            }
          >
            <LinearGradient
              colors={["#06dbcdff", "#279bdaff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, styles.chartCard]}
            >
              <MaterialIcons name="bar-chart" size={36} color="#fff" />
              <Text style={styles.chartTitle}>Budget Balance Chart</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.sectionHeader}>Recent Transactions</Text>

          <View style={styles.recentContainer}>
            <ScrollView style={styles.recentList} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
              {transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <FontAwesome5
                      name={transaction.icon}
                      size={18}
                      color={getCategoryColor(transaction.category)}
                    />
                    <View style={styles.transactionTextWrap}>
                      <Text style={styles.transactionTitle}>{transaction.title}</Text>
                      <Text style={styles.transactionSubtitle}>
                        {transaction.category} · {formatDate(transaction.date)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.transactionAmount}>-${transaction.amount.toFixed(2)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.fixedFooter}>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/modal")}>
            <Text style={styles.primaryButtonText}>+ Add Expense</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          <View style={styles.tabItem}>
            <Ionicons name="home" size={22} color="#1f6bff" />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          </View>
          <Pressable style={styles.tabItem} onPress={() => router.push("/lessons")}>
            <Ionicons name="book" size={22} color="#777" />
            <Text style={styles.tabLabel}>Learn</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => router.push("/ai")}>
            <Ionicons name="sparkles" size={22} color="#777" />
            <Text style={styles.tabLabel}>AI Advisor</Text>
          </View>
          <Pressable style={styles.tabItem} onPress={() => router.push("/Goals")}>
            <Ionicons name="flag" size={22} color="#777" />
            <Text style={styles.tabLabel}>Goals</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => router.push("/profile")}>
            <Ionicons name="person" size={22} color="#777" />
            <Text style={styles.tabLabel}>Profile</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fb",
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
    paddingBottom: 16,
    paddingTop: 15,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardPrimary: {},
  cardSecondary: {},
  welcomeTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#eef2ff",
    fontSize: 20,
    fontWeight: "600",
  },
  progressValue: {
    color: "#eef2ff",
    fontSize: 20,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#9db0ff",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "0%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceMeta: {
    color: "#eef2ff",
    fontSize: 16,
  },
  chartCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  chartTitle: {
    marginTop: 8,
    fontWeight: "700",
    color: "#fff",
    fontSize: 18,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111",
  },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecf5",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  transactionTextWrap: {},
  transactionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  transactionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  transactionAmount: {
    fontWeight: "700",
    color: "#111",
  },
  primaryButton: {
    backgroundColor: "#1f6bff",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 75,
    minWidth: 325,
    maxWidth: 325,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
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
  bottomSpacer: {
    height: 0,
    backgroundColor: "transparent",
  },
});
