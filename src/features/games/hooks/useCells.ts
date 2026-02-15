import { useEffect, useState } from "react";
import { subscribeCellsByGame } from "../services/cellService";
import type { CellData } from "../../../types/firestore";

export function useCells(gameId: string): CellData[] {
  const [cells, setCells] = useState<CellData[]>([]);

  useEffect(() => {
    if (!gameId) {
      setCells([]);
      return;
    }
    const unsub = subscribeCellsByGame(gameId, setCells);
    return unsub;
  }, [gameId]);

  return cells;
}
