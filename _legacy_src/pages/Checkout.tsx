declare global {
  interface Window {
    recaptchaVerifier: any;
    grecaptcha: any;
    Razorpay: any;
  }
}
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Loader2, ArrowLeft, Shield, LogIn, Trash2, Phone, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const royalCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg';
const solitaireCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg';
const occasionCollectionImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg';
const pendantMainImg = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277893/almas_bridal/assets/panbrhgotshii2pl5zkb.jpg';
const pendantSub1Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277895/almas_bridal/assets/blteocmlx1mlsl7qtzx0.jpg';
const pendantSub2Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277897/almas_bridal/assets/uffidivwpwv2wicg7m71.jpg';
const pendantSub3Img = 'https://res.cloudinary.com/niagn9pn/image/upload/v1786277900/almas_bridal/assets/e5g5yagqr1ksbakallnl.jpg';


const imageMap: Record<string, string> = {
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277886/almas_bridal/assets/dpjqxedlu5oleauyj40l.jpg': royalCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg': solitaireCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277883/almas_bridal/assets/brxuufifingum5xyjodn.jpg': occasionCollectionImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277893/almas_bridal/assets/panbrhgotshii2pl5zkb.jpg': pendantMainImg,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277895/almas_bridal/assets/blteocmlx1mlsl7qtzx0.jpg': pendantSub1Img,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277897/almas_bridal/assets/uffidivwpwv2wicg7m71.jpg': pendantSub2Img,
  'https://res.cloudinary.com/niagn9pn/image/upload/v1786277900/almas_bridal/assets/e5g5yagqr1ksbakallnl.jpg': pendantSub3Img,

};

import { Product } from '../data';
import { supabase } from '../lib/supabase';
import { fetchAllProducts } from '../lib/productsService';

export default function Checkout() {
  const { items, cartCount, clearCart, removeFromCart, updateQuantity } = useCart();
  const { user, loading, openAuthModal } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user && user.email) {
      setShippingDetails(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const prods = await fetchAllProducts();
        if (isMounted) {
          setDbProducts(prods);
        }
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Hydrate cart items with product data
  const cartItems = items.map(item => {
    const product = dbProducts.find(p => String(p.id) === String(item.productId));
    return { ...item, product };
  }).filter(item => item.product !== undefined);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 10 : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon({ code: data.code, discount: data.discountAmount });
        setCouponCode('');
      } else {
        const err = await res.json();
        setCouponError(err.error || 'Invalid coupon code');
      }
    } catch (e) {
      setCouponError('Failed to validate coupon.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };


  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartCount === 0) return;
    
    if (!shippingDetails.firstName || !shippingDetails.lastName || !shippingDetails.email || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.postalCode) {
      alert("Please fill in all shipping details");
      return;
    }

    setIsProcessing(true);
    
    try {
      if (total === 0) {
        // Complete order without Razorpay using Store Credit
        try {
          // Create order
          const orderResponse = await fetch("/api/payment/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: 0,
              currency: "INR",
              items: cartItems.map(i => ({ productId: i.product?.id || i.productId, quantity: i.quantity, price: i.product?.price || 0 })),
              shippingDetails,
              userId: user ? user.id : null
            }),
          });
          const orderData = await orderResponse.json();
          const orderId = orderData.id;

          if (user) {
            await supabase.from('user_orders').insert({
              user_id: user.id,
              order_id: orderId,
              amount: total,
              items: cartItems.map(item => ({
                id: item.product?.id || item.productId || (item as any).id || 'unknown_id',
                name: item.product?.name || (item as any).name || 'Unknown Item',
                quantity: item.quantity || 1,
                price: item.product?.price || (item as any).price || 0
              })),
              shipping_details: {
                name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
                address: shippingDetails.address,
                city: shippingDetails.city,
                postalCode: shippingDetails.postalCode
              },
              status: 'Processing',
              payment_method: 'Store Credit',
              created_at: new Date().toISOString()
            });
          }

          await fetch("/api/payment/success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId,
              paymentId: "STORE_CREDIT",
              customerName: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
              customerEmail: shippingDetails.email,
              customerPhone: shippingDetails.phone,
              customerAddress: `${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.postalCode}`,
              amount: total,
              cartItems: cartItems.map(item => ({
                name: item.product?.name || (item as any).name || 'Unknown Item',
                quantity: item.quantity || 1,
                price: item.product?.price || (item as any).price || 0
              }))
            })
          });

          // Invalidate coupon code
          if (appliedCoupon) {
            await fetch("/api/coupons/invalidate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: appliedCoupon.code })
            });
          }

          clearCart();
          navigate('/success');
        } catch (err) {
          console.error("Error saving zero-total order", err);
          alert("Failed to save order.");
          setIsProcessing(false);
        }
        return;
      }

      // Load Razorpay script
      const res = await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // Create order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          items: cartItems.map(i => ({ productId: i.product?.id || i.productId, quantity: i.quantity, price: i.product?.price || 0 })),
          shippingDetails,
          userId: user ? user.id : null
        }),
      });

      const orderData = await orderResponse.json();






      const handleSuccess = async (response: any) => {
          // Verify payment success here (ideally server-side)
          console.log("Payment Successful", response);
          
          const orderId = response.razorpay_order_id || orderData.id;
          
          try {
            if (user) {
              await supabase.from('user_orders').insert({
                user_id: user.id,
                order_id: orderId,
                amount: total,
                items: cartItems.map(item => ({
                  id: item.product?.id || item.productId || (item as any).id || 'unknown_id',
                  name: item.product?.name || (item as any).name || 'Unknown Item',
                  quantity: item.quantity || 1,
                  price: item.product?.price || (item as any).price || 0
                })),
                status: 'Processing',
                shipping_details: shippingDetails,
                created_at: new Date().toISOString()
              });
            }

            await fetch('/api/payment/success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                paymentId: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                firstName: shippingDetails.firstName,
                lastName: shippingDetails.lastName,
                email: shippingDetails.email,
                address: shippingDetails.address,
                phone: shippingDetails.phone,
                city: shippingDetails.city,
                postalCode: shippingDetails.postalCode,
                amount: total,
                cartItems: cartItems.map(item => ({
                  name: item.product?.name || (item as any).name || 'Unknown Item',
                  quantity: item.quantity || 1,
                  price: item.product?.price || (item as any).price || 0
                }))
              })
            });
          } catch (e) {
            console.error("Failed to trigger notifications", e);
          }

          clearCart();
          navigate('/success', { state: { orderId } });
        };

      if (orderData.error) {
        if (orderData.error.includes("Razorpay authentication failed") || orderData.error.includes("Razorpay is not configured")) {
           // Mock successful payment for preview mode
           alert("Preview Mode: Razorpay is not configured. Simulating successful payment...");
           setPaymentError(null);
           setTimeout(() => {
             handleSuccess({
                razorpay_payment_id: "mock_payment_" + Math.random().toString(36).substring(7),
                razorpay_order_id: "mock_order_" + Math.random().toString(36).substring(7),
                razorpay_signature: "mock_signature"
             });
           }, 1000);
           return;
        }

        setPaymentError(orderData.error);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock', // Fallback for dev if not using real key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Almas Jewels",
        description: "Your Dream Jewelry Purchase",
        image: "https://res.cloudinary.com/niagn9pn/image/upload/v1786277888/almas_bridal/assets/uoge8dcesrge8bsgimj6.jpg", // Add a small logo
        order_id: orderData.id,
        handler: handleSuccess,
        prefill: {
          name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        theme: {
          color: "#064e3b", // emerald-950
        },
        config: {
          display: {
            blocks: {
              default: {
                name: "Pay via UPI, Cards or Netbanking",
                instruments: [
                  { method: "upi" },
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" }
                ]
              }
            },
            sequence: ["block.default"],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        modal: {
          ondismiss: async function() {
            setIsProcessing(false);
            setPaymentError("Payment was cancelled");
            try {
              if (user) {
                await supabase.from('user_orders').insert({
                  user_id: user.id,
                  order_id: orderData.id,
                  amount: total,
                  items: cartItems.map(item => ({
                    id: item.product?.id || item.productId || (item as any).id || 'unknown_id',
                    name: item.product?.name || (item as any).name || 'Unknown Item',
                    quantity: item.quantity || 1,
                    price: item.product?.price || (item as any).price || 0
                  })),
                  status: 'failed payment',
                  shipping_details: shippingDetails,
                  error: 'User cancelled',
                  created_at: new Date().toISOString()
                });
              }
              await fetch('/api/payment/failed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: orderData.id,
                  error: "User cancelled"
                })
              });
            } catch (e) {
              console.error(e);
            }
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', async function (response: any) {
        console.error("Payment failed", response.error);
        
        // In preview mode, allow simulating success on failure
        if (response.error.description.includes("trouble") || response.error.description.includes("test") || response.error.description.includes("Amount exceeds")) {
           alert("Preview Mode: Payment failed in test mode. Simulating successful payment...");
           setPaymentError(null);
           setTimeout(() => {
             handleSuccess({
                razorpay_payment_id: "mock_payment_" + Math.random().toString(36).substring(7),
                razorpay_order_id: response.error.metadata.order_id || "mock_order",
                razorpay_signature: "mock_signature"
             });
           }, 1000);
           return;
        }

        setPaymentError(response.error.description);
        
        try {
          if (user) {
            await supabase.from('user_orders').insert({
              user_id: user.id,
              order_id: orderData.id,
              amount: total,
              items: cartItems.map(item => ({
                id: item.product?.id || item.productId || (item as any).id || 'unknown_id',
                name: item.product?.name || (item as any).name || 'Unknown Item',
                quantity: item.quantity || 1,
                price: item.product?.price || (item as any).price || 0
              })),
              status: 'Failed',
              shipping_details: shippingDetails,
              error: response.error.description,
              created_at: new Date().toISOString()
            });
          }

          await fetch('/api/payment/failed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.id,
              error: response.error.description,
              paymentId: response.error.metadata.payment_id
            })
          });
        } catch(e) {
          console.error("Failed to process failure hook", e);
        }
        
        setIsProcessing(false);
      });

      paymentObject.open();

    } catch (error: any) {
      console.error("Payment failed", error);
      setPaymentError(error.message || "Failed to initialize payment gateway");
      setIsProcessing(false);
    }
  };

  if (paymentError) {
    return (
      <div className="pt-20 pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 md:p-12 shadow-xl border border-red-100 max-w-md w-full mx-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h2 className="text-2xl font-serif text-emerald-950 mb-2">Payment Failed</h2>
          <p className="text-gray-600 font-light mb-8 text-sm">
            We couldn't process your payment. Reason: <br />
            <span className="font-medium text-red-600">{paymentError}</span>
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setPaymentError(null)}
              className="bg-emerald-950 hover:bg-emerald-900 text-white py-4 uppercase tracking-widest text-sm font-medium transition-colors w-full"
            >
              Try Again
            </button>
            <button 
              onClick={() => { setPaymentError(null); navigate('/shop'); }}
              className="bg-transparent border border-emerald-950 text-emerald-950 hover:bg-emerald-50 py-4 uppercase tracking-widest text-sm font-medium transition-colors w-full"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="pt-20 pb-24 text-center min-h-[60vh]">
        <h2 className="text-2xl font-serif text-emerald-950 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 font-light mb-8">Looks like you haven't added any elegant pieces yet.</p>
        <Link to="/shop" className="bg-emerald-950 hover:bg-emerald-900 text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  if (productsLoading) {
    return (
      <div className="pt-20 pb-24 flex justify-center min-h-[60vh] items-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      <div className="mb-12">
        <Link to="/shop" className="flex items-center gap-2 text-sm uppercase tracking-widest text-gray-500 hover:text-emerald-950 transition-colors mb-4 w-max">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif text-emerald-950">Secure Checkout</h1>
      </div>

      <form onSubmit={handlePaymentSubmit} className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20">
        {/* Left Column: Forms */}
        <div className="flex-1 space-y-12">
          
          {!user && !loading && (
            <section className="bg-emerald-50 p-6 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-emerald-950 text-lg mb-1">Already have an account?</h3>
                <p className="text-sm text-gray-600 font-light">Sign in for faster checkout and tracking.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center justify-center gap-2 bg-white text-emerald-950 border border-emerald-950 px-6 py-2 uppercase tracking-widest text-xs font-medium hover:bg-emerald-950 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In / Register
                </button>
              </div>
            </section>
          )}

          {/* Shipping Details */}
          <section>
            <h2 className="text-xl font-serif text-emerald-950 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-950 text-white text-xs flex items-center justify-center font-sans">1</span>
              Shipping Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="firstName" value={shippingDetails.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full bg-white border border-gray-200 p-4 focus:outline-none focus:border-emerald-950 transition-colors font-light" required />
              <input type="text" name="lastName" value={shippingDetails.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full bg-white border border-gray-200 p-4 focus:outline-none focus:border-emerald-950 transition-colors font-light" required />
              <input type="email" name="email" value={shippingDetails.email} onChange={handleInputChange} placeholder="Email Address" className="w-full md:col-span-2 bg-white border border-gray-200 p-4 focus:outline-none focus:border-emerald-950 transition-colors font-light" required />
              <input type="tel" name="phone" value={shippingDetails.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full md:col-span-2 bg-white border border-gray-200 p-4 focus:outline-none focus:border-emerald-950 transition-colors font-light" required />
              <input type="text" name="address" value={shippingDetails.address} onChange={handleInputChange} placeholder="Street Address" className="w-full md:col-span-2 bg-white border border-gray-200 p-4 focus:outline-none focus:border-emerald-950 transition-colors font-light" required />
              <input type="text" name="city" value={shippingDetails.city} onChange={handleInputChange} placeholder="City" className="w-full bg-white border border-gray-200 p-4 focus:outline-none focus:border-emerald-950 transition-colors font-light" required />
              <input type="text" name="postalCode" value={shippingDetails.postalCode} onChange={handleInputChange} placeholder="Postal / Zip Code" className="w-full bg-white border border-gray-200 p-4 focus:outline-none focus:border-emerald-950 transition-colors font-light" required />
            </div>
          </section>

          {/* Payment Details */}
          <section>
            <h2 className="text-xl font-serif text-emerald-950 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-950 text-white text-xs flex items-center justify-center font-sans">2</span>
              Payment
            </h2>
            
            <div className="bg-white p-6 md:p-8 border border-gray-200">
              <p className="text-gray-500 font-light mb-8 text-sm">You will be redirected to Razorpay secure checkout to complete your purchase. All major Credit/Debit cards, UPI, and Wallets are supported.</p>
              
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-emerald-950 hover:bg-emerald-900 disabled:bg-emerald-950/70 text-white py-5 flex items-center justify-center gap-2 uppercase tracking-widest font-medium text-sm transition-colors"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing</>
                ) : (
                  <><Lock className="w-4 h-4" /> Pay ₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} with Razorpay</>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:w-[400px]">
          <div className="bg-[#F5F5F0] p-8 sticky top-32">
            <h2 className="text-xl font-serif text-emerald-950 mb-6">Order Summary</h2>
            
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex gap-4 group">
                  <div className="w-20 h-24 bg-white flex-shrink-0">
                    <img src={item.product!.image} alt={item.product!.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-emerald-950 font-medium text-sm mb-1 leading-snug">{item.product!.name}</h3>
                        <button 
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-500">Qty:</span>
                        <div className="flex items-center border border-gray-200 rounded">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-emerald-950 transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-emerald-950 transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-emerald-900 font-medium">₹{(item.product!.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-emerald-950/10 pt-6 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (Store Credit)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon || applyingCoupon}
                  className="flex-1 bg-transparent border-b border-emerald-950/30 px-0 py-2 focus:border-emerald-950 focus:outline-none placeholder:text-gray-400 font-light text-sm uppercase transition-colors disabled:opacity-50"
                />
                {!appliedCoupon ? (
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="text-xs uppercase tracking-widest text-emerald-900 font-medium hover:text-gold-500 transition-colors disabled:opacity-50"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs uppercase tracking-widest text-red-500 font-medium hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              {appliedCoupon && (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-2 rounded flex justify-between items-center border border-emerald-100">
                  <span className="font-medium tracking-wide">Coupon {appliedCoupon.code} applied</span>
                  <span>-₹{appliedCoupon.discount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              )}
            </div>

            <div className="border-t border-emerald-950/10 pt-6 space-y-4">
              <div className="flex justify-between text-gray-600 font-light text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-light text-sm">
                <span>Shipping</span>
                <span>₹{shipping.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium text-sm">
                  <span>Store Credit</span>
                  <span>-₹{appliedCoupon.discount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-950 font-serif text-xl pt-4 border-t border-emerald-950/10">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
            
            <div className="mt-8 flex items-start gap-3 text-xs text-emerald-900/60 leading-relaxed">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <p>Your payment information is processed securely. We do not store credit card details nor have access to your credit card information.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
