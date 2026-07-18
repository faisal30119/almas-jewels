import sys

with open('src/pages/Shop.tsx', 'r') as f:
    content = f.read()

old_dedup = "const allProds = [...hardcodedProducts, ...pgProducts, ...fbProducts];"
new_dedup = "const allProds = [...hardcodedProducts, ...fbProducts, ...pgProducts];"

if old_dedup in content:
    content = content.replace(old_dedup, new_dedup)
    with open('src/pages/Shop.tsx', 'w') as f:
        f.write(content)
    print("Patched Shop.tsx precedence")
