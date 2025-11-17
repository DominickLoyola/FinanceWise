"use client"

import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { signOut } from "firebase/auth"
import { useContext, useEffect, useState } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AuthContext } from "../contexts/AuthContext"
import { auth } from "./firebaseConfig"

export default function Profile() {
  const { logout } = useContext(AuthContext)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    {/* Get current user info from Firebase */}
    const user = auth.currentUser
    if (user) {
      setUserName(user.displayName || "User")
      setUserEmail(user.email || "")
    }
  }, [])

  {/* Function for user's initials */}
  const getInitials = (name) => {
    if (!name) return "U"
    const names = name.trim().split(" ")
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase()
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      logout()
      router.replace("/auth")
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

  const menuItems = [
    { id: 1, icon: "card-outline", label: "Bank account settings", action: null },
    { id: 2, icon: "person-outline", label: "Personal information", action: null },
    { id: 3, icon: "shield-checkmark-outline", label: "Security & privacy", action: null },
    { id: 4, icon: "notifications-outline", label: "Notifications", action: null },
    { id: 5, icon: "help-circle-outline", label: "Help & support", action: null },
    { id: 6, icon: "log-out-outline", label: "Log out", action: handleLogout, isDestructive: true },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Financial Profile</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <LinearGradient
            colors={["#4da7ceff", "#65cec9ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileSection}
          >
            <View style={styles.profilePictureContainer}>
              <View style={styles.profilePicture}>
                <Text style={styles.profileInitials}>{getInitials(userName)}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>
          </LinearGradient>

          {/* Profile Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={item.action || undefined}
                disabled={!item.action}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={item.isDestructive ? "#ff3c3c" : "#1b3aa9"}
                    style={styles.menuIcon}
                  />
                  <Text
                    style={[
                      styles.menuLabel,
                      item.isDestructive && styles.menuLabelDestructive,
                      !item.action && styles.menuLabelDisabled,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                {item.action && (
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color={item.isDestructive ? "#ff3c3c" : "#999"}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>

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
          <Pressable style={styles.tabItem} onPress={() => router.push("/Goals")}>
            <Ionicons name="flag" size={22} color="#777" />
            <Text style={styles.tabLabel}>Goals</Text>
          </Pressable>
          <View style={styles.tabItem}>
            <Ionicons name="person" size={22} color="#1f6bff" />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Profile</Text>
          </View>
        </View>
        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  )
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
    paddingTop: 15,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  profilePictureContainer: {
    marginRight: 16,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e9ecf5",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItemPressed: {
    backgroundColor: "#f9fafb",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    flex: 1,
  },
  menuLabelDestructive: {
    color: "#ff3c3c",
  },
  menuLabelDisabled: {
    color: "#999",
    fontWeight: "500",
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
})

