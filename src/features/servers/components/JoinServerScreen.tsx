import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../auth";
import { joinServerByCode } from "../services/serverService";

interface JoinServerScreenProps {
  onJoined: () => void;
  onBack: () => void;
}

export function JoinServerScreen({ onJoined, onBack }: JoinServerScreenProps) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!user?.uid || !code.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await joinServerByCode(code.trim(), user.uid);
      onJoined();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 bg-dark-bg p-6 pt-14'>
      <Text className='text-2xl font-bold text-white mb-6'>
        Rejoindre un serveur
      </Text>
      {error ? <Text className='text-red-400 mb-4'>{error}</Text> : null}
      <TextInput
        placeholder='Ex. ABC123'
        placeholderTextColor='#94a3b8'
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase().slice(0, 6))}
        autoCapitalize='characters'
        autoCorrect={false}
        maxLength={6}
        className='bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-6 font-mono text-lg'
      />
      <TouchableOpacity
        onPress={handleJoin}
        disabled={loading || !code.trim()}
        className='bg-slate-600 py-4 rounded-xl mb-4'>
        {loading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text className='text-white text-center font-semibold'>
            Rejoindre
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack}>
        <Text className='text-slate-400 text-center'>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}
