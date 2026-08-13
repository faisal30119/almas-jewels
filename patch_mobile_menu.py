import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

# Remove the old AnimatePresence for the Mobile Menu Overlay
old_menu_start = content.find('{/* Mobile Menu Overlay */}');
old_menu_end = content.find('</AnimatePresence>', old_menu_start) + len('</AnimatePresence>')

old_menu_code = content[old_menu_start:old_menu_end]

new_menu_code = """{/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-white z-50 flex flex-col overflow-y-auto md:hidden"
            >
              <div className="p-4 flex items-center">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#D4A359] p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col px-4 pb-4">
                <Link to="/shop?sort=new" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1599643478524-fb66f4568e62?w=100&q=80" alt="New Arrivals" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">New Arrivals</span>
                  <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">New</span>
                </Link>
                <Link to="/shop?sort=popular" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80" alt="Best Seller" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">Best Seller</span>
                </Link>
                <Link to="/shop?category=Necklace Set" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&q=80" alt="Necklace Set" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">Necklace Set</span>
                </Link>
                <Link to="/shop?category=Mangalsutra" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&q=80" alt="Mangalsutra" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">Mangalsutra</span>
                </Link>
                <Link to="/shop?category=Rings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=100&q=80" alt="Rings" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">Rings</span>
                </Link>
                <Link to="/shop?category=Necklaces" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1599643477874-5c866d595cf6?w=100&q=80" alt="Necklace" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">Necklace</span>
                </Link>
                <Link to="/shop?category=Earrings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=100&q=80" alt="Earrings" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">Earrings</span>
                  <span className="ml-auto bg-[#D4A359] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">Pro</span>
                </Link>
                <Link to="/shop?category=Bracelets" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80" alt="Bracelets" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">Bracelets</span>
                </Link>
                <Link to="/shop?category=Gifting" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-3 border-b border-gray-100">
                  <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80" alt="Gifting" className="w-12 h-12 rounded-full object-cover" />
                  <span className="text-gray-900 font-medium">Gifting</span>
                </Link>
              </div>

              <div className="px-4 pb-8">
                <div className="flex gap-4 mb-4">
                  <Link 
                    to={user ? "/profile" : "/"} 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if(!user) openAuthModal('login');
                    }}
                    className="flex-1 bg-[#D4A359] hover:bg-[#c19248] text-white py-3 px-4 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="flex-1 bg-[#D4A359] hover:bg-[#c19248] text-white py-3 px-4 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <Search className="w-4 h-4" /> Search
                  </button>
                </div>

                {!user ? (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="w-[calc(50%-0.5rem)] bg-[#D4A359] hover:bg-[#c19248] text-white py-3 px-4 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <User className="w-4 h-4" /> Login
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-[calc(50%-0.5rem)] bg-[#D4A359] hover:bg-[#c19248] text-white py-3 px-4 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>"""

if old_menu_start != -1:
    content = content[:old_menu_start] + new_menu_code + content[old_menu_end:]
    with open('src/components/Layout.tsx', 'w') as f:
        f.write(content)
    print("Replaced mobile menu successfully")
else:
    print("Could not find mobile menu code to replace")
