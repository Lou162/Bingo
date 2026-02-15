import { useMemo } from "react";
import type { CellData } from "../../../types/firestore";
import { CELL_STATUS } from "../../../utils/constants";
import type { LeaderboardEntry } from "../../../shared/components";

export function useLeaderboard(
  cells: CellData[],
  displayNames: Record<string, string>
): LeaderboardEntry[] {
  return useMemo(() => {
    const scoreByUser: Record<string, number> = {};
    for (const cell of cells) {
      if (cell.status === CELL_STATUS.VALIDATED && cell.createdBy) {
        scoreByUser[cell.createdBy] = (scoreByUser[cell.createdBy] ?? 0) + 1;
      }
    }
    return Object.entries(scoreByUser).map(([userId, score]) => ({
      userId,
      displayName: displayNames[userId] ?? userId.slice(0, 8),
      score,
    }));
  }, [cells, displayNames]);
}
