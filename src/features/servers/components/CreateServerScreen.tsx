import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../auth";
import { createServer } from "../services/serverService";

interface CreateServerScreenProps {
  onCreated: () => void;
  onBack: () => void;
}

export function CreateServerScreen({
  onCreated,
  onBack,
}: CreateServerScreenProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user?.uid || !name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await createServer(name.trim(), user.uid);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 bg-dark-bg p-6 pt-14'>
      <Text className='text-2xl font-bold text-white mb-6'>
        Créer un serveur
      </Text>
      {error ? <Text className='text-red-400 mb-4'>{error}</Text> : null}
      <TextInput
        placeholder='Nom du serveur'
        placeholderTextColor='#94a3b8'
        value={name}
        onChangeText={setName}
        className='bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-6'
      />
      <TouchableOpacity
        onPress={handleCreate}
        disabled={loading || !name.trim()}
        className='bg-slate-600 py-4 rounded-xl mb-4'>
        {loading ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text className='text-white text-center font-semibold'>Créer</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack}>
        <Text className='text-slate-400 text-center'>Retour</Text>
      </TouchableOpacity>
    </View>
  );
}
