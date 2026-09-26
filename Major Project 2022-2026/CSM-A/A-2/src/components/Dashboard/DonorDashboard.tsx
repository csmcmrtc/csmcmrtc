import React, { useState, useEffect } from 'react';
import { Plus, Package, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { Donation } from '../../types';

interface DonorDashboardProps {
  user: any;
  onTabChange: (tab: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ user, onTabChange }) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-600">Track your donations and make a difference in your community</p>
        </div>
        <button
          onClick={() => onTabChange('new-donation')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Donation
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Donations</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.approved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Impact Score</dt>
                  <dd className="text-2xl font-bold text-gray-900">{stats.impact}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Donations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {donations.length === 0 ? (
            <div className="p-6 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No donations yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first donation.</p>
              <div className="mt-6">
                <button
                  onClick={() => onTabChange('new-donation')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Donation
                </button>
              </div>
            </div>
          ) : (
            donations.slice(0, 5).map((donation) => (
              <div key={donation.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <img
                        src={donation.images[0]}
                        alt={donation.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{donation.title}</h4>
                        <p className="text-sm text-gray-500">{donation.quantity} items • {donation.category}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(donation.status)}`}>
                      {donation.status.replace('_', ' ')}
                    </span>
                    <div className="text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};