import type { GameDoc } from "../../types/firestore";

export interface GameWithId extends GameDoc {
  id: string;
}
