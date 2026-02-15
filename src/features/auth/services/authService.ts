import {
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../shared/config";

const USERS_COLLECTION = "users";

export async function signInAnonymously(): Promise<User> {
  const { user } = await firebaseSignInAnonymously(auth);
  await ensureUserDoc(
    user.uid,
    user.displayName ?? "Anonymous",
    user.photoURL ?? null
  );
  return user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await ensureUserDoc(user.uid, displayName, user.photoURL ?? null);
  return user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDoc(
    user.uid,
    user.displayName ?? "User",
    user.photoURL ?? null
  );
  return user;
}

async function ensureUserDoc(
  uid: string,
  displayName: string,
  photoURL: string | null
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName,
      photoURL: photoURL ?? null,
      createdAt: serverTimestamp(),
    });
  }
}

export async function updateUserDisplayName(
  uid: string,
  displayName: string
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await setDoc(ref, { displayName }, { merge: true });
}
