import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDNAYOf3i9YMZs-tGO74r8V3Xg6CBGmAvc",
  projectId: "mahjong-notebook",
});
const db = getFirestore(app);

async function run() {
  const snapshot = await getDocs(collection(db, "mahjong_sessions"));
  const sessions = [];
  snapshot.forEach(d => sessions.push({ id: d.id, ...d.data() }));
  
  for (const s of sessions) {
    if (s.rounds?.length === 0 || s.netAmount === 50 || s.netAmount === 70) {
      console.log("Deleting:", s.id, s.title);
      await deleteDoc(doc(db, "mahjong_sessions", s.id));
    }
  }
  process.exit(0);
}
run();