import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Loader2, ArrowLeft, Shield, LogIn, Trash2, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { products } from '../data';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export default function Checkout() {
  const { items, cartCount, clearCart, removeFromCart } = useCart();
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [loginMethod, setLoginMethod] = useState<'google' | 'phone' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

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

  // Hydrate cart items with product data
  const cartItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product !== undefined);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 500 : 0;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setPhoneError("Please enter a valid phone number");
      return;
    }
    setPhoneError('');
    setPhoneLoading(true);
    
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        setPhoneError("Phone authentication is not enabled. Please enable it in the Firebase Console -> Authentication -> Sign-in method.");
      } else {
        console.error(error);
        setPhoneError(error.message || "Failed to send OTP. Please try again.");
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    
    setPhoneError('');
    setPhoneLoading(true);
    
    try {
      await confirmationResult.confirm(otp);
      // Auth context will automatically handle the user state update
    } catch (error: any) {
      console.error(error);
      setPhoneError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
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
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.error) {
        alert(orderData.error);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock', // Fallback for dev if not using real key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Almas Bridal",
        description: "Test Transaction",
        image: "https://images.unsplash.com/photo-1599643478514-4a410f135b5a?w=100&h=100&fit=crop", // Add a small logo
        order_id: orderData.id,
        handler: async function (response: any) {
          // Verify payment success here (ideally server-side)
          console.log("Payment Successful", response);
          
          const orderId = response.razorpay_order_id || `#AB-${Math.floor(1000 + Math.random() * 9000)}`;
          
          try {
            if (user) {
              await addDoc(collection(db, 'orders'), {
                userId: user.uid,
                orderId: orderId,
                amount: total,
                items: cartItems.map(item => ({
                  id: item.id,
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price
                })),
                status: 'Processing',
                shippingDetails,
                createdAt: serverTimestamp()
              });
            }

            await fetch('/api/payment/success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                paymentId: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: shippingDetails.email,
                phone: shippingDetails.phone,
                amount: total
              })
            });
          } catch (e) {
            console.error("Failed to trigger notifications", e);
          }

          clearCart();
          navigate('/success', { state: { orderId } });
        },
        prefill: {
          name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        theme: {
          color: "#064e3b", // emerald-950
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment failed", error);
      setIsProcessing(false);
    }
  };

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

  if (!loading && !user) {
    return (
      <div className="pt-20 pb-24 px-6 md:px-12 text-center min-h-[60vh] max-w-2xl mx-auto flex flex-col items-center justify-center">
        <Shield className="w-16 h-16 text-emerald-950/20 mb-6" />
        <h2 className="text-3xl font-serif text-emerald-950 mb-4">Sign in to Checkout</h2>
        <p className="text-gray-500 font-light mb-8 text-lg">Please sign in or create an account to securely complete your purchase and track your order.</p>
        
        <div className="w-full max-w-md space-y-4">
          {!loginMethod && (
            <div className="flex flex-col gap-4">
              <button 
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (e) {}
                }}
                className="w-full flex items-center justify-center gap-3 bg-emerald-950 hover:bg-emerald-900 text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Continue with Google
              </button>
              
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button 
                onClick={() => setLoginMethod('phone')}
                className="w-full flex items-center justify-center gap-3 border border-emerald-950 text-emerald-950 hover:bg-emerald-50 px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors"
              >
                <Phone className="w-5 h-5" />
                Continue with Phone
              </button>
            </div>
          )}

          {loginMethod === 'phone' && (
            <div className="bg-white p-6 md:p-8 border border-gray-200 text-left">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => {
                  setLoginMethod(null);
                  setConfirmationResult(null);
                  setPhoneNumber('');
                  setOtp('');
                  setPhoneError('');
                }} className="text-gray-400 hover:text-emerald-950 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-serif text-emerald-950">Phone Sign In</h3>
              </div>
              
              {phoneError && <p className="text-red-500 text-sm mb-4">{phoneError}</p>}
              
              {!confirmationResult ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                        +91
                      </span>
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number" 
                        className="flex-1 block w-full bg-white border border-gray-200 p-3 focus:outline-none focus:border-emerald-950 transition-colors font-light" 
                        required 
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={phoneLoading || phoneNumber.length < 10}
                    className="w-full bg-emerald-950 hover:bg-emerald-900 disabled:bg-emerald-950/70 text-white py-3 flex items-center justify-center gap-2 uppercase tracking-widest font-medium text-sm transition-colors"
                  >
                    {phoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Enter OTP sent to +91 {phoneNumber}</label>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit OTP" 
                      className="w-full bg-white border border-gray-200 p-3 text-center tracking-[1em] focus:outline-none focus:border-emerald-950 transition-colors font-light" 
                      required 
                      maxLength={6}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={phoneLoading || otp.length < 6}
                    className="w-full bg-emerald-950 hover:bg-emerald-900 disabled:bg-emerald-950/70 text-white py-3 flex items-center justify-center gap-2 uppercase tracking-widest font-medium text-sm transition-colors"
                  >
                    {phoneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Sign In'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setConfirmationResult(null);
                      setOtp('');
                    }}
                    className="w-full text-center text-sm text-emerald-950 font-medium pt-2"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
              <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
            </div>
          )}
        </div>
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

      <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20">
        {/* Left Column: Forms */}
        <div className="flex-1 space-y-12">
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
                onClick={handlePaymentSubmit}
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
                    <img src={item.product!.image} alt={item.product!.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-emerald-950 font-medium text-sm mb-1 leading-snug">{item.product!.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-emerald-900 font-medium">₹{(item.product!.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                </div>
              ))}
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
      </div>
    </div>
  );
}
