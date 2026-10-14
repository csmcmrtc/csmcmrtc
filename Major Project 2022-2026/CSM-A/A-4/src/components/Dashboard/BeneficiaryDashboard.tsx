import React, { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, Clock, Heart, Truck, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Donation } from '../../types';

interface BeneficiaryDashboardProps {
  user: any;
  /** `requests` = My Requests page only; default = full dashboard */
  view?: 'dashboard' | 'requests';
}

const placeholderImg = 'https://via.placeholder.com/64x64?text=Food';

export const BeneficiaryDashboard: React.FC<BeneficiaryDashboardProps> = ({ user, view = 'dashboard' }) => {
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [myRequests, setMyRequests] = useState<Donation[]>([]);

  const loadData = useCallback(async () => {
    const allDonations = await api.getDonations();
    const available = allDonations.filter(d => d.status === 'approved' && !d.assignedBeneficiary);
    const assigned = allDonations.filter(d => String(d.assignedBeneficiary) === String(user.id));

    setAvailableDonations(available);
    setMyRequests(assigned);
  }, [user.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRequestDonation = async (donationId: string) => {
    await api.updateDonation(donationId, {
      assignedBeneficiary: user.id,
      status: 'in_transit'
    });

    await loadData();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-purple-700 bg-purple-50 border border-purple-100">
            <Truck className="h-3.5 w-3.5" />
            In transit
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100">
            <CheckCircle className="h-3.5 w-3.5" />
            Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-700 bg-gray-50 capitalize">
            {status.replace('_', ' ')}
          </span>
        );
    }
  };

  if (view === 'requests') {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600">Donations you have requested or are assigned to your organization</p>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Assigned donations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {myRequests.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No requests yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Go to Available Food to request a pickup for an approved donation.
                </p>
              </div>
            ) : (
              myRequests.map((donation) => (
                <div key={donation.id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={donation.images?.[0] || placeholderImg}
                        alt={donation.title}
                        className="h-16 w-16 rounded-lg object-cover bg-gray-100 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = placeholderImg;
                        }}
                      />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{donation.title}</h4>
                        <p className="text-sm text-gray-500">from {donation.donorName}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 shrink-0" />
                            {donation.pickupLocation}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 shrink-0" />
                            Expires {new Date(donation.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {statusBadge(donation.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name} 🤝</h1>
        <p className="text-gray-600">Find and manage food donations for your organization</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Available Donations</p>
                <p className="text-2xl font-bold text-gray-900">{availableDonations.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900">{myRequests.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">People Served</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Donations */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Available Food Donations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {availableDonations.length === 0 ? (
            <div className="p-6 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No donations available</h3>
              <p className="mt-1 text-sm text-gray-500">Check back later for new donations.</p>
            </div>
          ) : (
            availableDonations.map((donation) => (
              <div key={donation.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={donation.images?.[0] || placeholderImg}
                      alt={donation.title}
                      className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImg;
                      }}
                    />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{donation.title}</h4>
                      <p className="text-sm text-gray-500">{donation.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {donation.quantity} items
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {donation.pickupLocation}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Expires {new Date(donation.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      {donation.aiAssessment && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-emerald-600">
                            Quality Score: {donation.aiAssessment.qualityScore}/10 • {donation.aiAssessment.freshness}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRequestDonation(donation.id)}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Request Pickup
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Requests */}
      {myRequests.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">My Active Requests</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {myRequests.map((donation) => (
              <div key={donation.id} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0">
                    <img
                      src={donation.images?.[0] || placeholderImg}
                      alt={donation.title}
                      className="h-12 w-12 rounded-lg object-cover shrink-0 bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImg;
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{donation.title}</h4>
                      <p className="text-sm text-gray-500">from {donation.donorName}</p>
                    </div>
                  </div>
                  {statusBadge(donation.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};