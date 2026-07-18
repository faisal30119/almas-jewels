import sys

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

old_code = """                        } finally {
                          setUploadLoading(false);
                        }
                      }}"""

new_code = """                        } finally {
                          setUploadLoading(false);
                          e.target.value = '';
                        }
                      }}"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('src/pages/Admin.tsx', 'w') as f:
        f.write(content)
    print("Patched file input clear")
else:
    print("Could not find block")
