import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useServers } from "../hooks/useServers";
import type { ServerWithId } from "../types";

interface HomeScreenProps {
  onCreateServer: () => void;
  onJoinServer: () => void;
  onOpenServer: (serverId: string, serverName: string) => void;
}

export function HomeScreen({
  onCreateServer,
  onJoinServer,
  onOpenServer,
}: HomeScreenProps) {
  const servers = useServers();

  const renderItem = ({ item }: { item: ServerWithId }) => (
    <TouchableOpacity
      onPress={() => onOpenServer(item.id, item.name)}
      className='bg-dark-card rounded-xl p-4 mb-3 border border-dark-border'>
      <Text className='text-white font-semibold text-lg'>{item.name}</Text>
      <Text className='text-slate-400 text-sm'>
        {item.members.length} membre(s)
      </Text>
      <Text className='text-slate-400 text-sm'>
        Créé par {item.createdBy} ·{" "}
        {item.createdAt.toDate().toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className='flex-1 bg-dark-bg p-6 pt-14'>
      <Text className='text-2xl font-bold text-white mb-2'>AperoBingo</Text>
      <Text className='text-slate-400 mb-6'>Vos salons</Text>
      <FlatList
        data={servers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className='text-slate-500 py-4'>Aucun salon</Text>
        }
      />
      <View className='flex-row gap-3 mt-4'>
        <TouchableOpacity
          onPress={onCreateServer}
          className='flex-1 bg-slate-600 py-4 rounded-xl'>
          <Text className='text-white text-center font-semibold'>
            Créer un salon
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onJoinServer}
          className='flex-1 border border-slate-500 py-4 rounded-xl'>
          <Text className='text-white text-center font-semibold'>
            Rejoindre un salon
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
