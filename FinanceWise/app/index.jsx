import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Title */}
        <Text style={styles.title}>FinanceWise</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Welcome Card */}
          <View style={[styles.card, styles.cardPrimary]}>
            <Text style={styles.welcomeTitle}>Welcome back, User! 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              You're doing great! Let's continue your financial journey.
            </Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Progress this week</Text>
              <Text style={styles.progressValue}>75%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={styles.progressBarFill} />
            </View>
          </View>

          {/* Balance Card */}
          <View style={[styles.card, styles.cardSecondary]}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>$2,020.15</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceMeta}>Income: $X,XXX.XX</Text>
              <Text style={styles.balanceMeta}>Spent: $115.00</Text>
            </View>
          </View>

          {/* Budget Chart Placeholder */}
          <View style={styles.chartCard}>
            <MaterialIcons name="bar-chart" size={32} color="#111" />
            <Text style={styles.chartTitle}>Budget Balance Chart</Text>
          </View>

          {/* Recent Transactions */}
          <Text style={styles.sectionHeader}>Recent Transactions</Text>

          <View style={styles.transactionCard}>
            <View style={styles.transactionLeft}>
              <FontAwesome5 name="hamburger" size={18} color="#b36c2e" />
              <View style={styles.transactionTextWrap}>
                <Text style={styles.transactionTitle}>Burger King</Text>
                <Text style={styles.transactionSubtitle}>Food · Yesterday</Text>
              </View>
            </View>
            <Text style={styles.transactionAmount}>-$10.00</Text>
          </View>

          {/* Add Expense Button */}
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>+ Add Expense</Text>
          </Pressable>
        </ScrollView>

        {/* Bottom Navigation (mock) */}
        <View style={styles.tabBar}>
          <View style={styles.tabItem}>
            <Ionicons name="home" size={22} color="#1f6bff" />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          </View>
          <View style={styles.tabItem}>
            <Ionicons name="book" size={22} color="#777" />
            <Text style={styles.tabLabel}>Learn</Text>
          </View>
          <View style={styles.tabItem}>
            <Ionicons name="sparkles" size={22} color="#777" />
            <Text style={styles.tabLabel}>AI Advisor</Text>
          </View>
          <View style={styles.tabItem}>
            <Ionicons name="flag" size={22} color="#777" />
            <Text style={styles.tabLabel}>Goals</Text>
          </View>
          <View style={styles.tabItem}>
            <Ionicons name="person" size={22} color="#777" />
            <Text style={styles.tabLabel}>Profile</Text>
          </View>
        </View>
        {/* Bottom spacer so icons are not too close to bottom */}
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
    fontSize: 22,
    fontWeight: "700",
    marginTop: 15, // extra line so title isn't too close to top of phone
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardPrimary: {
    backgroundColor: "#5b7cfa",
  },
  cardSecondary: {
    backgroundColor: "#8a7cf6",
  },
  welcomeTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    color: "#eef2ff",
    fontSize: 13,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#eef2ff",
    fontSize: 12,
  },
  progressValue: {
    color: "#eef2ff",
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#9db0ff",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "75%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 16,
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
    fontSize: 12,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9ecf5",
  },
  chartTitle: {
    marginTop: 8,
    fontWeight: "700",
    color: "#111",
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
  transactionTextWrap: {
    
  },
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
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 0,
    borderTopWidth: 3,
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
