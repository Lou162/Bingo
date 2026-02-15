import React from "react";
import { View, Text, FlatList } from "react-native";

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => (
    <View
      className={`flex-row justify-between py-2 px-3 rounded-lg mb-1 ${
        item.userId === currentUserId ? "bg-slate-700" : "bg-dark-card"
      }`}>
      <Text className='text-white font-medium'>
        {index + 1}. {item.displayName}
      </Text>
      <Text className='text-slate-300'>{item.score}</Text>
    </View>
  );

  return (
    <View className='mb-4'>
      <Text className='text-slate-400 text-sm font-semibold mb-2'>
        Classement
      </Text>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}
