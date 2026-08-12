import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAiwqhLNOjWLRCKr-Xx6DSJtvEDfsAZ54c",
  authDomain: "ancient-episode-sn50x.firebaseapp.com",
  projectId: "ancient-episode-sn50x",
  storageBucket: "ancient-episode-sn50x.firebasestorage.app",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-almasbridal-56acefbb-6df3-451a-a59f-324bc890894b");

async function run() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const fbProducts = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  console.log(JSON.stringify(fbProducts, null, 2));
}
run().catch(console.error);
