#!/bin/bash
sed -i 's/import { products } from/import { products as hardcodedProducts, Product } from/g' src/pages/Product.tsx
