export const MIN_PREDICTION_LENGTH = 2;

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

export const CELL_SCORE = {
  VALIDATED: 2,
  REJECTED: -1,
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
export type CellStatus = (typeof CELL_STATUS)[keyof typeof CELL_STATUS];
