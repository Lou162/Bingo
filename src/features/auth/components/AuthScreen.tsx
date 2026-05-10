import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

export function AuthScreen() {
  const {
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    loading,
    error,
  } = useAuth();
  const [mode, setMode] = useState<"choice" | "signIn" | "signUp">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAnonymous = async () => {
    setSubmitting(true);
    try {
      await signInAnonymously();
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "signUp") {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "choice") {
    return (
      <KeyboardAvoidingView
        className='flex-1 bg-dark-bg'
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={16}>
        <View className='flex-1 justify-center p-6 pb-10'>
          <Text className='text-3xl font-bold text-white text-center mb-2'>
            AperoBingo
          </Text>
          <Text className='text-slate-400 text-center mb-8'>
            Social prediction bingo
          </Text>
          {error ? (
            <Text className='text-red-400 text-center mb-4'>{error}</Text>
          ) : null}
          <TouchableOpacity
            onPress={() => setMode("signIn")}
            className='border border-slate-500 py-4 rounded-xl mb-2'>
            <Text className='text-white text-center'>
              Se connecter avec email
            </Text>
          </TouchableOpacity>
          <GoogleSigninButton
            style={{ width: "100%", minHeight: 56, marginBottom: 8 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            disabled={loading || submitting}
            onPress={handleGoogleSignIn}
          />
          <TouchableOpacity
            onPress={() => setMode("signUp")}
            className='py-4'>
            <Text className='text-slate-400 text-center'>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      className='flex-1 bg-dark-bg'
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={16}>
      <View className='flex-1 justify-center p-6 pb-10'>
        <Text className='text-2xl font-bold text-white mb-6'>
          {mode === "signUp" ? "Créer un compte" : "Connexion"}
        </Text>
        {error ? <Text className='text-red-400 mb-4'>{error}</Text> : null}
        {mode === "signUp" ? (
          <TextInput
            placeholder="Nom d'affichage"
            placeholderTextColor='#94a3b8'
            value={displayName}
            onChangeText={setDisplayName}
            className='bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-4'
          />
        ) : null}
        <TextInput
          placeholder='Email'
          placeholderTextColor='#94a3b8'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          className='bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-4'
        />
        <TextInput
          placeholder='Mot de passe'
          placeholderTextColor='#94a3b8'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className='bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-6'
        />
        <TouchableOpacity
          onPress={handleEmailSubmit}
          disabled={submitting}
          className='bg-slate-600 py-4 rounded-xl mb-4'>
          {submitting ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text className='text-white text-center font-semibold'>
              Valider
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setMode("choice");
          }}>
          <Text className='text-slate-400 text-center'>Retour</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
