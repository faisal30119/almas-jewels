import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import { AdminRoute } from './components/AdminRoute';

import Admin from './pages/Admin';

// Component to catch Firebase action links (like ?mode=resetPassword&oobCode=...) anywhere in the app
function AuthActionHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if (mode === 'resetPassword' && oobCode && location.pathname !== '/reset-password') {
      navigate(`/reset-password?oobCode=${encodeURIComponent(oobCode)}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <AuthActionHandler />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="track" element={<OrderTracking />} />
                <Route path="profile" element={<Profile />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="auth/action" element={<ResetPassword />} />
                <Route path="admin" element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } />
              </Route>
              <Route path="/success" element={<Success />} />
            </Routes>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

