import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_block = "import Checkout from './pages/Checkout';"
new_import_block = "import Cart from './pages/Cart';\nimport Checkout from './pages/Checkout';"

route_block = '<Route path="checkout" element={<Checkout />} />'
new_route_block = '<Route path="cart" element={<Cart />} />\n                <Route path="checkout" element={<Checkout />} />'

if import_block in content:
    content = content.replace(import_block, new_import_block)
if route_block in content:
    content = content.replace(route_block, new_route_block)
    
with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Patched App.tsx")
