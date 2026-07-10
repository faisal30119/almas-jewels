#!/bin/bash
sed -i 's/import { products, categories/import { products as hardcodedProducts, categories/g' src/pages/Shop.tsx
