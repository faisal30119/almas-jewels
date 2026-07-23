import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiwqhLNOjWLRCKr-Xx6DSJtvEDfsAZ54c",
  projectId: "ancient-episode-sn50x",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-almasbridal-56acefbb-6df3-451a-a59f-324bc890894b");

async function run() {
  await addDoc(collection(db, "products"), {
    name: "Green Pendant",
    price: 1,
    stock: 4,
    image: "https://res.cloudinary.com/niagn9pn/image/upload/v1784398302/almas_bridal/ljtcepjbjgjz9zevqnie.webp",
    category: "Necklaces",
    stoneColor: "Green",
    plating: "Rhodium",
    description: "Green Pendant Necklace",
    inclusions: ["Pendant"],
    createdAt: "2026-07-18T18:12:10.744Z"
  });
  console.log("Added Green Pendant to Firebase");
  process.exit(0);
}
run().catch(console.error);
