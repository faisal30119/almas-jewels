import sys

with open('server.ts', 'r') as f:
    content = f.read()

old_block = """    if (!amount) {
      res.status(400).json({ error: "Amount is required" });
      return;
    }"""

new_block = """    if (!amount) {
      res.status(400).json({ error: "Amount is required" });
      return;
    }
    
    if (amount * 100 < 100) {
      res.status(400).json({ error: "Amount must be at least 1 INR (100 paise)" });
      return;
    }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched amount validation")
