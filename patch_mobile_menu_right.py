import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

# Change drawer animation x from "-100%" to "100%"
content = content.replace(
    'initial={{ x: "-100%" }}\n              animate={{ x: 0 }}\n              exit={{ x: "-100%" }}',
    'initial={{ x: "100%" }}\n              animate={{ x: 0 }}\n              exit={{ x: "100%" }}'
)

# Change drawer position from left-0 to right-0
content = content.replace(
    'className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-white z-50 flex flex-col overflow-y-auto md:hidden"',
    'className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-white z-50 flex flex-col overflow-y-auto md:hidden"'
)

# Add Home, Shop Collection, Track Order before New Arrivals
new_links = """              <div className="flex flex-col px-4 pb-4">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Home</span>
                </Link>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Shop Collection</span>
                </Link>
                <Link to="/track" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Track Order</span>
                </Link>"""

content = content.replace(
    '<div className="flex flex-col px-4 pb-4">',
    new_links
)

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
