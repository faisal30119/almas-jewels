import sys
import re

with open('src/pages/Checkout.tsx', 'r') as f:
    content = f.read()

# Replace the 3 items mapping blocks
def replacer(match):
    return """items: cartItems.map(item => ({
                  id: item.product?.id || item.productId || (item as any).id || "unknown_id",
                  name: item.product?.name || (item as any).name || 'Unknown Item',
                  quantity: item.quantity || 1,
                  price: item.product?.price || (item as any).price || 0
                })),"""

# In Checkout.tsx, the indentation might vary, so we'll just replace carefully
old1 = """items: cartItems.map(item => ({
                  id: item.product?.id || item.productId,
                  name: item.product?.name || 'Unknown Item',
                  quantity: item.quantity,
                  price: item.product?.price || 0
                })),"""

new1 = """items: cartItems.map(item => ({
                  id: item.product?.id || item.productId || (item as any).id || "unknown_id",
                  name: item.product?.name || (item as any).name || 'Unknown Item',
                  quantity: item.quantity || 1,
                  price: item.product?.price || (item as any).price || 0
                })),"""

old2 = """items: cartItems.map(item => ({
                    id: item.product?.id || item.productId,
                    name: item.product?.name || 'Unknown Item',
                    quantity: item.quantity,
                    price: item.product?.price || 0
                  })),"""

new2 = """items: cartItems.map(item => ({
                    id: item.product?.id || item.productId || (item as any).id || "unknown_id",
                    name: item.product?.name || (item as any).name || 'Unknown Item',
                    quantity: item.quantity || 1,
                    price: item.product?.price || (item as any).price || 0
                  })),"""

old3 = """items: cartItems.map(item => ({
                id: item.product?.id || item.productId,
                name: item.product?.name || 'Unknown Item',
                quantity: item.quantity,
                price: item.product?.price || 0
              })),"""

new3 = """items: cartItems.map(item => ({
                id: item.product?.id || item.productId || (item as any).id || "unknown_id",
                name: item.product?.name || (item as any).name || 'Unknown Item',
                quantity: item.quantity || 1,
                price: item.product?.price || (item as any).price || 0
              })),"""
              
if old1 in content:
    content = content.replace(old1, new1)
if old2 in content:
    content = content.replace(old2, new2)
if old3 in content:
    content = content.replace(old3, new3)

with open('src/pages/Checkout.tsx', 'w') as f:
    f.write(content)
print("Patched Checkout.tsx addDoc")

