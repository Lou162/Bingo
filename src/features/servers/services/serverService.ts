import {
  collection,
  doc,
  addDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../shared/config";

const SERVERS = "servers";

export async function createServer(
  name: string,
  createdBy: string
): Promise<string> {
  const ref = await addDoc(collection(db, SERVERS), {
    name,
    createdBy,
    members: [createdBy],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function joinServerByCode(
  serverCode: string,
  userId: string
): Promise<void> {
  const serverRef = doc(db, SERVERS, serverCode);
  const snap = await getDoc(serverRef);
  if (!snap.exists()) throw new Error("Serveur introuvable");
  const data = snap.data();
  const members: string[] = data?.members ?? [];
  if (members.includes(userId)) return;
  await updateDoc(serverRef, { members: arrayUnion(userId) });
}

export async function getServer(serverId: string) {
  const snap = await getDoc(doc(db, SERVERS, serverId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function subscribeServersForUser(
  userId: string,
  onUpdate: (
    servers: Array<{
      id: string;
      name: string;
      createdBy: string;
      members: string[];
    }>
  ) => void
): () => void {
  const q = query(
    collection(db, SERVERS),
    where("members", "array-contains", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const servers = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Array<{
      id: string;
      name: string;
      createdBy: string;
      members: string[];
    }>;
    onUpdate(servers);
  });
}
