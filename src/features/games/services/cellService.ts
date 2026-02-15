import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../shared/config";
import { CELL_STATUS } from "../../../utils/constants";
import type { CellData } from "../../../types/firestore";

const CELLS = "cells";

export async function createEmptyCells(
  gameId: string,
  count: number
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
      status: CELL_STATUS.EMPTY,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function updateCellText(
  cellId: string,
  text: string,
  createdBy: string
): Promise<void> {
  await updateDoc(doc(db, CELLS, cellId), {
    text: text.trim(),
    createdBy,
    createdAt: serverTimestamp(),
  });
}

export function subscribeCellsByGame(
  gameId: string,
  onUpdate: (cells: CellData[]) => void
): () => void {
  const q = query(
    collection(db, CELLS),
    where("gameId", "==", gameId),
    orderBy("index", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const cells = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        gameId: data.gameId,
        text: data.text ?? "",
        createdBy: data.createdBy,
        status: data.status ?? CELL_STATUS.EMPTY,
        validatedBy: data.validatedBy,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as CellData;
    });
    onUpdate(cells);
  });
}

export async function setCellPending(cellId: string): Promise<void> {
  await updateDoc(doc(db, CELLS, cellId), { status: CELL_STATUS.PENDING });
}

export async function setCellValidated(
  cellId: string,
  validatedBy: string
): Promise<void> {
  await updateDoc(doc(db, CELLS, cellId), {
    status: CELL_STATUS.VALIDATED,
    validatedBy,
  });
}

export async function setCellRejected(cellId: string): Promise<void> {
  await updateDoc(doc(db, CELLS, cellId), { status: CELL_STATUS.REJECTED });
}

export async function getCellsForGame(
  gameId: string
): Promise<{ id: string; index: number }[]> {
  const q = query(
    collection(db, CELLS),
    where("gameId", "==", gameId),
    orderBy("index", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, index: d.data().index }));
}
