"use client"

import { Stack } from "expo-router"
import { AuthProvider, AuthContext } from "../contexts/AuthContext"
import { useContext, useEffect, useState } from "react"
import { router } from "expo-router"

function RootLayoutNav() {
  const { isLoggedIn } = useContext(AuthContext)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (isLoggedIn) {
      router.replace("/home")
    } else {
      router.replace("/auth")
    }
  }, [isLoggedIn, mounted])

  return (
    <Stack>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="balance" options={{ headerShown: false }} />
      <Stack.Screen name="lessons" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  )
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
