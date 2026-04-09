import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ══════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  createdAt: any;
}

export interface GroupPrediction {
  [groupName: string]: number[];
}

export interface MatchPrediction {
  [matchId: string]: string;
}

export interface UserPredictions {
  uid: string;
  groups: GroupPrediction;
  matches: MatchPrediction;
  validated: boolean;
  validatedAt: any;
  updatedAt: any;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  groupPoints: number;
  matchPoints: number;
  totalPoints: number;
}

// ══════════════════════════════════════════════
// User Profile
// ══════════════════════════════════════════════

export const saveUserProfile = async (user: {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}) => {
  const ref = doc(db, 'pickem_users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName || 'Joueur Anonyme',
      photoURL: user.photoURL || '',
      email: user.email || '',
      createdAt: serverTimestamp(),
    });
  }
};

// ══════════════════════════════════════════════
// Predictions
// ══════════════════════════════════════════════

export const savePredictions = async (
  uid: string,
  groups: GroupPrediction,
  matches: MatchPrediction
) => {
  const ref = doc(db, 'pickem_predictions', uid);
  await setDoc(ref, {
    uid,
    groups,
    matches,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const validatePredictions = async (uid: string) => {
  const ref = doc(db, 'pickem_predictions', uid);
  await updateDoc(ref, {
    validated: true,
    validatedAt: serverTimestamp(),
  });
};

export const unvalidatePredictions = async (uid: string) => {
  const ref = doc(db, 'pickem_predictions', uid);
  await updateDoc(ref, {
    validated: false,
    validatedAt: null,
  });
};

export const loadPredictions = async (uid: string): Promise<UserPredictions | null> => {
  const ref = doc(db, 'pickem_predictions', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserPredictions;
  }
  return null;
};

// ══════════════════════════════════════════════
// Points Calculation
// ══════════════════════════════════════════════

export const calculateGroupPoints = (
  predicted: GroupPrediction,
  actual: GroupPrediction
): number => {
  let points = 0;
  for (const group of Object.keys(predicted)) {
    const pred = predicted[group];
    const act = actual[group];
    if (!pred || !act) continue;

    for (let i = 0; i < pred.length; i++) {
      if (act[i] === pred[i]) {
        points += 5;
      } else if (i < 2 && act.slice(0, 2).includes(pred[i])) {
        points += 3;
      } else if (act.includes(pred[i])) {
        points += 1;
      }
    }
  }
  return points;
};

export const calculateMatchPoints = (
  predicted: MatchPrediction,
  actualResults: Record<string, string>
): number => {
  let points = 0;
  for (const matchId of Object.keys(predicted)) {
    if (predicted[matchId] === actualResults[matchId]) {
      points += 3;
    }
  }
  return points;
};

// ══════════════════════════════════════════════
// Leaderboard
// ══════════════════════════════════════════════

export const saveScore = async (
  uid: string,
  displayName: string,
  photoURL: string,
  groupPoints: number,
  matchPoints: number
) => {
  const ref = doc(db, 'pickem_leaderboard', uid);
  await setDoc(ref, {
    uid,
    displayName,
    photoURL,
    groupPoints,
    matchPoints,
    totalPoints: groupPoints + matchPoints,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const q = query(
    collection(db, 'pickem_leaderboard'),
    orderBy('totalPoints', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as LeaderboardEntry);
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const snap = await getDocs(collection(db, 'pickem_users'));
  return snap.docs.map(doc => doc.data() as UserProfile);
};
