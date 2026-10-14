import React, { useState } from 'react';
import { Upload, Camera, Clock, MapPin, Package, AlertCircle, Plus, X, Save } from 'lucide-react';
import { api } from '../../services/api';
import { aiService } from '../../services/aiService';
import { Donation } from '../../types';

interface BulkDonationFormProps {
  user: any;
  onDonationsCreated: () => void;
}

interface BulkDonationItem {
  id: string;
  title: string;
  description: string;
  category: 'cooked' | 'packaged' | 'raw';
  quantity: number;
  expiryDate: string;
  pickupLocation: string;
  images: string[];
}

export const BulkDonationForm: React.FC<BulkDonationFormProps> = ({ user, onDonationsCreated }) => {
  const [donations, setDonations] = useState<BulkDonationItem[]>([
    {
      id: '1',
      title: '',
      description: '',
      category: 'packaged',
      quantity: 1,
      expiryDate: '',
      pickupLocation: user.address || '',
      images: [],
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addDonationItem = () => {
    const newId = (donations.length + 1).toString();
    setDonations([
      ...donations,
      {
        id: newId,
        title: '',
        description: '',
        category: 'packaged',
        quantity: 1,
        expiryDate: '',
        pickupLocation: user.address || '',
        images: [],
      }
    ]);
  };

  const removeDonationItem = (id: string) => {
    if (donations.length > 1) {
      setDonations(donations.filter(item => item.id !== id));
    }
  };

  const updateDonationItem = (id: string, field: keyof BulkDonationItem, value: any) => {
    setDonations(donations.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleImageUpload = async (donationId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Convert file to data URL for preview
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const imageDataUrl = event.target?.result as string;
        
        // Update donation with the uploaded image
        updateDonationItem(donationId, 'images', [imageDataUrl]);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  const validateDonations = () => {
    for (const donation of donations) {
      if (!donation.title.trim()) {
        setError('Please fill in all donation titles');
        return false;
      }
      if (!donation.description.trim()) {
        setError('Please fill in all donation descriptions');
        return false;
      }
      if (!donation.expiryDate) {
        setError('Please set expiry dates for all donations');
        return false;
      }
      if (donation.quantity < 1) {
        setError('Please set valid quantities for all donations');
        return false;
      }
      if (donation.images.length === 0) {
        setError('Please upload images for all donations');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateDonations()) {
      setLoading(false);
      return;
    }

    try {
      const createdDonations = [];
      
      for (const donation of donations) {
        const donationData: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'> = {
          donorId: user.id,
          donorName: user.name,
          title: donation.title,
          description: donation.description,
          category: donation.category,
          quantity: donation.quantity,
          expiryDate: donation.expiryDate,
          pickupLocation: donation.pickupLocation,
          images: donation.images,
          status: 'pending',
        };

        const created = await api.createDonation(donationData);
        createdDonations.push(created);
      }

      setSuccess(`Successfully created ${createdDonations.length} donations!`);
      
      // Reset form
      setDonations([{
        id: '1',
        title: '',
        description: '',
        category: 'packaged',
        quantity: 1,
        expiryDate: '',
        pickupLocation: user.address || '',
        images: [],
      }]);
      
      setTimeout(() => {
        onDonationsCreated();
      }, 2000);
      
    } catch (error) {
      setError('Failed to create donations. Please try again.');
      console.error('Failed to create donations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Donation Creation</h2>
          <p className="text-gray-600">Create multiple food donations for your organization</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg border border-green-200">
              {success}
            </div>
          )}

          {/* Donation Items */}
          <div className="space-y-6">
            {donations.map((donation, index) => (
              <div key={donation.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Donation #{index + 1}</h3>
                  {donations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDonationItem(donation.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Food Title *
                    </label>
                    <input
                      type="text"
                      value={donation.title}
                      onChange={(e) => updateDonationItem(donation.id, 'title', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Fresh Vegetables"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Food Category *
                    </label>
                    <select
                      value={donation.category}
                      onChange={(e) => updateDonationItem(donation.id, 'category', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="cooked">Cooked Food</option>
                      <option value="raw">Raw Ingredients</option>
                      <option value="packaged">Packaged Items</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity (servings) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={donation.quantity}
                      onChange={(e) => updateDonationItem(donation.id, 'quantity', parseInt(e.target.value))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={donation.expiryDate}
                      onChange={(e) => updateDonationItem(donation.id, 'expiryDate', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      value={donation.description}
                      onChange={(e) => updateDonationItem(donation.id, 'description', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="Describe the food items..."
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={donation.pickupLocation}
                      onChange={(e) => updateDonationItem(donation.id, 'pickupLocation', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter pickup location"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Food Images
                    </label>
                    <div className="mt-1 space-y-3">
                      <div className="flex items-center space-x-4">
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(donation.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {donation.images.length > 0 && (
                        <div className="flex items-center space-x-3">
                          <img
                            src={donation.images[0]}
                            alt={donation.title}
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => updateDonationItem(donation.id, 'images', [])}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addDonationItem}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Donation
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Creating Donations...' : `Create ${donations.length} Donation${donations.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
