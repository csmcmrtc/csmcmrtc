import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera } from 'lucide-react';
import { api } from '../../services/api';

interface ProfileProps {
  user: any;
  onUserUpdate: (updatedUser: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    console.log('Profile component - User data:', user);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await api.updateUser(user.id, formData);
      if (updatedUser) {
        onUserUpdate(updatedUser);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'donor': return 'Individual Donor';
      case 'partner': return 'Commercial Partner';
      case 'beneficiary': return 'NGO/Beneficiary';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

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

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-emerald-600" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.name || 'Unknown User'}</h3>
              <p className="text-sm text-gray-500">{getRoleDisplayName(user?.role || 'unknown')}</p>
              <p className="text-sm text-gray-500">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Account Type</span>
            <span className="text-sm text-gray-900">{getRoleDisplayName(user?.role || 'unknown')}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Verification Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user?.verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.verified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-medium text-gray-500">Member Since</span>
            <span className="text-sm text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
