import sys

with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

target = "import { LogOut, Package, Heart, Trash2, Calendar } from 'lucide-react';"
replacement = "import { LogOut, Package, Heart, Trash2, Calendar, Loader2 } from 'lucide-react';"

if target in content:
    content = content.replace(target, replacement)
    print("Patched import")
else:
    print("Target import not found")

with open('src/pages/Profile.tsx', 'w') as f:
    f.write(content)
