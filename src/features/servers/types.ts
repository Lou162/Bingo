import type { ServerDoc } from "../../types/firestore";

export interface ServerWithId extends ServerDoc {
  id: string;
}
