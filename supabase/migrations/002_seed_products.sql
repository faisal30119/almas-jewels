-- Seed initial products (run once)
-- Safe to re-run — uses INSERT ... WHERE NOT EXISTS to avoid duplicates

INSERT INTO products (name, price, stock, image, category, stone_color, plating, description, inclusions)
SELECT * FROM (VALUES
  (
    'The Royal Emerald Heritage Set',
    36000, 10,
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg',
    'Bridal Sets', 'Green', 'Antique Gold',
    'A masterpiece of traditional craftsmanship featuring deep emerald stones set in antique gold. Perfect for the grand wedding ceremony.',
    ARRAY['Grand Neckpiece', 'Pair of Heavy Earrings', 'Maang Tikka']
  ),
  (
    'Sapphire Solitaire Reception Necklace',
    14400, 15,
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg',
    'Necklaces', 'Blue', 'Rhodium',
    'Minimalist and contemporary, this sapphire solitaire necklace is perfect for the modern bride at her reception.',
    ARRAY['Delicate Necklace', 'Stud Earrings']
  ),
  (
    'Antique Gold Ruby Choker',
    17600, 12,
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg',
    'Necklaces', 'Red', 'Antique Gold',
    'A stunning statement choker with deep red ruby stones in antique gold setting. A timeless piece for any occasion.',
    ARRAY['Choker Necklace', 'Dangle Earrings', 'Intricate Bangles']
  ),
  (
    'Mint Green Kundan Bridal Set',
    30400, 8,
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg',
    'Bridal Sets', 'Green', 'Antique Gold',
    'A breathtaking Kundan set with mint green stones, handcrafted with the finest Kundan technique for the royal bride.',
    ARRAY['Layered Necklace', 'Chandelier Earrings', 'Maang Tikka', 'Passa']
  ),
  (
    'Classic Rhodium Diamond Set',
    23200, 10,
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg',
    'Bridal Sets', 'Clear', 'Rhodium',
    'For the bride who loves the diamond look — this rhodium-plated set with CZ stones gives maximum sparkle.',
    ARRAY['Statement Necklace', 'Drop Earrings', 'Bracelet']
  ),
  (
    'Kundan Statement Ring',
    5200, 20,
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg',
    'Earrings', 'Red', 'Antique Gold',
    'An oversized statement ring featuring traditional Kundan work with red stones. Bold, beautiful, and unforgettable.',
    ARRAY['Adjustable Statement Ring']
  ),
  (
    'Rubans Pendant Western Jewellery',
    399, 50,
    'https://res.cloudinary.com/niagn9pn/image/upload/v1786277879/almas_bridal/assets/dwicfvexas9ouzwhu56z.jpg',
    'Pendants', 'Clear', 'Rose Gold',
    '18K Rose Gold Plating necklace with a delicate pendant. Perfect for everyday contemporary wear.',
    ARRAY['Pendant', 'Adjustable Chain']
  )
) AS new_products(name, price, stock, image, category, stone_color, plating, description, inclusions)
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE products.name = new_products.name
);
