import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Button,
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
import { EditProfileModal } from "./GameValidationModal";

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
  const [isEditModalVisible, setEditModalVisible] = useState({
    visible: false,
    caseId: null as string | null,
  });

  const isAdmin = user?.uid && game?.createdBy === user.uid;
  const isLobby = game?.status === GAME_STATUS.LOBBY;
  const isActive = game?.status === GAME_STATUS.ACTIVE;

  const maxCells =
    game?.maxCells ?? (game?.gridSize ? game.gridSize * game.gridSize : 9);
  const gridSize =
    game?.gridSize ?? Math.max(1, Math.ceil(Math.sqrt(maxCells)));
  const filledCellsCount = cells.filter(
    (c) => c.text.trim().length >= MIN_PREDICTION_LENGTH,
  ).length;
  const canAddCell = isLobby && filledCellsCount < maxCells;
  const canStart = isAdmin && filledCellsCount > 0;

  const handleStartGame = async () => {
    if (!canStart || !isAdmin) return;
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
      if (
        !canAddCell &&
        (!cell.text.trim() || cell.status === CELL_STATUS.EMPTY)
      ) {
        return;
      }
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
      if (isAdmin) {
        setEditModalVisible({ visible: true, caseId: cell.id });
      }
    }
    if (isActive && isAdmin && cell.status === CELL_STATUS.PENDING) {
      setEditModalVisible({ visible: true, caseId: cell.id });
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
              onPress={() => {
                handleCellPress(item);
              }}
              disabled={game.status === GAME_STATUS.ENDED}
            />
            {isAdmin && item.status === CELL_STATUS.PENDING && (
              <EditProfileModal
                visible={
                  isEditModalVisible.visible &&
                  isEditModalVisible.caseId === item.id
                }
                onClose={() =>
                  setEditModalVisible({ visible: false, caseId: null })
                }
                onValidate={() => {
                  handleValidate(item.id);
                }}
                onReject={() => {
                  handleReject(item.id);
                }}
              />
            )}
          </View>
        )}
      />

      {isAdmin && isLobby && (
        <TouchableOpacity
          onPress={handleStartGame}
          disabled={!canStart || loading}
          className='bg-green-700 py-4 rounded-xl mt-4'>
          <Text className='text-white text-center font-semibold'>
            {canStart
              ? `Lancer la partie (${filledCellsCount}/${maxCells} cases remplies)`
              : `Ajoutez au moins 1 case pour lancer (max ${maxCells})`}
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
