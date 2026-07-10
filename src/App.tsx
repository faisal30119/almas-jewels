import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/Product';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';

import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="track" element={<OrderTracking />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<Admin />} />
              </Route>
              <Route path="/success" element={<Success />} />
            </Routes>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
