import sys

with open('server.ts', 'r') as f:
    content = f.read()

new_route = '''  app.post("/api/products", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const newProduct = await db.insert(products).values({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        image: req.body.image,
        category: req.body.category,
        stoneColor: req.body.stoneColor,
        plating: req.body.plating,
        description: req.body.description,
        inclusions: req.body.inclusions
      }).returning();
      res.json(newProduct[0]);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Example secured route'''

content = content.replace("  // Example secured route", new_route)

with open('server.ts', 'w') as f:
    f.write(content)
print("Added POST /api/products route")
