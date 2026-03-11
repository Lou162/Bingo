import { useMemo } from "react";
import type { CellData } from "../../../types/firestore";
import { CELL_SCORE, CELL_STATUS } from "../../../utils/constants";
import type { LeaderboardEntry } from "../../../shared/components";

export function useLeaderboard(
  cells: CellData[],
  displayNames: Record<string, string>,
): LeaderboardEntry[] {
  return useMemo(() => {
    const scoreByUser: Record<string, number> = {};
    for (const cell of cells) {
      const voters = Array.isArray(cell.selectedBy) ? cell.selectedBy : [];
      if (cell.status === CELL_STATUS.VALIDATED) {
        for (const userId of voters) {
          scoreByUser[userId] =
            (scoreByUser[userId] ?? 0) + CELL_SCORE.VALIDATED;
        }
      }
      if (cell.status === CELL_STATUS.REJECTED) {
        for (const userId of voters) {
          scoreByUser[userId] =
            (scoreByUser[userId] ?? 0) + CELL_SCORE.REJECTED;
        }
      }
    }
    return Object.entries(scoreByUser).map(([userId, score]) => ({
      userId,
      displayName: displayNames[userId] ?? userId.slice(0, 8),
      score,
    }));
  }, [cells, displayNames]);
}
