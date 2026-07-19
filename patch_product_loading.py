import sys

with open('src/pages/Product.tsx', 'r') as f:
    content = f.read()

bad_block = """        if (res.ok) {
          const item = await res.json();
          setProduct({
            ...item,
            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
            image: imageMap[item.image] || item.image
          } as Product);
          return;
        }"""

good_block = """        if (res.ok) {
          const item = await res.json();
          setProduct({
            ...item,
            id: String(item.id),
            stoneColor: item.stone_color || item.stoneColor,
            image: imageMap[item.image] || item.image
          } as Product);
          setIsLoading(false);
          return;
        }"""

if bad_block in content:
    content = content.replace(bad_block, good_block)
    with open('src/pages/Product.tsx', 'w') as f:
        f.write(content)
    print("Patched Product.tsx")
else:
    print("Could not find block in Product.tsx")

