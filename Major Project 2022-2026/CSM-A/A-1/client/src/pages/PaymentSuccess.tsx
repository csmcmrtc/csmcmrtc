import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Home,
  Package,
  Store,
  MapPin,
  Download,
  Share2,
//   ArrowRight
} from 'lucide-react';

interface PaymentSuccessState {
  orderId: string;
  paymentId: string;
  orderNumber?: string;
  amount: number;
  product: {
    id: string;
    name: string;
    brand: string;
    size: string;
    image: string;
    price: number;
  };
  store: {
    id: string;
    name: string;
    type: 'local' | 'delivery';
    address: string;
    distance?: number;
  };
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentSuccessState | null;

  // Use order number from backend or generate fallback
  const orderNumber = state?.orderNumber || 
    state?.orderId?.slice(-8).toUpperCase() || 
    `ORD${Date.now().toString(36).toUpperCase()}`;

  const handleGetDirections = () => {
    if (state?.store?.address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(state.store.address)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleDownloadReceipt = () => {
    if (!state) return;

    const receiptDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 15px; }
          .logo { font-size: 28px; font-weight: bold; color: #0ea5e9; }
          .title { font-size: 18px; color: #666; margin-top: 5px; }
          .success-badge { background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-top: 12px; }
          .section { margin-bottom: 22px; }
          .section-title { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .order-info { display: flex; justify-content: space-between; background: #f3f4f6; padding: 12px; border-radius: 8px; }
          .order-info div { text-align: center; }
          .order-info .label { font-size: 12px; color: #666; }
          .order-info .value { font-size: 18px; font-weight: bold; color: #111; }
          .product-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; display: flex; gap: 15px; }
          .product-img { width: 60px; height: 60px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; }
          .product-details { flex: 1; }
          .product-name { font-weight: 600; color: #111; }
          .product-size { font-size: 14px; color: #666; margin-top: 4px; }
          .product-price { font-size: 18px; font-weight: bold; color: #111; margin-top: 6px; }
          .store-box { background: #eff6ff; border-radius: 8px; padding: 12px; }
          .store-name { font-weight: 600; color: #111; }
          .store-address { font-size: 14px; color: #666; margin-top: 4px; }
          .store-distance { font-size: 12px; color: #0ea5e9; margin-top: 4px; }
          .summary { border-top: 1px solid #e5e7eb; padding-top: 17px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-row.total { border-top: 2px solid #111; margin-top: 8px; padding-top: 12px; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 27px; padding-top: 17px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          .payment-id { font-family: monospace; background: #f3f4f6; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all; }
          @media print { body { padding: 17px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">JustSearch</div>
          <div class="title">Payment Receipt</div>
          <div class="success-badge">✓ Payment Successful</div>
        </div>

        <div class="section">
          <div class="order-info">
            <div>
              <div class="label">Order Number</div>
              <div class="value">${orderNumber}</div>
            </div>
            <div>
              <div class="label">Date</div>
              <div class="value">${receiptDate}</div>
            </div>
            <div>
              <div class="label">Amount Paid</div>
              <div class="value">₹${state.amount}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Product Details</div>
          <div class="product-box">
            <div class="product-img">📦</div>
            <div class="product-details">
              <div class="product-name">${state.product?.brand || ''} ${state.product?.name || 'Product'}</div>
              <div class="product-size">${state.product?.size || ''}</div>
              <div class="product-price">₹${state.product?.price || state.amount}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Store Details</div>
          <div class="store-box">
            <div class="store-name">${state.store?.name || 'Store'}</div>
            <div class="store-address">${state.store?.address || ''}</div>
            ${state.store?.distance ? `<div class="store-distance">${state.store.distance} km away</div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Summary</div>
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹${state.product?.price || state.amount}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee</span>
              <span>₹0</span>
            </div>
            <div class="summary-row">
              <span>Tax (5%)</span>
              <span>₹${Math.round((state.product?.price || state.amount) * 0.05)}</span>
            </div>
            <div class="summary-row total">
              <span>Total Paid</span>
              <span>₹${state.amount}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Information</div>
          <div class="payment-id">Payment ID: ${state.paymentId || 'N/A'}</div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with JustSearch!</p>
          <p style="margin-top: 5px;">For support, contact: support@justsearch.com</p>
          <p style="margin-top: 10px; color: #999;">This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Animation */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600">
          Your order has been confirmed and is being processed
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        {/* Order Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Order Number</p>
              <p className="text-xl font-bold">{orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Amount Paid</p>
              <p className="text-xl font-bold">₹{state?.amount || 0}</p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        {state?.product && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <img
                src={state.product.image}
                alt={state.product.name}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {state.product.brand} {state.product.name}
                </h3>
                <p className="text-sm text-gray-600">{state.product.size}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₹{state.product.price}
                </p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        )}

        {/* Store Details */}
        {state?.store && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{state.store.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{state.store.address}</p>
                {state.store.distance && (
                  <p className="text-sm text-gray-500 mt-1">
                    {state.store.distance} km away
                  </p>
                )}
              </div>
              {state.store.type === 'local' && (
                <button
                  onClick={handleGetDirections}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  Directions
                </button>
              )}
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment ID</span>
            <span className="font-mono text-gray-900">
              {state?.paymentId?.slice(0, 20) || 'N/A'}...
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Status</span>
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      {state?.store?.type === 'local' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pickup Instructions
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              Visit the store at your convenience
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              Show your order number: <span className="font-mono font-bold">{orderNumber}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              Collect your product - no additional payment required!
            </li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Home className="w-5 h-5" />
          Continue Shopping
        </button>
        
        <button
          onClick={handleDownloadReceipt}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Download className="w-5 h-5" />
          Download Receipt
        </button>
      </div>

      {/* Share Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Order Confirmed - JustSearch',
                text: `My order ${orderNumber} has been confirmed!`,
                url: window.location.href
              });
            }
          }}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          <Share2 className="w-4 h-4" />
          Share Order Details
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>A confirmation email has been sent to your registered email address.</p>
        <p className="mt-1">
          Need help?{' '}
          <a href="mailto:support@justsearch.com" className="text-brand hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </main>
  );
};

export default PaymentSuccess;
