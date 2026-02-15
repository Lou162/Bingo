import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

export function AuthScreen() {
  const {
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
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
      <View className='flex-1 bg-dark-bg justify-center p-6'>
        <Text className='text-3xl font-bold text-white text-center mb-2'>
          NightBingo
        </Text>
        <Text className='text-slate-400 text-center mb-8'>
          Social prediction bingo
        </Text>
        {error ? (
          <Text className='text-red-400 text-center mb-4'>{error}</Text>
        ) : null}
        <TouchableOpacity
          onPress={handleAnonymous}
          disabled={loading || submitting}
          className='bg-slate-600 py-4 rounded-xl mb-4'>
          {submitting ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text className='text-white text-center font-semibold'>
              Continuer en anonyme
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode("signIn")}
          className='border border-slate-500 py-4 rounded-xl mb-2'>
          <Text className='text-white text-center'>
            Se connecter avec email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode("signUp")}
          className='py-4'>
          <Text className='text-slate-400 text-center'>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-dark-bg justify-center p-6'>
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
          <Text className='text-white text-center font-semibold'>Valider</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setMode("choice");
          setError(null);
        }}>
        <Text className='text-slate-400 text-center'>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}
