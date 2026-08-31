import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNAYOf3i9YMZs-tGO74r8V3Xg6CBGmAvc",
  authDomain: "mahjong-notebook.firebaseapp.com",
  projectId: "mahjong-notebook",
  storageBucket: "mahjong-notebook.firebasestorage.app",
  messagingSenderId: "543300515387",
  appId: "1:543300515387:web:0c9198c699fca5f1cace1e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snapshot = await getDocs(collection(db, "mahjong_sessions"));
  const sessions = [];
  snapshot.forEach(d => sessions.push({ id: d.id, ...d.data() }));
  
  sessions.sort((a,b) => b.startTime - a.startTime);
  
  console.log("Total sessions:", sessions.length);
  const seenTitles = new Set();
  
  for (const s of sessions) {
    const key = s.title + "_" + s.netAmount + "_" + s.rounds?.length;
    if (seenTitles.has(key)) {
      console.log("Deleting duplicate:", s.id, s.title);
      await deleteDoc(doc(db, "mahjong_sessions", s.id));
    } else {
      seenTitles.add(key);
      console.log("Keeping:", s.id, s.title);
    }
  }
  process.exit(0);
}
run();