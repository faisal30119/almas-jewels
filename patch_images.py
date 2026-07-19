import sys

image_map_code = """
import royalCollectionImg from '../assets/images/collection_royal_1783594977165.jpg';
import solitaireCollectionImg from '../assets/images/collection_solitaire_1783594992085.jpg';
import occasionCollectionImg from '../assets/images/collection_occasion_1783595002665.jpg';

const imageMap: Record<string, string> = {
  '/assets/images/collection_royal_1783594977165.jpg': royalCollectionImg,
  '/assets/images/collection_solitaire_1783594992085.jpg': solitaireCollectionImg,
  '/assets/images/collection_occasion_1783595002665.jpg': occasionCollectionImg,
};
"""

for file_name in ['src/pages/Checkout.tsx', 'src/pages/Cart.tsx']:
    with open(file_name, 'r') as f:
        content = f.read()
        
    if "const imageMap" not in content:
        # Add after imports
        import_str = "import { products as hardcodedProducts"
        if import_str in content:
            content = content.replace(import_str, image_map_code + "\n" + import_str)
            
        # Update mapping
        mapping = """            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,"""
        new_mapping = """            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
            image: imageMap[item.image] || item.image"""
        
        content = content.replace(mapping, new_mapping)
        
        with open(file_name, 'w') as f:
            f.write(content)
        print(f"Patched {file_name}")

