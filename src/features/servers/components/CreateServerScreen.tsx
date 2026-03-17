import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Share,
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
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user?.uid || !name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const code = await createServer(name.trim(), user.uid);
      setCreatedCode(code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!createdCode) return;
    try {
      await Share.share({
        message: `Rejoins mon serveur NightBingo avec le code : ${createdCode}`,
        title: "Code serveur NightBingo",
      });
    } catch {
      // annulé ou non supporté
    }
  };

  if (createdCode) {
    return (
      <View className='flex-1 bg-dark-bg p-6 pt-14'>
        <Text className='text-2xl font-bold text-white mb-2'>
          Serveur créé !
        </Text>
        <Text className='text-slate-400 mb-6'>
          Partage ce code à tes amis pour qu’ils rejoignent le serveur.
        </Text>
        <View className='bg-dark-card border border-dark-border rounded-xl px-6 py-6 mb-6 items-center'>
          <Text className='text-slate-400 text-sm mb-2'>Code du serveur</Text>
          <Text className='text-4xl font-bold text-white tracking-[0.4em]'>
            {createdCode}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleShare}
          className='bg-slate-600 py-4 rounded-xl mb-3'>
          <Text className='text-white text-center font-semibold'>
            Partager le code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCreated}>
          <Text className='text-slate-400 text-center'>Retour à l’accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
