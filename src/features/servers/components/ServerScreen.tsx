import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGames } from "../../games/hooks/useGames";
import type { GameWithId } from "../../games/types";

interface ServerScreenProps {
  serverId: string;
  serverName: string;
  onCreateGame: () => void;
  onOpenGame: (gameId: string) => void;
  onBack: () => void;
}

export function ServerScreen({
  serverId,
  serverName,
  onCreateGame,
  onOpenGame,
  onBack,
}: ServerScreenProps) {
  const games = useGames(serverId);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const actionBottomSpacing = Math.max(
    72,
    Math.round(height * 0.16) + Math.max(insets.bottom, 12),
  );

  const renderItem = ({ item }: { item: GameWithId }) => (
    <TouchableOpacity
      onPress={() => onOpenGame(item.id)}
      className='bg-dark-card rounded-xl p-4 mb-3 border border-dark-border'>
      <Text className='text-white font-semibold text-lg'>{item.name}</Text>
      <Text className='text-slate-400 text-sm'>
        {item.maxCells
          ? `max ${item.maxCells} cases`
          : `${item.gridSize}x${item.gridSize}`}{" "}
        · {item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className='flex-1 bg-dark-bg p-6 pt-14'>
      <TouchableOpacity
        onPress={onBack}
        className='mb-4'>
        <Text className='text-slate-400'>← Retour</Text>
      </TouchableOpacity>
      <Text className='text-2xl font-bold text-white mb-2'>{serverName}</Text>
      <Text className='text-slate-400 mb-6'>Parties (bingos)</Text>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className='text-slate-500 py-4'>Aucune partie</Text>
        }
      />
      <View style={{ marginBottom: actionBottomSpacing }}>
        <TouchableOpacity
          onPress={onCreateGame}
          className='bg-slate-600 py-4 rounded-xl mt-4'>
          <Text className='text-white text-center font-semibold'>
            Créer une grille
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
