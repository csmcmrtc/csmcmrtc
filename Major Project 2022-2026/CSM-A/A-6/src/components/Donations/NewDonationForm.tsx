import React, { useState } from 'react';
import { Upload, Camera, Clock, MapPin, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { aiService } from '../../services/aiService';
import { Donation } from '../../types';

interface NewDonationFormProps {
  user: any;
  onDonationCreated: () => void;
}

export const NewDonationForm: React.FC<NewDonationFormProps> = ({ user, onDonationCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cooked' as 'cooked' | 'packaged' | 'raw',
    quantity: 1,
    expiryDate: '',
    pickupLocation: user.address || '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiAssessing, setAiAssessing] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    setAiAssessing(true);

    // Persist as base64 data URL — blob: URLs from createObjectURL() are temporary and
    // break after refresh / reopening the donation list (they are not saved reliably).
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUrl = event.target?.result as string | undefined;
      if (!imageDataUrl) {
        setAiAssessing(false);
        return;
      }

      setImages([imageDataUrl]);

      try {
        const assessment = await aiService.assessFoodQuality(imageDataUrl, formData.category);
        setAiResults(assessment);

        if (assessment.expiryExtracted) {
          setFormData((prev) => ({ ...prev, expiryDate: assessment.expiryExtracted }));
        }
      } catch (error) {
        console.error('AI assessment failed:', error);
      } finally {
        setAiAssessing(false);
      }
    };
    reader.onerror = () => {
      console.error('Failed to read image file');
      setAiAssessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const donationData: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'> = {
        donorId: user.id,
        donorName: user.name,
        ...formData,
        images,
        status: 'pending',
        aiAssessment: aiResults,
      };

      await api.createDonation(donationData);
      onDonationCreated();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'cooked',
        quantity: 1,
        expiryDate: '',
        pickupLocation: user.address || '',
      });
      setImages([]);
      setAiResults(null);
    } catch (error) {
      console.error('Failed to create donation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Donation</h2>
          <p className="text-gray-600">Share your surplus food with those in need</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Food Images *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors duration-200">
              {images.length === 0 ? (
                <div>
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="images" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload food images
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        Our AI will assess quality automatically
                      </span>
                    </label>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={images[0]}
                    alt="Food upload"
                    className="mx-auto h-32 w-48 object-cover rounded-lg"
                  />
                  {aiResults && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium text-emerald-900">AI Assessment Complete</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-700">Quality Score:</span>
                          <span className="ml-2 font-bold text-emerald-600">{aiResults.qualityScore}/10</span>
                        </div>
                        <div>
                          <span className="text-gray-700">Safety Rating:</span>
                          <span className="ml-2 font-bold text-blue-600">{aiResults.safetyRating}/10</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Food Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Fresh Vegetables"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Food Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="cooked">Cooked Food</option>
                <option value="raw">Raw Ingredients</option>
                <option value="packaged">Packaged Items</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              placeholder="Describe the food items..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity (servings) *
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry Date *
              </label>
              <input
                type="date"
                id="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">
              Pickup Location *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="pickupLocation"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter pickup address"
                required
              />
            </div>
          </div>

          {aiResults && !aiResults.approved && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">AI Quality Warning</span>
              </div>
              <p className="text-sm text-yellow-800 mt-1">
                The AI assessment indicates this food may not meet quality standards. Please review the recommendations above.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};