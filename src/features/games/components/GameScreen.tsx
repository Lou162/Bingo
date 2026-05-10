import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../auth";
import { useGame } from "../hooks/useGame";
import { useCells } from "../hooks/useCells";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useDisplayNames } from "../../../hooks/useDisplayNames";
import { GridCell } from "../../../shared/components";
import { Leaderboard } from "../../../shared/components";
import { startGame, endGame, setVotesFrozen } from "../services/gameService";
import {
  updateCellText,
  setCellPending,
  setCellValidated,
  setCellRejected,
  rejectNonFinalNonEmptyCells,
  toggleCellSelection,
} from "../services/cellService";
import {
  GAME_STATUS,
  CELL_STATUS,
  MIN_PREDICTION_LENGTH,
} from "../../../utils/constants";
import { EditProfileModal } from "./GameValidationModal";
import { EndGameScreen } from "./EndGameScreen";

interface GameScreenProps {
  gameId: string;
  onBack: () => void;
}

export function GameScreen({ gameId, onBack }: GameScreenProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const game = useGame(gameId);
  const cells = useCells(gameId);
  const userIds = useMemo(() => {
    const createdByUsers = cells.map((c) => c.createdBy).filter(Boolean);
    const voters = cells.flatMap((c) => c.selectedBy ?? []);
    return [...new Set([...createdByUsers, ...voters])];
  }, [cells]);
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
  const votesFrozen = !!game?.votesFrozen;
  const gridSize =
    game?.gridSize ?? Math.max(1, Math.ceil(Math.sqrt(maxCells)));
  const filledCellsCount = cells.filter(
    (c) => c.text.trim().length >= MIN_PREDICTION_LENGTH,
  ).length;
  const canAddCell = isLobby && filledCellsCount < maxCells;
  const gridFull = filledCellsCount >= 1 && filledCellsCount <= maxCells;
  const canStart = isAdmin && gridFull;
  const actionBottomSpacing = Math.max(
    72,
    Math.round(height * 0.16) + Math.max(insets.bottom, 12),
  );

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
      await rejectNonFinalNonEmptyCells(gameId);
      await endGame(gameId);
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeVotes = async () => {
    if (!isAdmin || !isActive || votesFrozen) return;
    setLoading(true);
    try {
      await setVotesFrozen(gameId, true);
    } finally {
      setLoading(false);
    }
  };

  const handleCellPress = (cell: (typeof cells)[0]) => {
    if (!user?.uid) return;
    if (isLobby) {
      if (cell.status !== CELL_STATUS.EMPTY) {
        return;
      }

      const hasText = cell.text.trim().length > 0;

      if (!hasText) {
        if (!canAddCell && !isAdmin) return;
        setEditCell({ id: cell.id, text: "" });
        setEditValue("");
      } else if (isAdmin) {
        setEditCell({ id: cell.id, text: cell.text });
        setEditValue(cell.text);
      }

      return;
    }

    if (!isActive || !cell.text.trim()) return;
    if (votesFrozen) return;

    // Phase 2: chaque joueur vote sur les evenements probables.
    if (
      cell.status === CELL_STATUS.EMPTY ||
      cell.status === CELL_STATUS.PENDING
    ) {
      const isSelected = (cell.selectedBy ?? []).includes(user.uid);
      void toggleCellSelection(cell.id, user.uid, isSelected);
    }
  };

  const handleCellLongPress = (cell: (typeof cells)[0]) => {
    if (!isAdmin || !isActive || !cell.text.trim()) return;
    if (!votesFrozen) return;

    // Phase 3 : l'admin valide/rejette uniquement une fois les votes gelés.
    if (cell.status === CELL_STATUS.EMPTY) {
      void setCellPending(cell.id);
      setEditModalVisible({ visible: true, caseId: cell.id });
      return;
    }
    if (cell.status === CELL_STATUS.PENDING) {
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
    if (!isAdmin || !user?.uid || !votesFrozen) return;
    setCellValidated(cellId, user.uid);
  };

  const handleReject = (cellId: string) => {
    if (!isAdmin || !votesFrozen) return;
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

  if (game.status === GAME_STATUS.ENDED) {
    return (
      <EndGameScreen
        gameName={game.name}
        allUserIds={userIds}
        displayNames={displayNames}
        entries={leaderboard}
        currentUserId={user?.uid ?? undefined}
        onBack={onBack}
      />
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
              selected={
                !!user?.uid && (item.selectedBy ?? []).includes(user.uid)
              }
              voteCount={(item.selectedBy ?? []).length}
              onPress={() => {
                handleCellPress(item);
              }}
              onLongPress={() => {
                handleCellLongPress(item);
              }}
              disabled={game.status === GAME_STATUS.ENDED}
            />
            {isAdmin && votesFrozen && item.status === CELL_STATUS.PENDING && (
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
        <View style={{ marginBottom: actionBottomSpacing }}>
          <TouchableOpacity
            onPress={handleStartGame}
            disabled={!canStart || loading}
            className='bg-green-700 py-4 rounded-xl mt-4'>
            <Text className='text-white text-center font-semibold'>
              {canStart
                ? `Lancer la partie (${filledCellsCount}/${maxCells} cases remplies)`
                : `Terminez la grille avant de lancer (${filledCellsCount}/${maxCells})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isActive && (
        <Text className='text-slate-300 text-center mt-4'>
          {votesFrozen
            ? "Votes geles. Les joueurs ne peuvent plus modifier leurs choix."
            : "Cliquez sur une case pour voter. L'admin peut geler les votes."}
        </Text>
      )}

      {isAdmin && isActive && !votesFrozen && (
        <TouchableOpacity
          onPress={handleFreezeVotes}
          disabled={loading}
          className='bg-amber-700 py-4 rounded-xl mt-4'>
          <Text className='text-white text-center font-semibold'>
            Geler les votes
          </Text>
        </TouchableOpacity>
      )}

      {isAdmin && isActive && votesFrozen && (
        <View className='bg-amber-900/50 border border-amber-600 rounded-xl mt-4 py-3 px-4'>
          <Text className='text-amber-200 text-center font-semibold'>
            Votes geles
          </Text>
        </View>
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
