import sys

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

old_block = '''              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                <div className="flex gap-4 items-center">
                  <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="flex-1 border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
                  <span className="text-gray-400">or</span>
                  <label className="bg-gray-100 px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700">{loading ? 'Uploading...' : 'Upload Image'}</span>'''

new_block = '''              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                  <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="w-full sm:flex-1 border border-gray-300 p-2 rounded focus:border-gold-500 focus:outline-none" />
                  <span className="text-gray-400 text-center sm:text-left">or</span>
                  <label className="bg-gray-100 px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap text-center">
                    <span className="text-sm font-medium text-gray-700">{loading ? 'Uploading...' : 'Upload Image'}</span>'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('src/pages/Admin.tsx', 'w') as f:
        f.write(content)
    print("Patched Admin.tsx successfully")
else:
    print("Could not find replacement block in Admin.tsx")

