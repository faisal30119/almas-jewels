import sys

with open('src/pages/Shop.tsx', 'r') as f:
    content = f.read()

old_block = '''        {/* Filters Sidebar */}
        <aside className={cn(
          "lg:w-64 flex-shrink-0 transition-all duration-300 overflow-hidden",
          isFilterOpen ? "max-h-[2000px]" : "max-h-0 lg:max-h-full"
        )}>
          <div className="space-y-10">
            {/* Sort Filter */}
            <div>'''

new_block = '''        {/* Filters Sidebar */}
        <aside className={cn(
          "lg:w-64 flex-shrink-0 transition-all duration-300 overflow-hidden",
          isFilterOpen ? "max-h-[2000px] mt-6 lg:mt-0" : "max-h-0 lg:max-h-full"
        )}>
          <div className="grid grid-cols-2 lg:flex lg:flex-col gap-x-4 gap-y-8 lg:gap-y-10">
            {/* Sort Filter */}
            <div className="col-span-2 lg:col-span-1">'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('src/pages/Shop.tsx', 'w') as f:
        f.write(content)
    print("Patched Shop.tsx successfully")
else:
    print("Could not find replacement block in Shop.tsx")

