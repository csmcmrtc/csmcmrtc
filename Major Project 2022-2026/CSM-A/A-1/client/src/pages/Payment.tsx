// src/pages/Payment.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Smartphone,
  Building2,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Store,
  Truck,
  User,
  Mail,
  Phone,
  Lock,
//   Eye,
//   EyeOff,
  Package,
  Star
} from 'lucide-react';
import { toast } from 'react-toastify';
import paymentService from '../services/paymentService';

// TypeScript Interfaces
interface Product {
  id: string;
  name: string;
  brand: string;
  size: string;
  image: string;
  price: number;
}

interface StoreDetails {
  id: string;
  name: string;
  type: 'local' | 'delivery';
  address: string;
  distance?: number;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  logo?: string | React.ReactNode;
  color?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'card' | 'upi' | 'wallet' | 'netbanking';
  description: string;
}

interface OrderSummary {
  product: Product;
  store: StoreDetails;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
}

interface BillingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state (passed from Search page)
  const stateData = location.state as {
    product?: Product;
    store?: StoreDetails;
  } | null;

  const productId = searchParams.get('product') || stateData?.product?.id || '';
  const storeId = searchParams.get('store') || stateData?.store?.id || '';
  const orderType = searchParams.get('type') || stateData?.store?.type || 'local';

  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
//   const [showCardDetails, setShowCardDetails] = useState<boolean>(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: ''
  });
  
  // Form Validation
  const [errors, setErrors] = useState<Partial<BillingInfo>>({});
  
  // Payment Methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      type: 'card',
      description: 'Visa, Mastercard, RuPay, Amex'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: <Smartphone className="w-5 h-5" />,
      type: 'upi',
      description: 'PhonePe, Google Pay, Paytm, BHIM'
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      icon: <Wallet className="w-5 h-5" />,
      type: 'wallet',
      description: 'Paytm, Mobikwik, Amazon Pay'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building2 className="w-5 h-5" />,
      type: 'netbanking',
      description: 'All major banks supported'
    }
  ];

  // Build order summary from navigation state or fallback to mock data
  const buildOrderSummary = (): OrderSummary => {
    const product = stateData?.product || {
      id: productId,
      name: 'Product',
      brand: 'Brand',
      size: '',
      image: 'https://via.placeholder.com/100x100?text=Product',
      price: 0
    };

    const store = stateData?.store || {
      id: storeId,
      name: orderType === 'local' ? 'Local Store' : 'Delivery Store',
      type: orderType as 'local' | 'delivery',
      address: '',
      distance: orderType === 'local' ? 0 : undefined,
      rating: 0,
      deliveryTime: orderType === 'delivery' ? '15-20' : undefined,
      deliveryFee: orderType === 'delivery' ? 30 : 0,
      color: orderType === 'delivery' ? 'bg-orange-500' : undefined
    };

    const subtotal = product.price;
    const deliveryFee = store.type === 'delivery' ? (store.deliveryFee || 0) : 0;
    const taxes = Math.round((subtotal + deliveryFee) * 0.05);
    const discount = 0;
    const total = subtotal + deliveryFee + taxes - discount;

    return {
      product,
      store,
      subtotal,
      deliveryFee,
      taxes,
      discount,
      total
    };
  };

  useEffect(() => {
    // Check if we have required data
    if (!stateData?.product && !productId) {
      navigate('/');
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Build order summary from state data
    const summary = buildOrderSummary();
    setOrderSummary(summary);
    setLoading(false);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [stateData, productId, navigate]);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<BillingInfo> = {};

    if (!billingInfo.name || billingInfo.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!billingInfo.email || !emailRegex.test(billingInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!billingInfo.phone || !phoneRegex.test(billingInfo.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (orderType === 'delivery') {
      if (!billingInfo.address || billingInfo.address.length < 10) {
        newErrors.address = 'Please enter a complete address';
      }

      const pincodeRegex = /^\d{6}$/;
      if (!billingInfo.pincode || !pincodeRegex.test(billingInfo.pincode)) {
        newErrors.pincode = 'Please enter a valid 6-digit pincode';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Input Changes
  const handleInputChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Razorpay Payment Handler
  const handlePayment = async () => {
    if (!validateForm() || !orderSummary) return;

    setProcessing(true);

    try {
      // Create order on backend
      const orderResponse = await paymentService.createOrder({
        amount: orderSummary.total,
        currency: 'INR',
        product_id: orderSummary.product.id,
        store_id: orderSummary.store.id,
        product_name: orderSummary.product.name,
        store_name: orderSummary.store.name
      });

      if (!orderResponse.success) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'JustSearch',
        description: `Payment for ${orderSummary.product.brand} ${orderSummary.product.name}`,
        order_id: orderResponse.data.order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Verify payment on backend
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_details: {
                product_id: orderSummary.product.id,
                store_id: orderSummary.store.id,
                product_name: `${orderSummary.product.brand} ${orderSummary.product.name}`,
                product_image: orderSummary.product.image,
                product_price: orderSummary.subtotal,
                delivery_fee: orderSummary.deliveryFee,
                billing_info: {
                  name: billingInfo.name,
                  email: billingInfo.email,
                  phone: billingInfo.phone,
                  address: billingInfo.address,
                  pincode: billingInfo.pincode
                }
              }
            });

            if (verifyResponse.success) {
              toast.success('Payment successful!');
              navigate('/payment-success', {
                state: {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  orderNumber: verifyResponse.data.order_number,
                  amount: orderSummary.total,
                  product: orderSummary.product,
                  store: orderSummary.store
                }
              });
            } else {
              toast.error('Payment verification failed. Please contact support.');
              setProcessing(false);
            }
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: billingInfo.name,
          email: billingInfo.email,
          contact: '+91' + billingInfo.phone
        },
        theme: {
          color: '#0ea5e9'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', (response: { error: { description: string } }) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });

      razorpay.open();
    } catch (error) {
      toast.error('Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Payment Details</h2>
          <p className="text-gray-500">Please wait while we prepare your order...</p>
        </div>
      </main>
    );
  }

  if (!orderSummary) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">Unable to load order details. Please try again.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center cursor-pointer text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand text-white rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-gray-600">Complete your order with confidence</p>
          </div>
        </div>

        {/* SSL Badge */}
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
          <Lock className="w-3 h-3" />
          <span>SSL Encrypted & Secure</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form - Left Side (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Billing Information */}
          <div className="bg-white rounded-xl shadow-medium border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand" />
              Billing Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={billingInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                      errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                      errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <div className="flex">
                    <span className="inline-flex items-center px-2 pl-6 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={billingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`w-full pl-3 pr-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                        errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                      }`}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Delivery Address (only for delivery orders) */}
              {orderType === 'delivery' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={billingInfo.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors resize-none ${
                          errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                        }`}
                        placeholder="Enter your complete delivery address with landmarks"
                      />
                    </div>
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingInfo.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                        errors.pincode ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                      }`}
                      placeholder="123456"
                      maxLength={6}
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-medium border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand" />
              Payment Method
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-brand bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedPaymentMethod === method.id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{method.name}</h4>
                      <p className="text-xs text-gray-600">{method.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPaymentMethod === method.id
                        ? 'border-brand bg-brand'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === method.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Note */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-green-600">Your payment information is encrypted and secure. We don't store your payment details.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary - Right Side (1/3) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-medium border border-gray-200 sticky top-6">
            
                        {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand" />
                Order Summary
              </h3>
            </div>

            {/* Product Details */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <img
                  src={orderSummary.product.image}
                  alt={orderSummary.product.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {orderSummary.product.brand} {orderSummary.product.name}
                  </h4>
                  <p className="text-sm text-gray-600">{orderSummary.product.size}</p>
                  <div className="text-lg font-bold text-brand mt-1">
                    ₹{orderSummary.product.price}
                  </div>
                </div>
              </div>
            </div>

            {/* Store Details */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  orderSummary.store.type === 'local' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {orderSummary.store.type === 'local' ? (
                    <Store className="w-5 h-5" />
                  ) : (
                    <Truck className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{orderSummary.store.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    {orderSummary.store.type === 'local' ? (
                      <>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{orderSummary.store.distance} km</span>
                        </div>
                        {orderSummary.store.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{orderSummary.store.rating}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{orderSummary.store.deliveryTime} mins</span>
                        </div>
                        {orderSummary.store.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{orderSummary.store.rating}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{orderSummary.store.address}</p>
                </div>
              </div>

              {/* Order Type Badge */}
              <div className="mt-3">
                {orderSummary.store.type === 'local' ? (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    <Store className="w-3 h-3" />
                    <span>Store Pickup</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                                        <Truck className="w-3 h-3" />
                    <span>Home Delivery</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-6 border-b border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{orderSummary.subtotal}</span>
                </div>

                {orderSummary.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>₹{orderSummary.deliveryFee}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Taxes & Fees</span>
                  <span>₹{orderSummary.taxes}</span>
                </div>

                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{orderSummary.discount}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span>₹{orderSummary.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="p-6">
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-brand hover:bg-blue-600 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Pay ₹{orderSummary.total}</span>
                  </>
                )}
              </button>

              {/* Payment Security Info */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="w-3 h-3" />
                  <span>Payments secured by Razorpay</span>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <img src="https://via.placeholder.com/40x20?text=VISA" alt="Visa" className="h-5" />
                  <img src="https://via.placeholder.com/40x20?text=MC" alt="Mastercard" className="h-5" />
                  <img src="https://via.placeholder.com/40x20?text=RUPAY" alt="RuPay" className="h-5" />
                  <img src="https://via.placeholder.com/40x20?text=UPI" alt="UPI" className="h-5" />
                </div>
              </div>
            </div>

            {/* Estimated Delivery/Pickup Time */}
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center flex-shrink-0">
                    {orderSummary.store.type === 'local' ? (
                      <Store className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {orderSummary.store.type === 'local' ? 'Pickup Information' : 'Delivery Information'}
                    </h4>
                    {orderSummary.store.type === 'local' ? (
                      <div className="text-sm text-gray-700">
                        <p>• Your order will be ready for pickup in <span className="font-semibold">15-20 minutes</span></p>
                        <p>• Please bring a valid ID for verification</p>
                        <p>• Store timings: 9:00 AM - 10:00 PM</p>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        <p>• Estimated delivery: <span className="font-semibold">{orderSummary.store.deliveryTime} minutes</span></p>
                        <p>• You'll receive live tracking updates</p>
                        <p>• Contactless delivery available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 bg-white rounded-xl shadow-medium border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand" />
              Why Choose JustSearch?
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Best Price Guarantee</span>
                  <p className="text-gray-600">We ensure you get the best deals across all platforms</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Secure Payments</span>
                  <p className="text-gray-600">Bank-grade security with SSL encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <span className="font-medium">24/7 Support</span>
                  <p className="text-gray-600">Get help whenever you need it</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Privacy */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <div className="text-center text-sm text-gray-600">
          <p>
            By completing this purchase, you agree to our{' '}
            <a href="/terms" className="text-brand hover:text-blue-600 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-brand hover:text-blue-600 underline">
              Privacy Policy
            </a>
          </p>
          <p className="mt-2">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@justsearch.com" className="text-brand hover:text-blue-600 underline">
              support@justsearch.com
            </a>{' '}
            or call{' '}
            <a href="tel:+911800123456" className="text-brand hover:text-blue-600 underline">
              1800-123-456
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Payment;