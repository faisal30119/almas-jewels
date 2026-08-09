import os

files_to_patch = [
    'src/pages/Cart.tsx',
    'src/pages/Checkout.tsx'
]

for filepath in files_to_patch:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
        
    content = content.replace(
        "const cartItems = items.map(item => {",
        "const cartItems = items.map(item => {"
    )
    
    # Let's just filter out undefined products!
    # find where cartItems is declared.
    content = content.replace(
        "    return { ...item, product };\n  });",
        "    return { ...item, product };\n  }).filter(item => item.product);"
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Patched {filepath}")

