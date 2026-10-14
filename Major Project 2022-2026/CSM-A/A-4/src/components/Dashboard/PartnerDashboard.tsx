import React, { useState, useEffect } from 'react';
import { Plus, Package, Clock, CheckCircle, TrendingUp, Building, Users } from 'lucide-react';
import { api } from '../../services/api';
import { Donation } from '../../types';

interface PartnerDashboardProps {
  user: any;
  onTabChange: (tab: string) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ user, onTabChange }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    impact: 0
  });

  useEffect(() => {
    const loadData = async () => {
      const userDonations = await api.getDonationsByDonor(user.id);
      setDonations(userDonations);
      
      setStats({
        total: userDonations.length,
        pending: userDonations.filter(d => d.status === 'pending' || d.status === 'review').length,
        approved: userDonations.filter(d => d.status === 'approved' || d.status === 'delivered').length,
        impact: userDonations.reduce((sum, d) => sum + d.quantity, 0),
      });
    };

    loadData();
  }, [user.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'review': return 'text-blue-600 bg-blue-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'in_transit': return 'text-purple-600 bg-purple-50';
      case 'delivered': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}! 🏢</h1>
          <p className="text-gray-600">Manage your commercial food donations and track your impact</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onTabChange('bulk-donation')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Bulk Donation
          </button>
          <button
            onClick={() => onTabChange('donations')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
          >
            <Package className="h-4 w-4 mr-2" />
            View All
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Impact</p>
                <p className="text-2xl font-bold text-gray-900">{stats.impact}</p>
                <p className="text-sm text-gray-500">servings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
            <button
              onClick={() => onTabChange('donations')}
              className="text-emerald-600 hover:text-emerald-500 text-sm font-medium"
            >
              View all →
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {donations.slice(0, 5).map((donation) => (
            <div key={donation.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={donation.images[0] || 'https://via.placeholder.com/48x48?text=Food'}
                      alt={donation.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{donation.title}</h4>
                    <p className="text-sm text-gray-500">{donation.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {donation.category}
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {donation.quantity} servings
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                    {donation.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {donations.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first bulk donation.</p>
              <div className="mt-6">
                <button
                  onClick={() => onTabChange('bulk-donation')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Donation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Partner Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Organization Details</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Organization Name</p>
                <p className="text-sm text-gray-500">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Account Type</p>
                <p className="text-sm text-gray-500">Commercial Partner</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center space-x-3">
                <span className="h-5 w-5 text-gray-400">📞</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Contact</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>
              </div>
            )}
            
            {user.address && (
              <div className="flex items-center space-x-3">
                <span className="h-5 w-5 text-gray-400">📍</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-500">{user.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
