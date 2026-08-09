import os

filepath = 'src/pages/Product.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Replace the [1, 2, 3, 4] map
# We can do this:
# const subImages = product.name.includes("Rubans Pendant") 
#   ? ['/assets/images/61cPASED62L._SY695_.jpg', '/assets/images/61iXLd1O+OL._SY695_.jpg', '/assets/images/61vDXnCmbpL._SY695_.jpg', '/assets/images/71V52eCgCNL._SY695_.jpg'] 
#   : [product.image, product.image, product.image, product.image];

replacement = """          {/* Thumbnail placeholders */}
          <div className="grid grid-cols-4 gap-4">
            {(product.name.includes("Rubans Pendant") 
              ? ['/assets/images/61cPASED62L._SY695_.jpg', '/assets/images/61iXLd1O+OL._SY695_.jpg', '/assets/images/61vDXnCmbpL._SY695_.jpg', '/assets/images/71V52eCgCNL._SY695_.jpg']
              : [product.image, product.image, product.image, product.image]
            ).map((img, i) => (
              <div key={i} onClick={() => setMainImage(img)} className="aspect-square bg-gray-200 overflow-hidden opacity-60 hover:opacity-100 cursor-pointer transition-opacity group">
                <img src={img} alt={`${product.name} view ${i}`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>"""

content = content.replace("""          {/* Thumbnail placeholders */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 overflow-hidden opacity-60 hover:opacity-100 cursor-pointer transition-opacity group">
                <img src={product.image} alt={`${product.name} view ${i}`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>""", replacement)

# We also need to add setMainImage state
# Find where product is fetched, and add state
state_to_add = """  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setMainImage(product.image);
    }
  }, [product]);
"""

content = content.replace("  const [activeAccordion, setActiveAccordion] = useState<string | null>('description');", state_to_add)

# Change the main image rendering to use mainImage || product.image
content = content.replace(
    '<img src={product.image} alt={product.name} className="w-full h-full object-cover"',
    '<img src={mainImage || product.image} alt={product.name} className="w-full h-full object-cover"'
)

with open(filepath, 'w') as f:
    f.write(content)

print("Patched Product.tsx")
