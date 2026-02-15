import { useEffect, useState } from "react";
import { subscribeGamesByServer } from "../services/gameService";
import type { GameWithId } from "../types";

export function useGames(serverId: string): GameWithId[] {
  const [games, setGames] = useState<GameWithId[]>([]);

  useEffect(() => {
    if (!serverId) {
      setGames([]);
      return;
    }
    const unsub = subscribeGamesByServer(serverId, (list) => {
      setGames(list as GameWithId[]);
    });
    return unsub;
  }, [serverId]);

  return games;
}
