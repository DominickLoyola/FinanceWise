"use client"

import { router, Stack } from "expo-router"
import { useContext, useEffect, useState } from "react"
import { AuthContext, AuthProvider } from "../contexts/AuthContext"

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
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  )
}

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="home" />
        <Stack.Screen name="balance" />
        <Stack.Screen name="lessons" />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: "modal",
            headerShown: false 
          }} 
        />
      </Stack>
    </AuthProvider>
  )
}
