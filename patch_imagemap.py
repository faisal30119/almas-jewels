import os
import glob

files_to_patch = [
    'src/pages/Shop.tsx',
    'src/pages/Product.tsx',
    'src/pages/Cart.tsx',
    'src/pages/Checkout.tsx'
]

imports_to_add = """
import pendantMainImg from '../assets/images/pendant_butterfly_main_1786265928025.jpg';
import pendantSub1Img from '../assets/images/pendant_butterfly_sub1_1786265950218.jpg';
import pendantSub2Img from '../assets/images/pendant_butterfly_sub2_1786265975946.jpg';
import pendantSub3Img from '../assets/images/pendant_butterfly_sub3_1786265998640.jpg';
"""

map_entries_to_add = """
  '/assets/images/pendant_butterfly_main_1786265928025.jpg': pendantMainImg,
  '/assets/images/pendant_butterfly_sub1_1786265950218.jpg': pendantSub1Img,
  '/assets/images/pendant_butterfly_sub2_1786265975946.jpg': pendantSub2Img,
  '/assets/images/pendant_butterfly_sub3_1786265998640.jpg': pendantSub3Img,
"""

for filepath in files_to_patch:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "pendantMainImg" in content:
        continue # Already patched
        
    # Find where to add imports
    if "import occasionCollectionImg" in content:
        content = content.replace(
            "import occasionCollectionImg from '../assets/images/collection_occasion_1783595002665.jpg';",
            "import occasionCollectionImg from '../assets/images/collection_occasion_1783595002665.jpg';" + imports_to_add
        )
    
    # Find where to add map entries
    if "const imageMap" in content:
        content = content.replace(
            "'/assets/images/collection_occasion_1783595002665.jpg': occasionCollectionImg,",
            "'/assets/images/collection_occasion_1783595002665.jpg': occasionCollectionImg," + map_entries_to_add
        )
        
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Patched {filepath}")

