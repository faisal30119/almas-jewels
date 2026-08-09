import os

files_to_patch = [
    'src/pages/Shop.tsx',
    'src/pages/Cart.tsx',
    'src/pages/Checkout.tsx'
]

for filepath in files_to_patch:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "pgProducts = (Array.isArray(data) ? data : []).map" in content:
        continue
        
    content = content.replace(
        "pgProducts = data.map((item: any) => ({",
        "pgProducts = (Array.isArray(data) ? data : []).map((item: any) => ({"
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Patched {filepath}")

