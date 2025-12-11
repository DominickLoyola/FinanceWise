import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import React, { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { generateGeminiAdvice } from "../advisors/geminiAdvisor"
import { generateAdvice } from "../advisors/localAdvisor"
import { auth, db } from "./firebaseConfig"

export default function AIAdvisor() {
  const { width } = useWindowDimensions()
  const isSmall = width < 900
  const STORAGE_KEY = "wise:messages:v1"
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm Wise, your AI Financial Advisor. I can help with budgeting, taxes, investments, savings strategies, and more. What would you like to know today?" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [sessionsFS, setSessionsFS] = useState([]) // Firestore sessions: [{id,title,updatedAt,messages}]
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [savingsGoal, setSavingsGoal] = useState(null) // {current, target} or null
  const scrollViewRef = useRef(null)
  const quickQuestionsRef = useRef(null)
  const contentInnerRef = useRef(null)
  const inputRef = useRef(null)
  const [lastUserMessageY, setLastUserMessageY] = useState(0)
  const [quickQuestionsY, setQuickQuestionsY] = useState(0)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    )
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    )
    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

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

  // Fetch savings goal
  useEffect(() => {
    if (!auth.currentUser) return
    const q = query(
      collection(db, "goals"),
      where("userId", "==", auth.currentUser.uid)
    )
    const unsubscribe = onSnapshot(q, (snap) => {
      // Find goal with title containing "Savings" (case-insensitive)
      const savingsGoalDoc = snap.docs.find(doc => {
        const title = doc.data().title?.toLowerCase() || ""
        return title.includes("savings")
      })
      if (savingsGoalDoc) {
        const goal = savingsGoalDoc.data()
        setSavingsGoal({ current: goal.current, target: goal.target })
      } else {
        setSavingsGoal(null)
      }
    }, (error) => {
      console.error("Error fetching savings goal:", error)
    })
    return () => unsubscribe()
  }, [auth.currentUser?.uid])

  // Use Gemini API mode
  const useGemini = true
  
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

  // Track when to scroll to user message
  const [shouldScrollToUserMessage, setShouldScrollToUserMessage] = useState(false)
  
  useEffect(() => {
    if (shouldScrollToUserMessage && lastUserMessageY > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: lastUserMessageY - 50, animated: true })
        setShouldScrollToUserMessage(false)
      }, 200)
    }
  }, [shouldScrollToUserMessage, lastUserMessageY])

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
    setShouldScrollToUserMessage(true) // Trigger scroll to user message
    
    try {
      let answer, sources;
      
      if (useGemini) {
        // Use Gemini API
        console.log("🌟 Using Gemini AI for response...");
        try {
          const geminiResponse = await generateGeminiAdvice(trimmed, userProfile, messages)
          console.log("✅ Gemini response received successfully");
          answer = geminiResponse.answer
          sources = geminiResponse.sources || []
        } catch (geminiError) {
          console.error("❌ Gemini API failed, falling back to local advisor:", geminiError)
          console.error("Fallback triggered due to:", geminiError.message);
          // Fallback to local advisor if Gemini fails
          const localOut = generateAdvice(trimmed, userProfile, messages)
          answer = localOut.answer
          sources = localOut.sources || []
          console.log("📚 Using local advisor response instead");
        }
      } else {
        // Use local advisor only
        console.log("📚 Using local advisor (Gemini disabled)");
        const out = generateAdvice(trimmed, userProfile, messages)
        answer = out.answer
        sources = out.sources || []
      }
      
      const nextMsgs = [...messages, { role: "user", content: trimmed }, { role: "assistant", content: answer, sources }]
      setMessages(nextMsgs)
      // Persist: Firestore if logged in; else localStorage (handled by effect)
      if (auth.currentUser) {
        await saveCurrentFS(nextMsgs, trimmed)
      }
    } catch (e) {
      console.error("AI advisor error:", e)
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
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>FinanceWise</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
      <View style={styles.mainWrap}>
        {/* Sidebar - sessions (if signed in) or message history (guest) */}
        {!isSmall && (
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
        )}
        {isSmall && (
          <>
            <Pressable style={styles.historyFab} onPress={() => setHistoryOpen(true)} hitSlop={8}>
              <Ionicons name="chatbubbles-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>History</Text>
            </Pressable>
            {historyOpen && (
              <View style={styles.drawerOverlay}>
                <View style={styles.drawerPanel}>
                  <View style={styles.drawerHeader}>
                    <Text style={styles.sideHeaderTitle}>History</Text>
                    <Pressable onPress={() => setHistoryOpen(false)} hitSlop={8}>
                      <Ionicons name="close" size={20} color="#334155" />
                    </Pressable>
                  </View>
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sideList} showsVerticalScrollIndicator={false}>
                    {auth.currentUser ? (
                      <>
                        {sessionsFS.map((s) => (
                          <View key={s.id} style={[styles.sideItem, s.id === currentSessionId && { borderColor: "#4f46e5", backgroundColor: "#eef2ff" }]}>
                            <Pressable style={{ flex: 1 }} onPress={() => { selectSessionFS(s.id); setHistoryOpen(false) }}>
                              <Text numberOfLines={1} style={[styles.sideTitle, s.id === currentSessionId && { color: "#1e3a8a" }]}>{s.title || "Untitled"}</Text>
                              <Text style={styles.sideSub}>{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : ""}</Text>
                            </Pressable>
                          </View>
                        ))}
                      </>
                    ) : (
                      <>
                        {messages
                          .filter((m) => m.role === "user")
                          .slice()
                          .reverse()
                          .map((m, idx) => (
                            <Pressable key={idx} style={styles.sideItem} onPress={() => { setInput(m.content); setHistoryOpen(false) }}>
                              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#1e3a8a" />
                              <Text numberOfLines={1} style={styles.sideTitle}>{m.content}</Text>
                            </Pressable>
                          ))}
                      </>
                    )}
                  </ScrollView>
                </View>
              </View>
            )}
          </>
        )}
        {/* Main content */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
        >
        <View ref={contentInnerRef} style={styles.contentInner}>
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
            <View style={[styles.pill, { backgroundColor: "#ecfdf5", minWidth: "97%", maxWidth: "97%" }]}>
              <Text style={[styles.pillLabel, { color: "#047857" }]}>Monthly Income (est.)</Text>
              <Text style={[styles.pillValue, { color: "#065f46" }]}>${Math.round(((userProfile?.annualIncome ?? 0) / 12)).toLocaleString()}</Text>
            </View>
            <Pressable 
              onPress={() => router.push("/Goals")}
              style={[styles.pill, { backgroundColor: "#eff6ff", minWidth: "97%", maxWidth: "97%" }]}
            >
              <Text style={[styles.pillLabel, { color: "#1d4ed8" }]}>Savings Goal</Text>
              <Text style={[styles.pillValue, { color: "#1e40af" }]}>
                {savingsGoal 
                  ? `$${savingsGoal.current.toLocaleString()} / $${savingsGoal.target.toLocaleString()}`
                  : "Set in Goals"
                }
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Questions (always shown) */}
        <View 
          ref={quickQuestionsRef} 
          onLayout={(event) => {
            const { y } = event.nativeEvent.layout
            setQuickQuestionsY(y)
          }}
          style={{ marginBottom: 12 }}
        >
          <Text style={styles.quickTitle}>Quick Questions</Text>
          <View style={styles.quickGrid}>
            {quickQuestions.map((q, idx) => (
              <Pressable
                key={idx}
                onPress={() => handleQuickQuestion(q.text)}
                style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.quickBtnText}>{q.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Chat */}
        {messages.map((m, i) => {
          // Find the index of the last user message
          const lastUserMessageIndex = messages.map((msg, idx) => msg.role === "user" ? idx : -1).filter(idx => idx !== -1).pop()
          const isLastUserMessage = m.role === "user" && i === lastUserMessageIndex
          
          return (
          <View 
            key={i} 
            onLayout={isLastUserMessage ? (event) => {
              const { y } = event.nativeEvent.layout
              // Y position is relative to contentInner, which is what we need for scrolling
              setLastUserMessageY(y)
            } : undefined}
            style={{ flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 10, marginBottom: 10 }}
          >
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
          )
        })}
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
        {messages.length > 1 && (
          <Pressable
            onPress={() => {
              scrollViewRef.current?.scrollTo({ y: quickQuestionsY - 20, animated: true })
            }}
            style={styles.backToQuestionsBtn}
          >
            <Ionicons name="arrow-up-outline" size={16} color="#1e40af" />
            <Text style={styles.backToQuestionsText}>Back to Quick Questions</Text>
          </Pressable>
        )}
        </View>
        </ScrollView>
      </View>

      <View style={[styles.inputRow, keyboardVisible && styles.inputRowKeyboardVisible]}>
        <TextInput
          ref={inputRef}
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
        <View style={styles.tabItem}>
          <Ionicons name="sparkles" size={22} color="#1f6bff" />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>AI Advisor</Text>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ECE9FC" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#ECE9FC",
    borderBottomWidth: 0,
    borderColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTopCentered: { 
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  headerIconWrap: { backgroundColor: "#4f46e5", borderRadius: 12, padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#0f172a", textAlign: "center" },
  headerSubtitle: { fontSize: 14, color: "#475569", textAlign: "center" },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  profileChip: {
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
  content: { paddingHorizontal: 12, paddingBottom: 20, paddingTop: 20 },
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
  overlay: {
    position: "absolute",
    top: -80,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 10,
  },
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingTop: 30, // Add padding to show header buttons
    paddingBottom: 8,
    borderRadius: 0,
    overflow: "hidden",
    position: "absolute",
    marginLeft: 0,
    top: -42, // Align with new shorter header
    bottom: -139, // stop just above bottom navigation
    left: 0,
    zIndex: 20,
  },
  historyFab: {
    position: "absolute",
    left: 10,
    top: 0,
    backgroundColor: "#4f46e5",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 5,
  },
  drawerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 10,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 10,
  },
  drawerPanel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
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
  sideList: { paddingHorizontal: 8, paddingTop: 12, gap: 8 },
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
    marginTop: 16,
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
    gap: 0,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    flexBasis: "48%",
    maxWidth: "48%",
    justifyContent: "center",
    minHeight: 44,
  },
  quickBtnText: { fontSize: 13, color: "#1e3a8a", fontWeight: "700", textAlign: "center", textAlignVertical: "center" },
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
    paddingBottom: 8,
    marginBottom: 80,
    alignSelf: "center",
    width: "100%",
    maxWidth: 720,
  },
  inputRowKeyboardVisible: {
    marginBottom: 8,
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


