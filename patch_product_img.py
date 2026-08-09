import os

filepath = 'src/pages/Product.tsx'

with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("src={product.image}", "src={mainImage || product.image}")

with open(filepath, 'w') as f:
    f.write(content)
