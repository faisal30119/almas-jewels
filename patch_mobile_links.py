import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

# Make sure all links in the drawer have proper dark theme styling
# We need to replace the specific block for the mobile menu links
import re

def replace_link(match):
    # This might be tricky, let's just do simple string replacements
    pass

# Read the file again just in case
with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="flex items-center gap-4 py-3 border-b border-gray-100"',
    'className="flex items-center gap-4 py-3 border-b border-white/5 group"'
)
content = content.replace(
    '<span className="text-gray-900 font-medium">',
    '<span className="text-white/90 font-medium group-hover:text-gold-400 transition-colors uppercase text-sm tracking-widest">'
)

content = content.replace(
    '<span className="text-white/90 group-hover:text-[#D4A359] transition-colors font-medium">',
    '<span className="text-white/90 font-medium group-hover:text-gold-400 transition-colors uppercase text-sm tracking-widest">'
)

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)

