import os

filepath = 'src/pages/Product.tsx'

with open(filepath, 'r') as f:
    content = f.read()

state_to_add = """  const [activeAccordion, setActiveAccordion] = useState<string | null>('inclusions');
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setMainImage(product.image);
    }
  }, [product]);
"""

content = content.replace("  const [activeAccordion, setActiveAccordion] = useState<string | null>('inclusions');", state_to_add)

with open(filepath, 'w') as f:
    f.write(content)
