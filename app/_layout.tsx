import { Stack } from "expo-router"
import { AuthProvider } from "../contexts/AuthContext"

export default function RootLayout() {
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
