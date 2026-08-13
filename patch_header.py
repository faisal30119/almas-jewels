import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

# Make Left logo z-10
content = content.replace(
    'className={cn("flex items-center justify-start transition-all duration-300", isSearchOpen ? "hidden lg:flex lg:flex-1 pr-2" : "flex-1 pr-2")}',
    'className={cn("flex items-center justify-start transition-all duration-300 z-10", isSearchOpen ? "hidden lg:flex lg:flex-1 pr-2" : "flex-1 pr-2")}'
)

# Make Center absolute
content = content.replace(
    '<div className="hidden md:flex items-center justify-center gap-6 lg:gap-10 text-xs lg:text-sm uppercase tracking-widest font-medium flex-1">',
    '<div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-6 lg:gap-10 text-xs lg:text-sm uppercase tracking-widest font-medium z-10">'
)

# Make Right z-10 and ensure mobile menu is properly centered in its box
content = content.replace(
    '<div className="flex flex-1 justify-end items-center gap-4 lg:gap-6">',
    '<div className="flex flex-1 justify-end items-center gap-4 lg:gap-6 z-10">'
)

content = content.replace(
    '<button \n            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}\n            className="md:hidden text-white hover:text-gold-400 transition-colors focus:outline-none shrink-0"\n            aria-label="Toggle menu"\n          >',
    '<button \n            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}\n            className="md:hidden flex items-center justify-center p-1 text-white hover:text-gold-400 transition-colors focus:outline-none shrink-0"\n            aria-label="Toggle menu"\n          >'
)

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
