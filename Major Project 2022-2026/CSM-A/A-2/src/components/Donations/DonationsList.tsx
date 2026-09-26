import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Donation } from '../../types';

interface DonationsListProps {
  user: any;
  showAllDonations?: boolean;
}

export const DonationsList: React.FC<DonationsListProps> = ({ user, showAllDonations = false }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    const loadDonations = async () => {
      if (showAllDonations) {
        const allDonations = await api.getDonations();
        setDonations(allDonations);
      } else {
        const userDonations = await api.getDonationsByDonor(user.id);
        setDonations(userDonations);
      }
    };

    loadDonations();
  }, [user.id, showAllDonations]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'review': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'in_transit': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredDonations = filter === 'all' 
    ? donations 
    : donations.filter(d => d.status === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showAllDonations
              ? 'All Donations'
              : user.role === 'partner'
                ? 'My donations'
                : 'My Donations'}
          </h1>
          <p className="text-gray-600">
            {showAllDonations
              ? 'Manage all platform donations'
              : user.role === 'partner'
                ? 'Donations created from your partner account (bulk or single). Other users’ donations are not shown here.'
                : 'Track your food donation history'}
          </p>
        </div>

        <div className="flex space-x-2">
          {['all', 'pending', 'approved', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                filter === status
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredDonations.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'No donations to display.' : `No ${filter} donations found.`}
              </p>
            </div>
          ) : (
            filteredDonations.map((donation) => (
              <div key={donation.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={donation.images?.[0] || 'https://via.placeholder.com/64x64?text=Food'}
                      alt={donation.title}
                      className="h-16 w-16 rounded-lg object-cover bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=Food';
                      }}
                    />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{donation.title}</h4>
                      <p className="text-sm text-gray-500">{donation.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>{donation.quantity} items</span>
                        <span className="capitalize">{donation.category}</span>
                        <span>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</span>
                      </div>
                      {showAllDonations && (
                        <p className="text-sm text-gray-500 mt-1">by {donation.donorName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {donation.aiAssessment && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-emerald-600">
                          AI Score: {donation.aiAssessment.qualityScore}/10
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {donation.aiAssessment.freshness}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.status)}`}>
                        {getStatusIcon(donation.status)}
                        <span className="ml-1 capitalize">{donation.status.replace('_', ' ')}</span>
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedDonation(donation)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
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
                    src={selectedDonation.images?.[0] || 'https://via.placeholder.com/400x200?text=Food'}
                    alt={selectedDonation.title}
                    className="w-full h-48 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Food';
                    }}
                  />
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedDonation.status)}`}>
                        {getStatusIcon(selectedDonation.status)}
                        <span className="ml-2 capitalize">{selectedDonation.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <p className="text-sm text-gray-900">{selectedDonation.quantity} items</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedDonation.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                      <p className="text-sm text-gray-900">{selectedDonation.pickupLocation}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedDonation.description}</p>
                </div>

                {selectedDonation.aiAssessment && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">AI Assessment Results</h4>
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
                        <label className="block text-sm font-medium text-gray-700">AI Recommendation</label>
                        <p className={`text-sm font-medium ${selectedDonation.aiAssessment.approved ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedDonation.aiAssessment.approved ? 'Approved for Donation' : 'Needs Review'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                      <ul className="mt-1 space-y-1">
                        {selectedDonation.aiAssessment.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};