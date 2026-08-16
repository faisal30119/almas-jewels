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
  stock?: number;
};

const IMGS = {
  royal:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg',
  solitaire:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg',
  occasion:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg',
  pendant:
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277879/almas_bridal/assets/dwicfvexas9ouzwhu56z.jpg',
};

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'The Royal Emerald Heritage Set',
    price: 36000,
    image: IMGS.royal,
    category: 'Bridal Sets',
    stoneColor: 'Green',
    plating: 'Antique Gold',
    description: 'A masterpiece of traditional craftsmanship...',
    inclusions: ['Grand Neckpiece', 'Pair of Heavy Earrings', 'Maang Tikka'],
  },
  {
    id: 'p2',
    name: 'Sapphire Solitaire Reception Necklace',
    price: 14400,
    image: IMGS.solitaire,
    category: 'Necklaces',
    stoneColor: 'Blue',
    plating: 'Rhodium',
    description: 'Minimalist and contemporary...',
    inclusions: ['Delicate Necklace', 'Stud Earrings'],
  },
  {
    id: 'p3',
    name: 'Antique Gold Ruby Choker',
    price: 17600,
    image: IMGS.occasion,
    category: 'Necklaces',
    stoneColor: 'Red',
    plating: 'Antique Gold',
    description: 'A stunning statement choker...',
    inclusions: ['Choker Necklace', 'Dangle Earrings', 'Intricate Bangles'],
  },
  {
    id: 'p4',
    name: 'Mint Green Kundan Bridal Set',
    price: 30400,
    image: IMGS.royal,
    category: 'Bridal Sets',
    stoneColor: 'Green',
    plating: 'Antique Gold',
    description: 'A breathtaking Kundan set...',
    inclusions: ['Layered Necklace', 'Chandelier Earrings', 'Maang Tikka', 'Passa'],
  },
  {
    id: 'p5',
    name: 'Classic Rhodium Diamond Set',
    price: 23200,
    image: IMGS.solitaire,
    category: 'Bridal Sets',
    stoneColor: 'Clear',
    plating: 'Rhodium',
    description: 'For the bride who loves the diamond look...',
    inclusions: ['Statement Necklace', 'Drop Earrings', 'Bracelet'],
  },
  {
    id: 'p6',
    name: 'Kundan Statement Ring',
    price: 5200,
    image: IMGS.occasion,
    category: 'Earrings',
    stoneColor: 'Red',
    plating: 'Antique Gold',
    description: 'An oversized statement ring...',
    inclusions: ['Adjustable Statement Ring'],
  },
  {
    id: 'p7',
    name: 'Rubans Pendant Western Jewellery',
    price: 399,
    image: IMGS.pendant,
    category: 'Pendants',
    stoneColor: 'Clear',
    plating: 'Rose Gold',
    description: '18K Rose Gold Plating necklace...',
    inclusions: ['Pendant', 'Adjustable Chain'],
  },
];

export const CATEGORIES = [
  'Bridal Sets',
  'Necklaces',
  'Earrings',
  'Pendants',
  'Oxidise jewelry',
  'American Diamond (AD) / CZ',
  'Polki Jewelry',
  'Kundan Jewelry',
  'Meenakari Jewelry',
];

export const STONE_COLORS = ['Red', 'Green', 'Blue', 'Clear'];
export const PLATINGS = ['Antique Gold', 'Rhodium'];
export const PRICE_RANGES = [
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
  { label: 'Over ₹25,000', min: 25000, max: 1000000 },
];
