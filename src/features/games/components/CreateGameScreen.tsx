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

const GRID_OPTIONS = [3, 5] as const;

export function CreateGameScreen({
  serverId,
  onCreated,
  onBack,
}: CreateGameScreenProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [gridSize, setGridSize] = useState<3 | 5>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user?.uid || !name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await createGame(serverId, name.trim(), gridSize, user.uid);
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
      <Text className='text-slate-400 mb-2'>Taille de la grille</Text>
      <View className='flex-row gap-3 mb-6'>
        {GRID_OPTIONS.map((size) => (
          <TouchableOpacity
            key={size}
            onPress={() => setGridSize(size)}
            className={`flex-1 py-4 rounded-xl ${
              gridSize === size
                ? "bg-slate-600"
                : "bg-dark-card border border-dark-border"
            }`}>
            <Text className='text-white text-center font-semibold'>
              {size}x{size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
