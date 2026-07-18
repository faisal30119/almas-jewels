import sys

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

# Replace loading with submitLoading and uploadLoading
content = content.replace("const [loading, setLoading] = useState(false);", "const [submitLoading, setSubmitLoading] = useState(false);\n  const [uploadLoading, setUploadLoading] = useState(false);")

# Update loading references where appropriate
content = content.replace("setLoading(true);", "setSubmitLoading(true);")
content = content.replace("setLoading(false);", "setSubmitLoading(false);")
content = content.replace("disabled={loading}", "disabled={submitLoading || uploadLoading}")

# Revert the one in upload image
content = content.replace("setSubmitLoading(true);\n                        const uploadData = new FormData();", "setUploadLoading(true);\n                        const uploadData = new FormData();")
content = content.replace("setSubmitLoading(false);\n                        }", "setUploadLoading(false);\n                        }")

content = content.replace("{loading ? 'Uploading...' : 'Upload Image'}", "{uploadLoading ? 'Uploading...' : 'Upload Image'}")

button_block = """            <button disabled={submitLoading || uploadLoading} type="submit" className="bg-emerald-950 text-white px-8 py-3 hover:bg-emerald-900 transition-colors disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Product'}
            </button>"""
new_button_block = """            <div className="flex gap-4">
              <button disabled={submitLoading || uploadLoading} type="submit" className="bg-emerald-950 text-white px-8 py-3 hover:bg-emerald-900 transition-colors disabled:opacity-50">
                {submitLoading ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}
              </button>
              {editingProductId && (
                <button type="button" onClick={resetForm} className="px-8 border border-gray-300 text-gray-700 py-3 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              )}
            </div>"""
content = content.replace(button_block, new_button_block)
# In case the loading ternary wasn't replaced properly:
content = content.replace("{submitLoading || uploadLoading ? 'Adding...' : 'Add Product'}", "{submitLoading ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}")

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)

print("Fixed Admin.tsx loading and submit button")
