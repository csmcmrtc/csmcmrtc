import React, { useState, useEffect } from 'react';
import { Users, Package, Building, TrendingUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { aiService } from '../../services/aiService';
import { Donation, User, Analytics } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});

  const deliveryStatusOptions = ['pending', 'approved', 'in_transit', 'delivered', 'rejected'];
  const deliveryDonations = donations.filter((d) => deliveryStatusOptions.includes(d.status));

  useEffect(() => {
    const loadData = async () => {
      const [donationsData, usersData, analyticsData] = await Promise.all([
        api.getDonations(),
        api.getUsers(),
        api.getAnalytics(),
      ]);
      
      setDonations(donationsData);
      setUsers(usersData);
      setAnalytics(analyticsData);
    };

    loadData();
  }, []);

  const handleStatusUpdate = async (donationId: string, newStatus: string) => {
    setProcessing(donationId);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    await api.updateDonation(donationId, { status: newStatus });
    
    // Refresh donations
    const updatedDonations = await api.getDonations();
    setDonations(updatedDonations);
    setProcessing(null);
    setSelectedDonation(null);
    setStatusDraft((prev) => {
      const next = { ...prev };
      delete next[donationId];
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'review': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'in_transit': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'delivered': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const pendingDonations = donations.filter(d => d.status === 'pending' || d.status === 'review');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage the food donation platform</p>
      </div>

      {/* Analytics Grid */}
      {analytics && (
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
                    <dd className="text-2xl font-bold text-gray-900">{analytics.totalDonations}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Donors</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.activeDonors}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Beneficiaries</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.beneficiariesServed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Impact Score</dt>
                    <dd className="text-2xl font-bold text-gray-900">{analytics.impactScore}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Reviews */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Pending Reviews ({pendingDonations.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingDonations.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
              <p className="mt-1 text-sm text-gray-500">No pending donations to review.</p>
            </div>
          ) : (
            pendingDonations.map((donation) => (
              <div key={donation.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={donation.images[0]}
                      alt={donation.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{donation.title}</h4>
                      <p className="text-sm text-gray-500">by {donation.donorName}</p>
                      <p className="text-sm text-gray-500">{donation.quantity} items • {donation.category}</p>
                      {donation.aiAssessment && (
                        <div className="mt-1">
                          <span className="text-xs font-medium text-emerald-600">
                            AI Score: {donation.aiAssessment.qualityScore}/10
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
                      {donation.status}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(donation.id, 'approved')}
                        disabled={processing === donation.id}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(donation.id, 'rejected')}
                        disabled={processing === donation.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delivery Status Updates */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Delivery Status Updates ({deliveryDonations.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {deliveryDonations.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No delivery updates needed</h3>
              <p className="mt-1 text-sm text-gray-500">All deliveries are up to date.</p>
            </div>
          ) : (
            deliveryDonations.map((donation) => {
              const draft = statusDraft[donation.id] ?? donation.status;
              return (
                <div key={donation.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={donation.images[0]}
                        alt={donation.title}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{donation.title}</h4>
                        <p className="text-sm text-gray-500">by {donation.donorName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          donation.status
                        )}`}
                      >
                        {donation.status}
                      </span>

                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-3">
                    <select
                      value={draft}
                      onChange={(e) =>
                        setStatusDraft((prev) => ({ ...prev, [donation.id]: e.target.value }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {deliveryStatusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleStatusUpdate(donation.id, draft)}
                      disabled={processing === donation.id}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {processing === donation.id ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Donation Details</h3>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <img
                    src={selectedDonation.images[0]}
                    alt={selectedDonation.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <p className="text-sm text-gray-900">{selectedDonation.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedDonation.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <p className="text-sm text-gray-900">{selectedDonation.quantity} items</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                      <p className="text-sm text-gray-900">{new Date(selectedDonation.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {selectedDonation.aiAssessment && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">AI Assessment</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quality Score</label>
                        <p className="text-lg font-bold text-emerald-600">{selectedDonation.aiAssessment.qualityScore}/10</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Safety Rating</label>
                        <p className="text-lg font-bold text-blue-600">{selectedDonation.aiAssessment.safetyRating}/10</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Freshness</label>
                        <p className="text-sm text-gray-900 capitalize">{selectedDonation.aiAssessment.freshness}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">AI Approval</label>
                        <p className={`text-sm font-medium ${selectedDonation.aiAssessment.approved ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedDonation.aiAssessment.approved ? 'Recommended' : 'Not Recommended'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">AI Recommendations</label>
                      <ul className="mt-1 space-y-1">
                        {selectedDonation.aiAssessment.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-3 pt-4">
                  {['pending', 'approved', 'delivered', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedDonation.id, status)}
                      disabled={processing === selectedDonation.id}
                      className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                        status === 'rejected'
                          ? 'border border-red-300 text-red-700 hover:bg-red-50'
                          : status === 'delivered'
                            ? 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {processing === selectedDonation.id ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};