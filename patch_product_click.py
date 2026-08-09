import os

filepath = 'src/pages/Product.tsx'

with open(filepath, 'r') as f:
    content = f.read()

replacement = """          {/* Thumbnail placeholders */}
          <div className="grid grid-cols-5 gap-2">
            {(product.name.includes("Rubans Pendant") 
              ? [
                  '/assets/images/61iXLd1O+OL._SY695_.jpg', 
                  '/assets/images/61cPASED62L._SY695_.jpg', 
                  '/assets/images/61vDXnCmbpL._SY695_.jpg', 
                  '/assets/images/71V52eCgCNL._SY695_.jpg', 
                  '/assets/images/51yFEaupQUL._SY695_.jpg'
                ]
              : [product.image, product.image, product.image, product.image, product.image]
            ).map((img, i) => (
              <div key={i} onClick={() => setMainImage(img)} className={`aspect-square bg-gray-200 overflow-hidden cursor-pointer transition-opacity group ${mainImage === img ? 'ring-2 ring-emerald-950 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                <img src={img} alt={`${product.name} view ${i}`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>"""

# I need to find the current block
old_block = """          {/* Thumbnail placeholders */}
          <div className="grid grid-cols-5 gap-2">
            {(product.name.includes("Rubans Pendant") 
              ? [
                  '/assets/images/61iXLd1O+OL._SY695_.jpg', 
                  '/assets/images/61cPASED62L._SY695_.jpg', 
                  '/assets/images/61vDXnCmbpL._SY695_.jpg', 
                  '/assets/images/71V52eCgCNL._SY695_.jpg', 
                  '/assets/images/51yFEaupQUL._SY695_.jpg'
                ]
              : [product.image, product.image, product.image, product.image, product.image]
            ).map((img, i) => (
              <div key={i} onClick={() => setMainImage(img)} className={`aspect-square bg-gray-200 overflow-hidden cursor-pointer transition-opacity group ${mainImage === img ? 'ring-2 ring-emerald-950' : 'opacity-60 hover:opacity-100'}`}>
                <img src={img} alt={`${product.name} view ${i}`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>"""

content = content.replace(old_block, replacement)

with open(filepath, 'w') as f:
    f.write(content)
