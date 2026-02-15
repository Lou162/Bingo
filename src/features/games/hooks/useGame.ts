import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../shared/config";
import type { GameWithId } from "../types";

export function useGame(gameId: string): GameWithId | null {
  const [game, setGame] = useState<GameWithId | null>(null);

  useEffect(() => {
    if (!gameId) {
      setGame(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "games", gameId), (snap) => {
      if (!snap.exists()) setGame(null);
      else setGame({ id: snap.id, ...snap.data() } as GameWithId);
    });
    return unsub;
  }, [gameId]);

  return game;
}
