import sys

with open('src/components/AdminRoute.tsx', 'r') as f:
    content = f.read()

target = """  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS 
    ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map((e: string) => e.trim()) 
    : ['faisal301196@gmail.com'];"""

replacement = """  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS 
    ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map((e: string) => e.trim()) 
    : ['faisal301196@gmail.com'];
  
  // To assist with preview
  if (user && user.email) {
     console.log("Logged in as:", user.email);
     console.log("Admin emails list:", adminEmails);
  }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/AdminRoute.tsx', 'w') as f:
        f.write(content)
    print("Patched AdminRoute")
else:
    print("Target not found")
