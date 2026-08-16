const royalCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg';
const solitaireCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg';
const occasionCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg';
const pendantMainImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277879/almas_bridal/assets/dwicfvexas9ouzwhu56z.jpg';

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stoneColor: string;
  plating: string;
  description: string;
  inclusions: string[];
};

export const products: Product[] = [
  {
    id: 'p1',
    name: 'The Royal Emerald Heritage Set',
    price: 36000,
    image: royalCollectionImg,
    category: 'Bridal Sets',
    stoneColor: 'Green',
    plating: 'Antique Gold',
    description: 'A masterpiece of traditional craftsmanship, this full heavy bridal set features exquisite simulated emeralds and polki-style stones. Designed for the main wedding day, it ensures a regal presence.',
    inclusions: ['Grand Neckpiece', 'Pair of Heavy Earrings', 'Maang Tikka']
  },
  {
    id: 'p2',
    name: 'Sapphire Solitaire Reception Necklace',
    price: 14400,
    image: solitaireCollectionImg,
    category: 'Necklaces',
    stoneColor: 'Blue',
    plating: 'Rhodium',
    description: 'Minimalist and contemporary, this delicate solitaire necklace with a brilliant simulated sapphire is perfect for cocktail parties and evening receptions.',
    inclusions: ['Delicate Necklace', 'Stud Earrings']
  },
  {
    id: 'p3',
    name: 'Antique Gold Ruby Choker',
    price: 17600,
    image: occasionCollectionImg,
    category: 'Necklaces',
    stoneColor: 'Red',
    plating: 'Antique Gold',
    description: 'A stunning statement choker adorned with rich simulated rubies and intricate gold-plated filigree work. Ideal for sangeet or festive wear.',
    inclusions: ['Choker Necklace', 'Dangle Earrings', 'Intricate Bangles']
  },
  {
    id: 'p4',
    name: 'Mint Green Kundan Bridal Set',
    price: 30400,
    image: royalCollectionImg,
    category: 'Bridal Sets',
    stoneColor: 'Green',
    plating: 'Antique Gold',
    description: 'A breathtaking Kundan set featuring pastel mint green stones, offering a soft, romantic look that pairs beautifully with pastel bridal lehengas.',
    inclusions: ['Layered Necklace', 'Chandelier Earrings', 'Maang Tikka', 'Passa']
  },
  {
    id: 'p5',
    name: 'Classic Rhodium Diamond Set',
    price: 23200,
    image: solitaireCollectionImg,
    category: 'Bridal Sets',
    stoneColor: 'Clear',
    plating: 'Rhodium',
    description: 'For the bride who loves the diamond look. This set provides unparalleled sparkle with high-grade cubic zirconia set in durable rhodium plating.',
    inclusions: ['Statement Necklace', 'Drop Earrings', 'Bracelet']
  },
  {
    id: 'p6',
    name: 'Kundan Statement Ring',
    price: 5200,
    image: occasionCollectionImg,
    category: 'Earrings',
    stoneColor: 'Red',
    plating: 'Antique Gold',
    description: 'An oversized statement ring that commands attention. Featuring a large simulated ruby surrounded by delicate uncut-style stones.',
    inclusions: ['Adjustable Statement Ring']
  },
  {
    id: 'p7',
    name: 'Green Pendant',
    price: 1,
    image: 'https://res.cloudinary.com/niagn9pn/image/upload/v1784398302/almas_bridal/ljtcepjbjgjz9zevqnie.webp',
    category: 'Necklaces',
    stoneColor: 'Green',
    plating: 'Rhodium',
    description: 'Green Pendant Necklace',
    inclusions: ['Pendant']
  },
  {
    id: 'p7',
    name: 'Rubans Pendant Western Jewellery',
    price: 399,
    image: pendantMainImg,
    category: 'Pendants',
    stoneColor: 'Clear',
    plating: 'Rose Gold',
    description: 'Luxurious 18K Rose Gold Plating: This necklace boasts a stunning rose gold finish that exudes elegance and sophistication.\nTimeless Design: Featuring a classic and versatile design, this necklace can be effortlessly styled for both casual and formal occasions.\nHigh-Quality Craftsmanship: Made with meticulous attention to detail and using premium materials, ensuring durability and long-lasting shine.\nAdjustable Chain Length: The necklace includes an adjustable chain, allowing for a customized fit and versatility in styling.\nIdeal Gift Choice: With its luxurious appearance and timeless appeal, this necklace makes a perfect gift for various celebrations and milestones.',
    inclusions: ['Pendant', 'Adjustable Chain']
  },
];

export const categories = [
  'Bridal Sets',
  'Necklaces',
  'Earrings',
  'Pendants',
  'Oxidise jewelry',
  'American Diamond (AD) / CZ',
  'Polki Jewelry',
  'Kundan Jewelry',
  'Meenakari Jewelry'
];

export const stoneColors = [
  'Red',
  'Green',
  'Blue',
  'Clear'
];

export const platings = [
  'Antique Gold',
  'Rhodium'
];

export const priceRanges = [
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
  { label: 'Over ₹25,000', min: 25000, max: 1000000 }
];
