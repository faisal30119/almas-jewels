import sys

with open('src/pages/Product.tsx', 'r') as f:
    content = f.read()

import_block = "import { products as hardcodedProducts, Product } from '../data';"

image_map = """import royalCollectionImg from '../assets/images/collection_royal_1783594977165.jpg';
import solitaireCollectionImg from '../assets/images/collection_solitaire_1783594992085.jpg';
import occasionCollectionImg from '../assets/images/collection_occasion_1783595002665.jpg';

const imageMap: Record<string, string> = {
  '/assets/images/collection_royal_1783594977165.jpg': royalCollectionImg,
  '/assets/images/collection_solitaire_1783594992085.jpg': solitaireCollectionImg,
  '/assets/images/collection_occasion_1783595002665.jpg': occasionCollectionImg,
};

import { products as hardcodedProducts, Product } from '../data';"""

if import_block in content and "const imageMap" not in content:
    content = content.replace(import_block, image_map)

mapping_block = """          setProduct({
            ...item,
            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
          } as Product);"""

new_mapping_block = """          setProduct({
            ...item,
            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
            image: imageMap[item.image] || item.image
          } as Product);"""

if mapping_block in content:
    content = content.replace(mapping_block, new_mapping_block)

with open('src/pages/Product.tsx', 'w') as f:
    f.write(content)
print("Patched Product.tsx")
