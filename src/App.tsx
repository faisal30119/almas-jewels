import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/Product';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
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
            </Route>
            <Route path="/success" element={<Success />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
