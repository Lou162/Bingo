import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../auth";
import { createGame } from "../services/gameService";

interface CreateGameScreenProps {
  serverId: string;
  onCreated: () => void;
  onBack: () => void;
}

export function CreateGameScreen({
  serverId,
  onCreated,
  onBack,
}: CreateGameScreenProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [maxCells, setMaxCells] = useState(9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user?.uid || !name.trim()) return;
    if (!maxCells || maxCells < 1) {
      setError("Nombre max de cases invalide");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createGame(serverId, name.trim(), maxCells, user.uid);
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
        Nouvelle partie
      </Text>
      {error ? <Text className='text-red-400 mb-4'>{error}</Text> : null}
      <TextInput
        placeholder='Nom de la partie'
        placeholderTextColor='#94a3b8'
        value={name}
        onChangeText={setName}
        className='bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-6'
      />
      <Text className='text-slate-400 mb-2'>Nombre maximum de cases</Text>
      <TextInput
        placeholder='9'
        placeholderTextColor='#94a3b8'
        value={String(maxCells)}
        keyboardType='numeric'
        onChangeText={(value) => {
          const numberValue = Number(value.replace(/[^0-9]/g, ""));
          setMaxCells(isNaN(numberValue) ? 0 : numberValue);
        }}
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
