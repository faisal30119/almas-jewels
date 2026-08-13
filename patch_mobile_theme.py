import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

# Change drawer background from bg-white to bg-emerald-950/98 backdrop-blur-md
content = content.replace(
    'className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-white z-50 flex flex-col overflow-y-auto md:hidden"',
    'className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-emerald-950/98 backdrop-blur-md z-50 flex flex-col overflow-y-auto md:hidden border-l border-white/10"'
)

# Fix Close Button (make it white/gold hover, remove bg-gray-100 hover)
content = content.replace(
    'className="text-[#D4A359] p-2 hover:bg-gray-100 rounded-full transition-colors"',
    'className="text-white hover:text-[#D4A359] p-2 transition-colors"'
)

# Text styles for items
content = content.replace('text-gray-900', 'text-white/90 group-hover:text-[#D4A359] transition-colors')
content = content.replace('border-gray-100', 'border-white/5')
content = content.replace('hover:bg-gray-100', 'hover:bg-white/5')
content = content.replace('className="flex items-center gap-4 py-3 border-b border-gray-100"', 'className="flex items-center gap-4 py-3 border-b border-white/5 group"')

# Let's do a more robust regex replacement for the Link/button lines to ensure group class is added and text is styled
