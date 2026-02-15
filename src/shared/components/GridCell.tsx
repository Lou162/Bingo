import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { CellStatus } from "../../utils/constants";

interface GridCellProps {
  text: string;
  status: CellStatus;
  onPress?: () => void;
  disabled?: boolean;
}

const statusBg: Record<CellStatus, string> = {
  empty: "bg-dark-card border-dark-border",
  pending: "bg-yellow-900/50 border-yellow-600",
  validated: "bg-green-900/50 border-green-600",
  rejected: "bg-red-900/50 border-red-600",
};

export function GridCell({ text, status, onPress, disabled }: GridCellProps) {
  const bg = statusBg[status];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 aspect-square border rounded-lg p-2 justify-center items-center min-h-[60px] ${bg}`}>
      <Text
        className='text-white text-xs text-center'
        numberOfLines={3}>
        {text || "—"}
      </Text>
    </TouchableOpacity>
  );
}
