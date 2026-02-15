export const MIN_PREDICTION_LENGTH = 10;

export const GAME_STATUS = {
  LOBBY: "lobby",
  ACTIVE: "active",
  ENDED: "ended",
} as const;

export const CELL_STATUS = {
  EMPTY: "empty",
  PENDING: "pending",
  VALIDATED: "validated",
  REJECTED: "rejected",
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
export type CellStatus = (typeof CELL_STATUS)[keyof typeof CELL_STATUS];
