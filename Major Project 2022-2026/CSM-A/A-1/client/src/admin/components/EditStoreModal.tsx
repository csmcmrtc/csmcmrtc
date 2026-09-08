import React, { useState } from 'react';
import {
  X,
  Save,
  Building2,
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  IndianRupee
} from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  type: 'local' | 'online';
  address: string;
  phone: string;
  email: string;
  rating: number;
  totalOrders: number;
  isActive: boolean;
  deliveryTime?: string;
  deliveryFee?: number;
  createdAt: string;
}

interface EditStoreModalProps {
  store: StoreData;
  onClose: () => void;
  onSave: (store: StoreData) => void;
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({ store, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: store.name,
    type: store.type,
    address: store.address,
    phone: store.phone,
    email: store.email,
    deliveryTime: store.deliveryTime || '',
    deliveryFee: store.deliveryFee || 0,
    isActive: store.isActive
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (formData.type === 'online') {
      if (!formData.deliveryTime.trim()) {
        newErrors.deliveryTime = 'Delivery time is required for online stores';
      }
      if (formData.deliveryFee < 0) {
        newErrors.deliveryFee = 'Delivery fee cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const updatedStore: StoreData = {
      ...store,
      ...formData
    };

    onSave(updatedStore);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                store.type === 'local' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {store.type === 'local' ? (
                  <Building2 className="w-5 h-5" />
                ) : (
                  <Truck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Store</h2>
                <p className="text-sm text-gray-500">{store.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Store Type Display (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Type
            </label>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
              store.type === 'local'
                ? 'bg-green-100 text-green-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {store.type === 'local' ? (
                <Building2 className="w-4 h-4" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              <span className="font-medium">
                {store.type === 'local' ? 'Local Store' : 'Online Platform'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Store type cannot be changed after creation</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Store Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                  errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                }`}
                placeholder="Enter store name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors resize-none ${
                  errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                }`}
                placeholder="Enter complete address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                  errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                }`}
                placeholder="+91 9876543210"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                }`}
                placeholder="store@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Store Statistics (Read-only) */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-lg font-semibold text-gray-900">{store.rating}/5</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-lg font-semibold text-gray-900">{store.totalOrders}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">{store.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Online Store Specific Fields */}
          {formData.type === 'online' && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Delivery Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryTime}
                    onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                      errors.deliveryTime ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                    }`}
                    placeholder="e.g., 15-20 mins"
                  />
                  {errors.deliveryTime && <p className="text-red-500 text-sm mt-1">{errors.deliveryTime}</p>}
                </div>

                {/* Delivery Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IndianRupee className="w-4 h-4 inline mr-1" />
                    Delivery Fee
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.deliveryFee}
                    onChange={(e) => handleInputChange('deliveryFee', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-colors ${
                      errors.deliveryFee ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand'
                    }`}
                    placeholder="30"
                  />
                  {errors.deliveryFee && <p className="text-red-500 text-sm mt-1">{errors.deliveryFee}</p>}
                  <p className="text-xs text-gray-500 mt-1">Enter 0 for free delivery</p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand"
                  />
                  <span className="text-sm text-gray-700">
                    Store is active and accepting orders
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Inactive stores won't appear in customer searches
                </p>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                formData.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Update Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStoreModal;