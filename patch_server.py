import sys

with open('server.ts', 'r') as f:
    content = f.read()

import_block = "import { eq, lt } from \"drizzle-orm\";"
if import_block not in content:
    print("Could not find eq, lt import")

new_route = """  app.put("/api/products/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const parsedId = Number(id);
      if (isNaN(parsedId)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }
      const updatedProduct = await db.update(products).set({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        image: req.body.image,
        category: req.body.category,
        stoneColor: req.body.stoneColor,
        plating: req.body.plating,
        description: req.body.description,
        inclusions: req.body.inclusions
      }).where(eq(products.id, parsedId)).returning();
      
      if (updatedProduct.length > 0) {
        res.json(updatedProduct[0]);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Example secured route"""

content = content.replace("  // Example secured route", new_route)

with open('server.ts', 'w') as f:
    f.write(content)
print("Patched server.ts")
