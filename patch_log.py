import sys
with open('src/pages/Cart.tsx', 'r') as f:
    content = f.read()

content = content.replace("fetchProducts();", "fetchProducts().catch(e => console.error('Unhandled error:', e));")
content = content.replace("setProductsLoading(false);", "console.log('Finished fetching products'); setProductsLoading(false);")
content = content.replace("const fetchProducts = async () => {", "const fetchProducts = async () => {\n      console.log('Started fetching products');")
with open('src/pages/Cart.tsx', 'w') as f:
    f.write(content)
