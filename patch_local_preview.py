import sys

with open('src/pages/Admin.tsx', 'r') as f:
    content = f.read()

# Add localPreview state
state_block = "const [uploadLoading, setUploadLoading] = useState(false);"
new_state_block = "const [uploadLoading, setUploadLoading] = useState(false);\n  const [localPreview, setLocalPreview] = useState<string | null>(null);"
content = content.replace(state_block, new_state_block)

# Add clear local preview in resetForm
reset_block = "setFormData({\n      name: '',"
new_reset_block = "setLocalPreview(null);\n    setFormData({\n      name: '',"
content = content.replace(reset_block, new_reset_block)

# Clear local preview when clicking edit
edit_block = "setEditingProductId(product.id || null);"
new_edit_block = "setLocalPreview(null);\n    setEditingProductId(product.id || null);"
content = content.replace(edit_block, new_edit_block)

# Show local preview early
upload_block = """                        if (!file) return;
                        
                        setUploadLoading(true);"""
new_upload_block = """                        if (!file) return;
                        
                        // Create local preview immediately
                        const objectUrl = URL.createObjectURL(file);
                        setLocalPreview(objectUrl);
                        
                        setUploadLoading(true);"""
content = content.replace(upload_block, new_upload_block)

# Update the image display to use localPreview if available
preview_block = """                {formData.image && (
                  <div className="mt-3">
                    <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded border border-gray-200 shadow-sm" />
                  </div>
                )}"""
new_preview_block = """                {(localPreview || formData.image) && (
                  <div className="mt-3 relative inline-block">
                    <img src={localPreview || formData.image} alt="Preview" className="w-24 h-24 object-cover rounded border border-gray-200 shadow-sm" />
                    {uploadLoading && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
                        <div className="w-5 h-5 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                )}"""
content = content.replace(preview_block, new_preview_block)

with open('src/pages/Admin.tsx', 'w') as f:
    f.write(content)

print("Patched local preview")
