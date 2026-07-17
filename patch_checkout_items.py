import sys

with open('src/pages/Checkout.tsx', 'r') as f:
    content = f.read()

# Replace 1
old1 = "items: cartItems.map(i => ({ productId: i.id || i.productId, quantity: i.quantity, price: i.price })),"
new1 = "items: cartItems.map(i => ({ productId: i.product?.id || i.productId, quantity: i.quantity, price: i.product?.price || 0 })),"
content = content.replace(old1, new1)

# Replace 2 (3 occurrences)
old2 = """              items: cartItems.map(item => ({
                id: item.id || item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })),"""

new2 = """              items: cartItems.map(item => ({
                id: item.product?.id || item.productId,
                name: item.product?.name || 'Unknown Item',
                quantity: item.quantity,
                price: item.product?.price || 0
              })),"""
content = content.replace(old2, new2)

old3 = """                  items: cartItems.map(item => ({
                    id: item.id || item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                  })),"""

new3 = """                  items: cartItems.map(item => ({
                    id: item.product?.id || item.productId,
                    name: item.product?.name || 'Unknown Item',
                    quantity: item.quantity,
                    price: item.product?.price || 0
                  })),"""
content = content.replace(old3, new3)

old4 = """                items: cartItems.map(item => ({
                  id: item.id || item.productId,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price
                })),"""
new4 = """                items: cartItems.map(item => ({
                  id: item.product?.id || item.productId,
                  name: item.product?.name || 'Unknown Item',
                  quantity: item.quantity,
                  price: item.product?.price || 0
                })),"""
content = content.replace(old4, new4)

with open('src/pages/Checkout.tsx', 'w') as f:
    f.write(content)
print("Patched Checkout.tsx items")

