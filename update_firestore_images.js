import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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
  const fbProducts = querySnapshot.docs.map(d => ({id: d.id, ...d.data()}));
  
  const mapping = {
    "51yFEaupQUL._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206262/almas_bridal/assets/51yFEaupQUL._SY695_.jpg",
    "61cPASED62L._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206262/almas_bridal/assets/61cPASED62L._SY695_.jpg",
    "61iXLd1O+OL._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206263/almas_bridal/assets/61iXLd1O%2BOL._SY695_.jpg",
    "61vDXnCmbpL._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206264/almas_bridal/assets/61vDXnCmbpL._SY695_.jpg",
    "71V52eCgCNL._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206265/almas_bridal/assets/71V52eCgCNL._SY695_.jpg",
    "collection_occasion_1783595002665.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206267/almas_bridal/assets/collection_occasion_1783595002665.jpg",
    "collection_royal_1783594977165.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206270/almas_bridal/assets/collection_royal_1783594977165.jpg",
    "collection_solitaire_1783594992085.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206272/almas_bridal/assets/collection_solitaire_1783594992085.jpg",
    "hero_bride_1783594960993.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206274/almas_bridal/assets/hero_bride_1783594960993.jpg",
    "pendant_butterfly_main_1786265928025.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206276/almas_bridal/assets/pendant_butterfly_main_1786265928025.jpg",
    "pendant_butterfly_sub1_1786265950218.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206278/almas_bridal/assets/pendant_butterfly_sub1_1786265950218.jpg",
    "pendant_butterfly_sub2_1786265975946.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206280/almas_bridal/assets/pendant_butterfly_sub2_1786265975946.jpg",
    "pendant_butterfly_sub3_1786265998640.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206282/almas_bridal/assets/pendant_butterfly_sub3_1786265998640.jpg",
    "video_thumbnail_1783595014567.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1723206284/almas_bridal/assets/video_thumbnail_1783595014567.jpg"
  };

  for (const prod of fbProducts) {
    let changed = false;
    let newImage = prod.image;
    
    if (newImage) {
      for (const [file, url] of Object.entries(mapping)) {
        if (newImage.includes(file)) {
          newImage = url;
          changed = true;
          break;
        }
      }
    }
    
    if (changed) {
      console.log(`Updating Firestore product ${prod.id}...`);
      const prodRef = doc(db, 'products', prod.id);
      await updateDoc(prodRef, { image: newImage });
    }
  }
}
run().catch(console.error);
