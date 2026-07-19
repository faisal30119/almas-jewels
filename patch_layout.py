import sys

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

link_block = '<Link to="/checkout" className="relative hover:text-gold-400 transition-colors shrink-0">'
new_link_block = '<Link to="/cart" className="relative hover:text-gold-400 transition-colors shrink-0">'

if link_block in content:
    content = content.replace(link_block, new_link_block)
    with open('src/components/Layout.tsx', 'w') as f:
        f.write(content)
    print("Patched Layout.tsx")
else:
    print("Could not find block")
