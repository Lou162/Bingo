import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../../shared/config";
import { CELL_STATUS } from "../../../utils/constants";
import type { CellData } from "../../../types/firestore";

const CELLS = "cells";

export async function createEmptyCells(
  gameId: string,
  count: number,
): Promise<void> {
  const batch = writeBatch(db);
  const col = collection(db, CELLS);
  for (let i = 0; i < count; i++) {
    const ref = doc(col);
    batch.set(ref, {
      gameId,
      index: i,
      text: "",
      createdBy: "",
      selectedBy: [],
      status: CELL_STATUS.EMPTY,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function updateCellText(
  cellId: string,
  text: string,
  editorId: string,
): Promise<void> {
  const cellRef = doc(db, CELLS, cellId);
  const cellSnap = await getDoc(cellRef);

  if (!cellSnap.exists()) return;

  const cellData = cellSnap.data() as {
    gameId?: string;
    text?: string;
    createdBy?: string;
  };

  const existingText = (cellData.text ?? "").trim();
  const gameId = cellData.gameId;

  let isEditorAdmin = false;
  if (typeof gameId === "string" && gameId.length > 0) {
    const gameSnap = await getDoc(doc(db, "games", gameId));
    if (gameSnap.exists()) {
      const gameData = gameSnap.data() as { createdBy?: string };
      isEditorAdmin = gameData.createdBy === editorId;
    }
  }

  if (existingText.length > 0 && !isEditorAdmin) return;

  const resolvedCreatedBy = isEditorAdmin
    ? (cellData.createdBy ?? "").trim() || editorId
    : editorId;

  await updateDoc(cellRef, {
    text: text.trim(),
    createdBy: resolvedCreatedBy,
    createdAt: serverTimestamp(),
  });
}

export function subscribeCellsByGame(
  gameId: string,
  onUpdate: (cells: CellData[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(collection(db, CELLS), where("gameId", "==", gameId));
  return onSnapshot(
    q,
    (snapshot) => {
      const cells = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            gameId: data.gameId,
            index:
              typeof data.index === "number"
                ? data.index
                : Number.MAX_SAFE_INTEGER,
            text: data.text ?? "",
            createdBy: data.createdBy,
            selectedBy: Array.isArray(data.selectedBy) ? data.selectedBy : [],
            status: data.status ?? CELL_STATUS.EMPTY,
            validatedBy: data.validatedBy,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          } as CellData;
        })
        .sort(
          (a, b) =>
            (a.index ?? Number.MAX_SAFE_INTEGER) -
            (b.index ?? Number.MAX_SAFE_INTEGER),
        );
      onUpdate(cells);
    },
    (error) => {
      onError?.(error as Error);
    },
  );
}

export async function setCellPending(cellId: string): Promise<void> {
  await updateDoc(doc(db, CELLS, cellId), { status: CELL_STATUS.PENDING });
}

export async function setCellValidated(
  cellId: string,
  validatedBy: string,
): Promise<void> {
  const cellRef = doc(db, CELLS, cellId);
  const cellSnap = await getDoc(cellRef);
  if (!cellSnap.exists()) return;

  const { gameId } = cellSnap.data() as { gameId?: string };
  if (!gameId) return;

  const gameSnap = await getDoc(doc(db, "games", gameId));
  if (!gameSnap.exists()) return;

  if (!(gameSnap.data() as { votesFrozen?: boolean }).votesFrozen) return;

  await updateDoc(cellRef, {
    status: CELL_STATUS.VALIDATED,
    validatedBy,
  });
}

export async function setCellRejected(cellId: string): Promise<void> {
  const cellRef = doc(db, CELLS, cellId);
  const cellSnap = await getDoc(cellRef);
  if (!cellSnap.exists()) return;

  const { gameId } = cellSnap.data() as { gameId?: string };
  if (!gameId) return;

  const gameSnap = await getDoc(doc(db, "games", gameId));
  if (!gameSnap.exists()) return;

  if (!(gameSnap.data() as { votesFrozen?: boolean }).votesFrozen) return;

  await updateDoc(cellRef, { status: CELL_STATUS.REJECTED });
}

export async function rejectNonFinalNonEmptyCells(
  gameId: string,
): Promise<void> {
  const q = query(collection(db, CELLS), where("gameId", "==", gameId));
  const snap = await getDocs(q);

  const batch = writeBatch(db);
  let updateCount = 0;

  snap.docs.forEach((cellDoc) => {
    const data = cellDoc.data() as {
      text?: string;
      status?: string;
    };

    const text = (data.text ?? "").trim();
    const status = data.status;
    const isFinalStatus =
      status === CELL_STATUS.VALIDATED || status === CELL_STATUS.REJECTED;

    if (!text || isFinalStatus) return;

    batch.update(doc(db, CELLS, cellDoc.id), {
      status: CELL_STATUS.REJECTED,
    });
    updateCount += 1;
  });

  if (updateCount > 0) {
    await batch.commit();
  }
}

export async function toggleCellSelection(
  cellId: string,
  userId: string,
  isSelected: boolean,
): Promise<void> {
  await updateDoc(doc(db, CELLS, cellId), {
    selectedBy: isSelected ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function getCellsForGame(
  gameId: string,
): Promise<{ id: string; index: number }[]> {
  const q = query(collection(db, CELLS), where("gameId", "==", gameId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({
      id: d.id,
      index:
        typeof d.data().index === "number"
          ? (d.data().index as number)
          : Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => a.index - b.index);
}
