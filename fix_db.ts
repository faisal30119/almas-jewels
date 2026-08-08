import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAiwqhLNOjWLRCKr-Xx6DSJtvEDfsAZ54c",
  authDomain: "ancient-episode-sn50x.firebaseapp.com",
  projectId: "ancient-episode-sn50x",
  storageBucket: "ancient-episode-sn50x.firebasestorage.app",
  messagingSenderId: "167668085938",
  appId: "1:167668085938:web:a76d6275e2bca07e3e45ab"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, "ai-studio-almasbridal-56acefbb-6df3-451a-a59f-324bc890894b");

async function main() {
  const redNecklaceRef = doc(db, 'products', 'jyvVT7CyeRoNgUyWQCHo');
  await updateDoc(redNecklaceRef, {
    image: '/assets/images/collection_occasion_1783595002665.jpg'
  });
  console.log("Updated Red bridal necklace");
}
main();
