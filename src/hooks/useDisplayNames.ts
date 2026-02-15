import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../shared/config";

export function useDisplayNames(userIds: string[]): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userIds.length === 0) {
      setNames({});
      return;
    }
    let cancelled = false;
    const uniq = [...new Set(userIds)];
    (async () => {
      const next: Record<string, string> = {};
      for (const uid of uniq) {
        if (cancelled) return;
        const snap = await getDoc(doc(db, "users", uid));
        next[uid] = snap.data()?.displayName ?? uid.slice(0, 8);
      }
      if (!cancelled) setNames(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [userIds.join(",")]);

  return names;
}
