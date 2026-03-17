import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../auth";
import { useGame } from "../hooks/useGame";
import { useCells } from "../hooks/useCells";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useDisplayNames } from "../../../hooks/useDisplayNames";
import { GridCell } from "../../../shared/components";
import { Leaderboard } from "../../../shared/components";
import { startGame, endGame } from "../services/gameService";
import {
  updateCellText,
  setCellPending,
  setCellValidated,
  setCellRejected,
} from "../services/cellService";
import {
  GAME_STATUS,
  CELL_STATUS,
  MIN_PREDICTION_LENGTH,
} from "../../../utils/constants";

interface GameScreenProps {
  gameId: string;
  onBack: () => void;
}

export function GameScreen({ gameId, onBack }: GameScreenProps) {
  const { user } = useAuth();
  const game = useGame(gameId);
  const cells = useCells(gameId);
  const userIds = useMemo(
    () => [...new Set(cells.map((c) => c.createdBy).filter(Boolean))],
    [cells],
  );
  const displayNames = useDisplayNames(userIds);
  const leaderboard = useLeaderboard(cells, displayNames);

  const [editCell, setEditCell] = useState<{ id: string; text: string } | null>(
    null,
  );
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.uid && game?.createdBy === user.uid;
  const isLobby = game?.status === GAME_STATUS.LOBBY;
  const isActive = game?.status === GAME_STATUS.ACTIVE;
  const gridFull =
    cells.length > 0 &&
    cells.every((c) => c.text.trim().length >= MIN_PREDICTION_LENGTH);

  const handleStartGame = async () => {
    if (!gridFull || !isAdmin) return;
    setLoading(true);
    try {
      await startGame(gameId);
    } finally {
      setLoading(false);
    }
  };

  const handleEndGame = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      await endGame(gameId);
    } finally {
      setLoading(false);
    }
  };

  const handleCellPress = (cell: (typeof cells)[0]) => {
    if (!user?.uid) return;
    if (isLobby) {
      if (cell.status === CELL_STATUS.EMPTY && !cell.text.trim()) {
        setEditCell({ id: cell.id, text: "" });
        setEditValue("");
      } else if (
        cell.createdBy === user.uid &&
        cell.status === CELL_STATUS.EMPTY
      ) {
        setEditCell({ id: cell.id, text: cell.text });
        setEditValue(cell.text);
      }
      return;
    }
    if (isActive && cell.status === CELL_STATUS.EMPTY && cell.text.trim()) {
      setCellPending(cell.id);
    }
  };

  const handleSaveEdit = async () => {
    if (!editCell || !user?.uid) return;
    if (editValue.trim().length < MIN_PREDICTION_LENGTH) return;
    setLoading(true);
    try {
      await updateCellText(editCell.id, editValue.trim(), user.uid);
      setEditCell(null);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = (cellId: string) => {
    if (!isAdmin || !user?.uid) return;
    setCellValidated(cellId, user.uid);
  };

  const handleReject = (cellId: string) => {
    if (!isAdmin) return;
    setCellRejected(cellId);
  };

  if (!game) {
    return (
      <View className='flex-1 bg-dark-bg justify-center items-center'>
        <ActivityIndicator
          size='large'
          color='#fff'
        />
      </View>
    );
  }

  const gridSize = game.gridSize ?? 3;

  return (
    <View className='flex-1 bg-dark-bg p-4 pt-14'>
      <TouchableOpacity
        onPress={onBack}
        className='mb-2'>
        <Text className='text-slate-400'>← Retour</Text>
      </TouchableOpacity>
      <Text className='text-xl font-bold text-white mb-2'>{game.name}</Text>

      <Leaderboard
        entries={leaderboard}
        currentUserId={user?.uid ?? undefined}
      />

      <FlatList
        data={cells}
        keyExtractor={(item) => item.id}
        numColumns={gridSize}
        renderItem={({ item }) => (
          <View className='flex-1 max-w-[33.33%] p-1'>
            <GridCell
              text={item.text}
              status={item.status}
              onPress={() => handleCellPress(item)}
              disabled={game.status === GAME_STATUS.ENDED}
            />
            {isAdmin && item.status === CELL_STATUS.PENDING && (
              <View className='flex-row gap-1 mt-1'>
                <TouchableOpacity
                  onPress={() => handleValidate(item.id)}
                  className='flex-1 bg-green-700 py-1 rounded'>
                  <Text className='text-white text-xs text-center'>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReject(item.id)}
                  className='flex-1 bg-red-700 py-1 rounded'>
                  <Text className='text-white text-xs text-center'>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {isAdmin && isLobby && (
        <TouchableOpacity
          onPress={handleStartGame}
          disabled={!gridFull || loading}
          className='bg-green-700 py-4 rounded-xl mt-4'>
          <Text className='text-white text-center font-semibold'>
            {gridFull
              ? "Lancer la partie"
              : `Remplissez toute la grille (min ${MIN_PREDICTION_LENGTH} car. par case)`}
          </Text>
        </TouchableOpacity>
      )}
      {isAdmin && isActive && (
        <TouchableOpacity
          onPress={handleEndGame}
          disabled={loading}
          className='bg-red-700 py-4 rounded-xl mt-4'>
          <Text className='text-white text-center font-semibold'>
            Terminer la partie
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={!!editCell}
        transparent
        animationType='fade'>
        <View className='flex-1 justify-center bg-black/70 p-6'>
          <View className='bg-dark-card rounded-xl p-4 border border-dark-border'>
            <Text className='text-white font-semibold mb-2'>
              Prédiction (min {MIN_PREDICTION_LENGTH} caractères)
            </Text>
            <TextInput
              placeholder='Votre prédiction...'
              placeholderTextColor='#94a3b8'
              value={editValue}
              onChangeText={setEditValue}
              multiline
              className='bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white min-h-[80px] mb-4'
            />
            <View className='flex-row gap-3'>
              <TouchableOpacity
                onPress={() => setEditCell(null)}
                className='flex-1 py-3 rounded-xl border border-dark-border'>
                <Text className='text-white text-center'>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={
                  editValue.trim().length < MIN_PREDICTION_LENGTH || loading
                }
                className='flex-1 py-3 rounded-xl bg-slate-600'>
                <Text className='text-white text-center font-semibold'>
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
