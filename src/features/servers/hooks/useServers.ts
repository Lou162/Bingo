import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { subscribeServersForUser } from "../services/serverService";
import type { ServerWithId } from "../types";

export function useServers(): ServerWithId[] {
  const { user } = useAuth();
  const [servers, setServers] = useState<ServerWithId[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setServers([]);
      return;
    }
    const unsub = subscribeServersForUser(user.uid, (list) => {
      setServers(list as ServerWithId[]);
    });
    return unsub;
  }, [user?.uid]);

  return servers;
}
