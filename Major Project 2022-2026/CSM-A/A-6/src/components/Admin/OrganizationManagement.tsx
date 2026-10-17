import React, { useState, useEffect } from 'react';
import { Building, Mail, Phone, MapPin, Users, CheckCircle, XCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Organization } from '../../types';

export const OrganizationManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgsData = await api.getOrganizations();
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOrganization = async (orgId: string) => {
    try {
      await api.updateOrganization(orgId, { verified: true });
      await loadOrganizations();
    } catch (error) {
      console.error('Error verifying organization:', error);
    }
  };

  const handleCreateOrganization = async (orgData: Omit<Organization, 'id' | 'createdAt'>) => {
    try {
      const newOrg = await api.createOrganization(orgData);
      setOrganizations([newOrg, ...organizations]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating organization:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'partner': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'beneficiary': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredOrganizations = organizations.filter(org => {
    if (filter === 'all') return true;
    return org.type === filter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading organizations...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
          <p className="text-gray-600">Manage organizations and partners in the system</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="partner">Partners</option>
            <option value="beneficiary">Beneficiaries</option>
          </select>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </button>
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Organizations ({filteredOrganizations.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredOrganizations.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding the first organization.</p>
            </div>
          ) : (
            filteredOrganizations.map((org) => (
              <div key={org.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Building className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{org.name}</h4>
                      <p className="text-sm text-gray-500">{org.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(org.type)}`}>
                          {org.type.toUpperCase()}
                        </span>
                      </div>
                      {org.email && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{org.email}</span>
                        </div>
                      )}
                      {org.phone && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{org.phone}</span>
                        </div>
                      )}
                      {org.address && (
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{org.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${org.verified ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                      {org.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {!org.verified && (
                        <button
                          onClick={() => handleVerifyOrganization(org.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Verify Organization"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedOrg(org)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                        title="View Details"
                      >
                        <Building className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Organization Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Organization</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateOrganization({
                  name: formData.get('name') as string,
                  type: formData.get('type') as string,
                  description: formData.get('description') as string,
                  phone: formData.get('phone') as string,
                  email: formData.get('email') as string,
                  address: formData.get('address') as string,
                  verified: false,
                  documents: [],
                  userId: 'temp',
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <input
                      type="text"
                      name="name"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      name="type"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="partner">Partner</option>
                      <option value="beneficiary">Beneficiary</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Organization Details</h3>
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedOrg.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(selectedOrg.type)}`}>
                      {selectedOrg.type.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedOrg.verified ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                      {selectedOrg.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedOrg.description}</p>
                </div>
                
                {selectedOrg.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedOrg.email}</p>
                  </div>
                )}
                
                {selectedOrg.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedOrg.phone}</p>
                  </div>
                )}
                
                {selectedOrg.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="text-sm text-gray-900">{selectedOrg.address}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-sm text-gray-900">{new Date(selectedOrg.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
