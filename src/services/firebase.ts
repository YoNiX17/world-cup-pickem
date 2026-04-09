import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4wbkceT_vAWdBpYs7KhBQxjgkiDvyG9c",
  authDomain: "red-empire-103d7.firebaseapp.com",
  databaseURL: "https://red-empire-103d7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "red-empire-103d7",
  storageBucket: "red-empire-103d7.firebasestorage.app",
  messagingSenderId: "1002924043244",
  appId: "1:1002924043244:web:e76002c3dc8810017faec9",
  measurementId: "G-DPG3ZZ68G4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
