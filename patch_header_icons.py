import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

# Make search button visible on mobile
content = content.replace(
    'className="hidden md:flex items-center justify-center hover:text-gold-400 transition-colors shrink-0 p-1"\n                  title="Search"',
    'className="flex items-center justify-center hover:text-gold-400 transition-colors shrink-0 p-1"\n                  title="Search"'
)

# Make cart link visible on mobile
content = content.replace(
    '<Link to="/cart" className="hidden md:flex items-center justify-center relative hover:text-gold-400 transition-colors shrink-0 p-1">',
    '<Link to="/cart" className="flex items-center justify-center relative hover:text-gold-400 transition-colors shrink-0 p-1">'
)

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
print("Icons made visible on mobile.")
