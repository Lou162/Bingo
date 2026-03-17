import React, { useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import type { LeaderboardEntry } from "../../../shared/components";

interface EndGameScreenProps {
  gameName: string;
  allUserIds: string[];
  displayNames: Record<string, string>;
  entries: LeaderboardEntry[];
  currentUserId?: string;
  onBack: () => void;
}

export function EndGameScreen({
  gameName,
  allUserIds,
  displayNames,
  entries,
  currentUserId,
  onBack,
}: EndGameScreenProps) {
  const finalRanking = useMemo(() => {
    const scoreByUser: Record<string, number> = {};
    for (const entry of entries) {
      scoreByUser[entry.userId] = entry.score;
    }

    return [...new Set(allUserIds)]
      .filter(Boolean)
      .map((userId) => ({
        userId,
        displayName: displayNames[userId] ?? userId.slice(0, 8),
        score: scoreByUser[userId] ?? 0,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.displayName.localeCompare(b.displayName);
      });
  }, [allUserIds, displayNames, entries]);

  const getRowClasses = (index: number, isCurrentUser: boolean) => {
    if (index === 0) {
      return "bg-yellow-500/20 border border-yellow-400";
    }
    if (index === 1) {
      return "bg-slate-300/20 border border-slate-300";
    }
    if (index === 2) {
      return "bg-amber-700/25 border border-amber-600";
    }
    if (isCurrentUser) {
      return "bg-slate-700 border border-slate-500";
    }
    return "bg-dark-card border border-dark-border";
  };

  const getNameClasses = (index: number) => {
    if (index === 0) return "text-yellow-200";
    if (index === 1) return "text-slate-100";
    if (index === 2) return "text-amber-200";
    return "text-white";
  };

  const getScoreClasses = (index: number) => {
    if (index === 0) return "text-yellow-300";
    if (index === 1) return "text-slate-100";
    if (index === 2) return "text-amber-200";
    return "text-slate-300";
  };

  return (
    <View className='flex-1 bg-dark-bg p-6 pt-14'>
      <TouchableOpacity
        onPress={onBack}
        className='mb-2'>
        <Text className='text-slate-400'>← Retour</Text>
      </TouchableOpacity>

      <Text className='text-xl font-bold text-white'>{gameName}</Text>
      <Text className='text-slate-300 mt-1 mb-4'>Classement final</Text>

      <FlatList
        data={finalRanking}
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => {
          const isCurrentUser = item.userId === currentUserId;
          return (
            <View
              className={`flex-row items-center justify-between rounded-xl px-4 py-3 mb-2 ${getRowClasses(index, isCurrentUser)}`}>
              <Text className={`font-semibold ${getNameClasses(index)}`}>
                {index + 1}. {item.displayName}
              </Text>
              <Text className={`font-semibold ${getScoreClasses(index)}`}>
                {item.score}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className='text-slate-500 py-4 text-center'>
            Aucun joueur à afficher.
          </Text>
        }
      />
    </View>
  );
}
