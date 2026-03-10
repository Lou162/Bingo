import type { GameStatus, CellStatus } from "../utils/constants";

export interface UserDoc {
  displayName: string;
  photoURL?: string;
  createdAt: { toDate: () => Date };
}

export interface ServerDoc {
  name: string;
  createdBy: string;
  members: string[];
  createdAt: { toDate: () => Date };
}

export interface GameDoc {
  serverId: string;
  name: string;
  gridSize: number;
  maxCells?: number;
  status: GameStatus;
  createdBy: string;
  createdAt: { toDate: () => Date };
}

export interface CellDoc {
  gameId: string;
  text: string;
  createdBy: string;
  status: CellStatus;
  validatedBy?: string;
  createdAt: { toDate: () => Date };
}

export interface CellData {
  id: string;
  gameId: string;
  index?: number;
  text: string;
  createdBy: string;
  status: CellStatus;
  validatedBy?: string;
  createdAt: Date;
}
