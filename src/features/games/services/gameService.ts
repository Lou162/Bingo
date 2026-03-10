import {
  collection,
  doc,
  addDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../shared/config";
import { GAME_STATUS } from "../../../utils/constants";
import { createEmptyCells } from "./cellService";

const GAMES = "games";

export async function createGame(
  serverId: string,
  name: string,
  maxCells: number,
  createdBy: string,
): Promise<string> {
  const gridSize = Math.max(1, Math.ceil(Math.sqrt(maxCells)));
  const ref = await addDoc(collection(db, GAMES), {
    serverId,
    name,
    gridSize,
    maxCells,
    status: GAME_STATUS.LOBBY,
    createdBy,
    createdAt: serverTimestamp(),
  });
  const count = maxCells;
  await createEmptyCells(ref.id, count);
  return ref.id;
}

export function subscribeGamesByServer(
  serverId: string,
  onUpdate: (
    games: Array<{
      id: string;
      name: string;
      gridSize: number;
      maxCells?: number;
      status: string;
      createdBy: string;
    }>,
  ) => void,
): () => void {
  const q = query(collection(db, GAMES), where("serverId", "==", serverId));
  return onSnapshot(q, (snapshot) => {
    const games = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Array<{
      id: string;
      name: string;
      gridSize: number;
      status: string;
      createdBy: string;
    }>;
    onUpdate(games);
  });
}

export async function startGame(gameId: string): Promise<void> {
  await updateDoc(doc(db, GAMES, gameId), { status: GAME_STATUS.ACTIVE });
}

export async function endGame(gameId: string): Promise<void> {
  await updateDoc(doc(db, GAMES, gameId), { status: GAME_STATUS.ENDED });
}

export async function getGame(gameId: string) {
  const snap = await getDoc(doc(db, GAMES, gameId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
