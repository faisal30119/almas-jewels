import os

filepath = 'src/components/Layout.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix the drawer background
content = content.replace(
    'className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-white z-50 flex flex-col overflow-y-auto md:hidden"',
    'className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-emerald-950/98 backdrop-blur-md border-l border-white/10 z-50 flex flex-col overflow-y-auto md:hidden"'
)

# Fix the close button
content = content.replace(
    'className="text-[#D4A359] p-2 hover:bg-gray-100 rounded-full transition-colors"',
    'className="text-white/80 hover:text-gold-400 p-2 hover:bg-white/10 rounded-full transition-colors"'
)

with open(filepath, 'w') as f:
    f.write(content)
print("Fixed drawer theme.")
