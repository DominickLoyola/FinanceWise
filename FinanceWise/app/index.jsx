import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Start() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>


        <Image
          source={require('../assets/images/FW-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Pressable
          onPress={() => router.replace('/home')}
          style={({ pressed }) => [styles.enterButton, pressed && styles.enterButtonPressed]}
        >
          <LinearGradient
            colors={['#2da4ff', '#1b3aa9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.enterText}>Enter</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  logo: {
    width: 375,
    height: 375,
    marginVertical: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  brandPrimary: {
    fontSize: 40,
    fontWeight: '900',
    color: '#2da4ff', // left side of gradient look
  },
  brandSecondary: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1b3aa9', // darker blue to emulate gradient end
  },
  enterButton: {
    borderRadius: 28,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  enterButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  enterText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  gradientButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


