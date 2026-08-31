import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyDNAYOf3i9YMZs-tGO74r8V3Xg6CBGmAvc",
  projectId: "mahjong-notebook",
});
const db = getFirestore(app);

async function run() {
  const snapshot = await getDocs(collection(db, "mahjong_sessions"));
  snapshot.forEach(d => {
    const data = d.data();
    console.log("ID:", d.id);
    console.log("Title:", data.title);
    console.log("Rounds:", data.rounds?.length);
    console.log("Net:", data.netAmount);
    console.log("------");
  });
  process.exit(0);
}
run();
