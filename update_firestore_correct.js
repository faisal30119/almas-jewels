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
  "51yFEaupQUL._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277877/almas_bridal/assets/daitayklpsxz51ig2kma.jpg",
  "61cPASED62L._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277878/almas_bridal/assets/je12xqrwjpdebpjmz6nx.jpg",
  "61iXLd1O+OL._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277879/almas_bridal/assets/dwicfvexas9ouzwhu56z.jpg",
  "61vDXnCmbpL._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277880/almas_bridal/assets/p6ubeaiczadlglie4blr.jpg",
  "71V52eCgCNL._SY695_.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277881/almas_bridal/assets/bbzpw89ilrymnvsx399q.jpg",
  "collection_occasion_1783595002665.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg",
  "collection_royal_1783594977165.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg",
  "collection_solitaire_1783594992085.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg",
  "hero_bride_1783594960993.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277890/almas_bridal/assets/wfnbs0fyl677rj20wiqr.jpg",
  "pendant_butterfly_main_1786265928025.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277893/almas_bridal/assets/panbrhgotshii2pl5zkb.jpg",
  "pendant_butterfly_sub1_1786265950218.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277895/almas_bridal/assets/blteocmlx1mlsl7qtzx0.jpg",
  "pendant_butterfly_sub2_1786265975946.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277897/almas_bridal/assets/uffidivwpwv2wicg7m71.jpg",
  "pendant_butterfly_sub3_1786265998640.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277900/almas_bridal/assets/e5g5yagqr1ksbakallnl.jpg",
  "video_thumbnail_1783595014567.jpg": "https://res.cloudinary.com/niagn9pn/image/upload/v1786277903/almas_bridal/assets/fztrpcjlj5pg5rntxdvn.jpg"
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
