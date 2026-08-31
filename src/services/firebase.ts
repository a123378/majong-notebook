import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNAYOf3i9YMZs-tGO74r8V3Xg6CBGmAvc",
  authDomain: "mahjong-notebook.firebaseapp.com",
  projectId: "mahjong-notebook",
  storageBucket: "mahjong-notebook.firebasestorage.app",
  messagingSenderId: "543300515387",
  appId: "1:543300515387:web:0c9198c699fca5f1cace1e",
  measurementId: "G-12T6Y1FPRV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);