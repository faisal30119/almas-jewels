import sys

with open('server.ts', 'r') as f:
    content = f.read()

old_block = """          return res.status(400).json({ error: errorDesc });
        }
      } else {"""

new_block = """          return res.status(500).json({ error: errorDesc });
        }
      } else {"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched 500 status")
else:
    print("Could not find block in server.ts")
