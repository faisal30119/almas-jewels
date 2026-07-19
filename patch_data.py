import sys

with open('src/data.ts', 'r') as f:
    content = f.read()

block = "const imageMap: Record<string, string> = {"
new_block = "export const imageMap: Record<string, string> = {"

if block in content:
    content = content.replace(block, new_block)
    with open('src/data.ts', 'w') as f:
        f.write(content)
    print("Exported imageMap")
