import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiwqhLNOjWLRCKr-Xx6DSJtvEDfsAZ54c",
  projectId: "ancient-episode-sn50x",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-almasbridal-56acefbb-6df3-451a-a59f-324bc890894b");

async function run() {
  const q = await getDocs(collection(db, "products"));
  console.log(q.docs.map(d => d.data()));
  process.exit(0);
}
run().catch(console.error);
