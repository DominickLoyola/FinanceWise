"use client"

import { useContext, useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../contexts/AuthContext"
import { router } from "expo-router"
import { auth } from "./firebaseConfig" 
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"

export default function Auth() {
  const { login } = useContext(AuthContext)

  const [mode, setMode] = useState("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [currentBalance, setCurrentBalance] = useState("")
  const [annualIncome, setAnnualIncome] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [signInError, setSignInError] = useState("")
  const [signUpError, setSignUpError] = useState("")

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSignIn = async () => {
    setSignInError("")
    if (!email || !password) {
      setSignInError("Please fill in all fields")
      return
    }
    if (!validateEmail(email)) {
      setSignInError("Please enter a valid email")
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      login()
      router.replace("/home")
    } catch (error) {
      console.error("Sign In Error:", error)
      let message = "An error occurred. Please try again."
      switch (error.code) {
        case "auth/user-not-found":
          message = "The email address is not registered."
          break
        case "auth/wrong-password":
          message = "The password is incorrect."
          break
        case "auth/invalid-email":
          message = "The email address is invalid."
          break
        case "auth/user-disabled":
          message = "This user account has been disabled."
          break
        case "auth/too-many-requests":
          message = "Too many failed login attempts. Please try again later."
          break
        default:
          message = error.message
      }
      setSignInError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setSignUpError("")
    if (!name || !email || !password || !confirmPassword || !currentBalance || !annualIncome) {
      setSignUpError("Please fill in all fields")
      return
    }
    if (!validateEmail(email)) {
      setSignUpError("Please enter a valid email")
      return
    }
    if (password.length < 6) {
      setSignUpError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setSignUpError("Passwords do not match")
      return
    }
    if (isNaN(Number(currentBalance))) {
      setSignUpError("Current balance must be a numeric value")
      return
    }
    if (isNaN(Number(annualIncome))) {
      setSignUpError("Annual income must be a numeric value")
      return
    }
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      login()
      router.replace("/home")
    } catch (error) {
      console.error("Sign Up Error:", error)
      let message = "An error occurred. Please try again."
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "That email address is already in use."
          break
        case "auth/invalid-email":
          message = "The email address is invalid."
          break
        case "auth/operation-not-allowed":
          message = "Operation not allowed. Please contact support."
          break
        case "auth/weak-password":
          message = "The password is too weak."
          break
        default:
          message = error.message
      }
      setSignUpError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require("../assets/images/FW-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>FinanceWise</Text>
            <Text style={styles.tagline}>Manage Your Money Wisely</Text>
          </View>

          <View style={styles.formContainer}>
            {mode === "signin" ? (
              <>
                {signInError ? (
                  <Text style={styles.errorText}>{signInError}</Text>
                ) : null}
                <Text style={styles.formTitle}>Welcome Back</Text>
                <Text style={styles.formSubtitle}>
                  Sign in to your account to continue
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#999"
                      />
                    </Pressable>
                  </View>
                </View>
                <Pressable style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </Pressable>
                <Pressable
                  onPress={handleSignIn}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && !loading && styles.submitButtonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={["#2da4ff", "#1b3aa9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? "Signing In..." : "Sign In"}
                    </Text>
                  </LinearGradient>
                </Pressable>
                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <Pressable onPress={() => setMode("signup")}>
                    <Text style={{ color: "#3960E3", fontWeight: "700" }}>
                      Don't have an account? Sign Up
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                {signUpError ? (
                  <Text style={styles.errorText}>{signUpError}</Text>
                ) : null}
                <Text style={styles.formTitle}>Create Account</Text>
                <Text style={styles.formSubtitle}>Join FinanceWise today</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      value={name}
                      onChangeText={setName}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Current Balance Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Current Balance</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your current balance"
                      value={currentBalance}
                      onChangeText={setCurrentBalance}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Annual Income Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Annual Income</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="wallet-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your annual income"
                      value={annualIncome}
                      onChangeText={setAnnualIncome}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#999"
                      />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      editable={!loading}
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#999"
                      />
                    </Pressable>
                  </View>
                </View>
                <Pressable
                  onPress={handleSignUp}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && !loading && styles.submitButtonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={["#2da4ff", "#1b3aa9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Text>
                  </LinearGradient>
                </Pressable>
                <Text style={styles.termsText}>
                  By signing up, you agree to our Terms and Conditions
                </Text>
                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <Pressable onPress={() => setMode("signin")}>
                    <Text style={{ color: "#3960E3", fontWeight: "700" }}>
                      Already have an account? Sign In
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoSection: {
    alignItems: "center",
    marginVertical: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1b3aa9",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1b3aa9",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  forgotPassword: {
    marginBottom: 24,
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 13,
    color: "#2da4ff",
    fontWeight: "600",
  },
  submitButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
})
