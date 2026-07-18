import sys

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

old_block = """      setMessage('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        stock: '',
        image: '',
        category: categories[0],
        stoneColor: stoneColors[0],
        plating: platings[0],
        description: '',
        inclusions: ''
      });
    } catch (err: any) {"""

new_block = """      setMessage('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        stock: '',
        image: '',
        category: categories[0],
        stoneColor: stoneColors[0],
        plating: platings[0],
        description: '',
        inclusions: ''
      });
      
      // Switch to database viewer to show the product table
      setActiveTable('products');
      setActiveTab('db');
    } catch (err: any) {"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('src/pages/Admin.tsx', 'w') as f:
        f.write(content)
    print("Patched Admin.tsx redirect")
else:
    print("Could not find block in Admin.tsx")
