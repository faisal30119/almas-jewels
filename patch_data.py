import os

filepath = 'src/data.ts'

with open(filepath, 'r') as f:
    content = f.read()

# Add imports for images
imports = """import royalCollectionImg from './assets/images/collection_royal_1783594977165.jpg';
import solitaireCollectionImg from './assets/images/collection_solitaire_1783594992085.jpg';
import occasionCollectionImg from './assets/images/collection_occasion_1783595002665.jpg';
import pendantMainImg from './assets/images/61iXLd1O+OL._SY695_.jpg';"""

content = content.replace(
"""import royalCollectionImg from './assets/images/collection_royal_1783594977165.jpg';
import solitaireCollectionImg from './assets/images/collection_solitaire_1783594992085.jpg';
import occasionCollectionImg from './assets/images/collection_occasion_1783595002665.jpg';""", imports)

new_product = """  {
    id: 'p7',
    name: 'Rubans Pendant Western Jewellery',
    price: 399,
    image: pendantMainImg,
    category: 'Pendants',
    stoneColor: 'Clear',
    plating: 'Rose Gold',
    description: 'Luxurious 18K Rose Gold Plating: This necklace boasts a stunning rose gold finish that exudes elegance and sophistication.\\nTimeless Design: Featuring a classic and versatile design, this necklace can be effortlessly styled for both casual and formal occasions.\\nHigh-Quality Craftsmanship: Made with meticulous attention to detail and using premium materials, ensuring durability and long-lasting shine.\\nAdjustable Chain Length: The necklace includes an adjustable chain, allowing for a customized fit and versatility in styling.\\nIdeal Gift Choice: With its luxurious appearance and timeless appeal, this necklace makes a perfect gift for various celebrations and milestones.',
    inclusions: ['Pendant', 'Adjustable Chain']
  },
]"""

content = content.replace("];\n\nexport const categories", new_product + ";\n\nexport const categories")

with open(filepath, 'w') as f:
    f.write(content)
