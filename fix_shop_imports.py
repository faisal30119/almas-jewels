import os

filepath = 'src/pages/Shop.tsx'
with open(filepath, 'r') as f:
    content = f.read()

import re

# Find all "import name from 'url';" and replace with "const name = 'url';"
content = re.sub(r"import\s+(\w+)\s+from\s+'(https://res\.cloudinary\.com[^']+)';", r"const \1 = '\2';", content)

with open(filepath, 'w') as f:
    f.write(content)
