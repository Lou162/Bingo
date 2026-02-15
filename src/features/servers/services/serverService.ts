import {
  collection,
  doc,
  setDoc,
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
const CODE_LENGTH = 6;
const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateServerCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS.charAt(
      Math.floor(Math.random() * CODE_CHARS.length)
    );
  }
  return code;
}

export async function createServer(
  name: string,
  createdBy: string
): Promise<string> {
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateServerCode();
    const serverRef = doc(db, SERVERS, code);
    const existing = await getDoc(serverRef);
    if (existing.exists()) continue;
    await setDoc(serverRef, {
      name,
      createdBy,
      members: [createdBy],
      createdAt: serverTimestamp(),
    });
    return code;
  }
  throw new Error("Impossible de générer un code unique, réessaie.");
}

export async function joinServerByCode(
  serverCode: string,
  userId: string
): Promise<void> {
  const trimmed = serverCode.trim();
  if (!trimmed) throw new Error("Code invalide");
  const code =
    trimmed.length === CODE_LENGTH ? trimmed.toUpperCase() : trimmed;
  const serverRef = doc(db, SERVERS, code);
  const snap = await getDoc(serverRef);
  if (!snap.exists()) throw new Error("Serveur introuvable. Vérifie le code.");
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
