import React, { useEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { auth, db } from "./firebaseConfig"
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, onSnapshot, orderBy, query } from "firebase/firestore"
import { generateAdvice } from "../advisors/localAdvisor"

export default function AIAdvisor() {
  const STORAGE_KEY = "wise:messages:v1"
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm Wise, your AI Financial Advisor. I can help with budgeting, taxes, investments, savings strategies, and more. What would you like to know today?" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [sessionsFS, setSessionsFS] = useState([]) // Firestore sessions: [{id,title,updatedAt,messages}]
  const [currentSessionId, setCurrentSessionId] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!auth.currentUser) return
      try {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid))
        if (snap.exists()) {
          setUserProfile(snap.data())
        }
      } catch (e) {
        console.error("AI profile fetch failed:", e)
      }
    }
    fetchProfile()
  }, [])

  // Local-only mode
  const canUseOpenAI = false
  
  // Load saved conversation (web localStorage). Keeps last 100 messages.
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
          }
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const toSave = messages.slice(-100)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      }
    } catch {}
  }, [messages])

  // Subscribe to Firestore sessions when logged in
  useEffect(() => {
    if (!auth.currentUser) return
    const uid = auth.currentUser.uid
    const ref = collection(db, "users", uid, "wiseSessions")
    const q = query(ref, orderBy("updatedAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      const list = []
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() || {}) }))
      setSessionsFS(list)
      if (!currentSessionId && list.length) {
        setCurrentSessionId(list[0].id)
        if (Array.isArray(list[0].messages)) setMessages(list[0].messages)
      } else {
        // keep current messages in sync if the doc changed
        const curr = list.find((s) => s.id === currentSessionId)
        if (curr && Array.isArray(curr.messages)) setMessages(curr.messages)
      }
    })
    return () => unsub()
  }, [auth.currentUser?.uid])

  const createSessionFS = async () => {
    if (!auth.currentUser) return
    const uid = auth.currentUser.uid
    const ref = collection(db, "users", uid, "wiseSessions")
    const docRef = await addDoc(ref, {
      title: "New Chat",
      updatedAt: Date.now(),
      messages: [{ role: "assistant", content: "New chat started. How can I help?" }],
    })
    setCurrentSessionId(docRef.id)
  }
  const selectSessionFS = async (id) => {
    setCurrentSessionId(id)
    const sess = sessionsFS.find((s) => s.id === id)
    if (sess && Array.isArray(sess.messages)) setMessages(sess.messages)
  }
  const deleteSessionFS = async (id) => {
    if (!auth.currentUser) return
    const uid = auth.currentUser.uid
    await deleteDoc(doc(db, "users", uid, "wiseSessions", id))
    if (currentSessionId === id) setCurrentSessionId(null)
  }
  const saveCurrentFS = async (msgs, firstUserText) => {
    if (!auth.currentUser || !currentSessionId) return
    const uid = auth.currentUser.uid
    const dref = doc(db, "users", uid, "wiseSessions", currentSessionId)
    const titleUpdate =
      firstUserText && (sessionsFS.find((s) => s.id === currentSessionId)?.title === "New Chat")
        ? (firstUserText.length > 60 ? firstUserText.slice(0, 60) + "…" : firstUserText)
        : undefined
    const payload = { updatedAt: Date.now(), messages: msgs.slice(-100) }
    if (titleUpdate) payload.title = titleUpdate
    try {
      await updateDoc(dref, payload)
    } catch {
      // If doc missing (first send), create it
      await updateDoc(dref, payload).catch(async () => {
        await addDoc(collection(db, "users", uid, "wiseSessions"), {
          title: titleUpdate || "New Chat",
          updatedAt: Date.now(),
          messages: msgs.slice(-100),
        })
      })
    }
  }

  // Curated quick questions for demo coverage (local knowledge)
  const quickQuestions = [
    { icon: "calculator-outline", text: "How do I start a budget?" },
    { icon: "cash-outline", text: "How big should my emergency fund be?" },
    { icon: "document-text-outline", text: "APR vs APY — what’s the difference?" },
    { icon: "trending-up-outline", text: "How does compound interest work?" },
    { icon: "trending-up-outline", text: "Should I use index funds/ETFs?" },
    { icon: "document-text-outline", text: "What is a Roth IRA?" },
    { icon: "calculator-outline", text: "How much should I save for retirement?" },
    { icon: "document-text-outline", text: "Snowball vs avalanche debt payoff?" },
    { icon: "document-text-outline", text: "Rent vs buy — how to decide?" },
    { icon: "document-text-outline", text: "What is the SAVE plan for student loans?" },
  ]

  const handleQuickQuestion = (qText) => {
    if (loading) return
    setInput(qText)
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    setMessages((prev) => [...prev, { role: "user", content: trimmed }])
    setInput("")
    setLoading(true)
    try {
      // Local advisor only
      const out = generateAdvice(trimmed, userProfile, messages)
      const answer = out.answer
      const sources = out.sources || []
      const nextMsgs = [...messages, { role: "user", content: trimmed }, { role: "assistant", content: answer, sources }]
      setMessages(nextMsgs)
      // Persist: Firestore if logged in; else localStorage (handled by effect)
      if (auth.currentUser) {
        await saveCurrentFS(nextMsgs, trimmed)
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I ran into an issue answering that. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopCentered}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Wise</Text>
          
        </View>
        <View style={styles.profileChip}>
          <Ionicons name="person" size={14} color="#166534" />
          <Text style={styles.profileChipText}>Profile {userProfile ? "Active" : "Not Signed In"}</Text>
        </View>
      </View>

      <View style={styles.mainWrap}>
        {/* Sidebar - sessions (if signed in) or message history (guest) */}
        <View style={styles.sidebar}>
          {auth.currentUser ? (
            <>
              <View style={styles.sideHeader}>
                <Text style={styles.sideHeaderTitle}>Chats</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Pressable onPress={createSessionFS} hitSlop={8} style={{ padding: 4 }}>
                    <Ionicons name="add-circle-outline" size={18} color="#4f46e5" />
                  </Pressable>
                  <Pressable onPress={() => setMessages([{ role: "assistant", content: "Conversation cleared. How can I help?" }])} hitSlop={8} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color="#64748b" />
                  </Pressable>
                </View>
              </View>
              <ScrollView style={styles.sideScroll} contentContainerStyle={styles.sideList} showsVerticalScrollIndicator={false}>
                {sessionsFS.map((s) => (
                  <View key={s.id} style={[styles.sideItem, s.id === currentSessionId && { borderColor: "#4f46e5", backgroundColor: "#eef2ff" }]}>
                    <Pressable style={{ flex: 1 }} onPress={() => selectSessionFS(s.id)}>
                      <Text numberOfLines={1} style={[styles.sideTitle, s.id === currentSessionId && { color: "#1e3a8a" }]}>{s.title || "Untitled"}</Text>
                      <Text style={styles.sideSub}>{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : ""}</Text>
                    </Pressable>
                    <Pressable onPress={() => deleteSessionFS(s.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={14} color="#64748b" />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <View style={styles.sideHeader}>
                <Text style={styles.sideHeaderTitle}>History</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Pressable onPress={() => setMessages([{ role: "assistant", content: "New chat started. How can I help?" }])} hitSlop={8} style={{ padding: 4 }}>
                    <Ionicons name="add-circle-outline" size={18} color="#4f46e5" />
                  </Pressable>
                  <Pressable onPress={() => setMessages([{ role: "assistant", content: "Conversation cleared. How can I help?" }])} hitSlop={8} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color="#64748b" />
                  </Pressable>
                </View>
              </View>
              <ScrollView style={styles.sideScroll} contentContainerStyle={styles.sideList} showsVerticalScrollIndicator={false}>
                {messages
                  .filter((m) => m.role === "user")
                  .slice()
                  .reverse()
                  .map((m, idx) => (
                    <Pressable key={idx} style={styles.sideItem} onPress={() => setInput(m.content)}>
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color="#1e3a8a" />
                      <Text numberOfLines={1} style={styles.sideTitle}>{m.content}</Text>
                    </Pressable>
                  ))}
              </ScrollView>
            </>
          )}
        </View>
        {/* Main content */}
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentInner}>
        {/* Profile summary (approximate using available fields) */}
        <View style={styles.profileCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#2563eb" />
            <Text style={styles.profileTitle}>Your Financial Profile</Text>
          </View>
          <View style={styles.profileGrid}>
            <View style={[styles.pill, { backgroundColor: "#f1f5f9" }]}>
              <Text style={styles.pillLabel}>Annual Income</Text>
              <Text style={styles.pillValue}>${(userProfile?.annualIncome ?? 0).toLocaleString()}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: "#f1f5f9" }]}>
              <Text style={styles.pillLabel}>Current Balance</Text>
              <Text style={styles.pillValue}>${(userProfile?.currentBalance ?? 0).toLocaleString()}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: "#ecfdf5" }]}>
              <Text style={[styles.pillLabel, { color: "#047857" }]}>Monthly Income (est.)</Text>
              <Text style={[styles.pillValue, { color: "#065f46" }]}>${Math.round(((userProfile?.annualIncome ?? 0) / 12)).toLocaleString()}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: "#eff6ff" }]}>
              <Text style={[styles.pillLabel, { color: "#1d4ed8" }]}>Savings Goal</Text>
              <Text style={[styles.pillValue, { color: "#1e40af" }]}>Set in Profile</Text>
            </View>
          </View>
        </View>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.quickTitle}>Quick Questions</Text>
            <View style={styles.quickGrid}>
              {quickQuestions.map((q, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleQuickQuestion(q.text)}
                  style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.85 }]}
                >
                  <Ionicons name={q.icon} size={18} color="#1e40af" />
                  <Text style={styles.quickBtnText}>{q.text}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Chat */}
        {messages.map((m, i) => (
          <View key={i} style={{ flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 10, marginBottom: 10 }}>
            <View style={[styles.avatar, m.role === "assistant" ? styles.avatarAssistant : styles.avatarUser]}>
              {m.role === "assistant" ? (
                <Ionicons name="sparkles" size={16} color="#fff" />
              ) : (
                <Ionicons name="person" size={16} color="#fff" />
              )}
            </View>
            <View style={{ flex: 1, alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <View style={[styles.bubble, m.role === "assistant" ? styles.bubbleAssistant : styles.bubbleUser]}>
                <Text style={[styles.messageText, m.role === "user" ? { color: "#fff" } : null]}>{m.content}</Text>
                {Array.isArray(m.sources) && m.sources.length > 0 && (
                  <View style={styles.sourcesWrap}>
                    <Text style={styles.sourcesTitle}>Sources:</Text>
                    {m.sources.map((s, idx) => (
                      <Pressable key={idx} onPress={() => Linking.openURL(s.url)} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="open-outline" size={12} color="#2563eb" />
                        <Text style={styles.sourceLink}>{s.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
        {loading && (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <View style={[styles.avatar, styles.avatarAssistant]}>
              <Ionicons name="sparkles" size={16} color="#fff" />
            </View>
            <View style={[styles.bubble, styles.bubbleAssistant]}>
              <ActivityIndicator size="small" color="#1f6bff" />
            </View>
          </View>
        )}
        </View>
        </ScrollView>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about money..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          editable={!loading}
          returnKeyType="send"
        />
        <Pressable style={styles.sendBtn} onPress={handleSend} disabled={loading}>
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
      <View style={{ height: 10 }} />

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
        <View style={styles.tabItem}>
          <Ionicons name="sparkles" size={22} color="#1f6bff" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>AI Advisor</Text>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ede9fe" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#ede9fe",
    borderBottomWidth: 0,
    borderColor: "transparent",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerTopCentered: { alignItems: "center", gap: 6, width: "100%" },
  headerIconWrap: { backgroundColor: "#4f46e5", borderRadius: 12, padding: 8 },
  headerTitle: { fontSize: 28, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  headerSubtitle: { fontSize: 14, color: "#475569", textAlign: "center" },
  profileChip: {
    position: "absolute",
    right: 16,
    top: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  profileChipText: { fontSize: 12, color: "#166534", fontWeight: "600" },
  content: { paddingHorizontal: 12, paddingBottom: 16, paddingTop: 12 },
  contentInner: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  mainWrap: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
    width: "100%",
    alignSelf: "stretch",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    position: "relative",
  },
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 0,
    overflow: "hidden",
    position: "absolute",
    marginLeft: 0,
    top: -93, // align near the "Profile not signed in" chip
    bottom: -139, // stop just above bottom navigation
    left: 0,
    zIndex: 1,
  },
  sideScroll: { flex: 1 },
  sideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 4,
  },
  sideHeaderTitle: { fontWeight: "800", color: "#334155", fontSize: 14 },
  sideList: { paddingHorizontal: 8, gap: 8 },
  sideItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e9ecf5",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  sideTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a", flexShrink: 1 },
  leftSpacer: { width: 0 },
  rightSpacer: { width: 260 },
  profileCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignSelf: "center",
  },
  profileTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: { borderRadius: 14, padding: 14, minWidth: "47%" },
  pillLabel: { fontSize: 13, color: "#334155", marginBottom: 6 },
  pillValue: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  quickTitle: { fontSize: 14, fontWeight: "800", color: "#334155", marginBottom: 10, paddingHorizontal: 4, textAlign: "center" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    flexBasis: "48%",
    maxWidth: "48%",
    justifyContent: "center",
  },
  quickBtnText: { fontSize: 13, color: "#1e3a8a", fontWeight: "700" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarAssistant: { backgroundColor: "#4f46e5" },
  avatarUser: { backgroundColor: "#334155" },
  bubble: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    maxWidth: "95%",
    borderWidth: 1,
  },
  bubbleAssistant: { backgroundColor: "#f8fafc", borderColor: "#e5e7eb" },
  bubbleUser: { backgroundColor: "#2563eb", borderColor: "#1d4ed8" },
  messageText: { color: "#0f172a", lineHeight: 22, fontSize: 16 },
  sourcesWrap: { marginTop: 10, gap: 6, borderTopWidth: 1, borderColor: "#e5e7eb", paddingTop: 8 },
  sourcesTitle: { fontSize: 12, fontWeight: "800", color: "#334155" },
  sourceLink: { color: "#2563eb", textDecorationLine: "underline", fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    marginBottom: 140,
    alignSelf: "center",
    width: "100%",
    maxWidth: 720,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    marginRight: 8,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sendBtn: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
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
  tabItem: { alignItems: "center", gap: 4 },
  tabLabel: { fontSize: 11, color: "#777" },
  tabLabelActive: { color: "#1f6bff", fontWeight: "700" },
})


