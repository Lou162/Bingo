import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { CellStatus } from "../../utils/constants";

interface GridCellProps {
  text: string;
  status: CellStatus;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  voteCount?: number;
}

const statusBg: Record<CellStatus, string> = {
  empty: "bg-dark-card border-dark-border",
  pending: "bg-yellow-900/50 border-yellow-600",
  validated: "bg-green-900/50 border-green-600",
  rejected: "bg-red-900/50 border-red-600",
};

export function GridCell({
  text,
  status,
  onPress,
  onLongPress,
  disabled,
  selected,
  voteCount = 0,
}: GridCellProps) {
  const bg = statusBg[status];
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      className={`flex-1 aspect-square border rounded-lg p-2 justify-center items-center min-h-[60px] ${bg} ${selected ? "border-sky-400 border-2" : ""}`}>
      <Text
        className='text-white text-xs text-center'
        numberOfLines={3}>
        {text || "—"}
      </Text>
      {!!text && voteCount > 0 && (
        <Text className='text-[10px] text-slate-300 mt-1'>
          {voteCount} vote(s)
        </Text>
      )}
    </TouchableOpacity>
  );
}
