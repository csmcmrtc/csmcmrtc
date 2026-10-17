import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, Edit, Trash2, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      await api.updateUser(userId, { verified: true });
      await loadUsers();
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await api.updateUser(userId, updates);
      await loadUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-50 border-red-200';
      case 'donor': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'partner': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'beneficiary': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'donor': return <Users className="h-4 w-4" />;
      case 'partner': return <Shield className="h-4 w-4" />;
      case 'beneficiary': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading users...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="donor">Donors</option>
            <option value="partner">Partners</option>
            <option value="beneficiary">Beneficiaries</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{user.phone}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{user.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    {!user.verified && (
                      <button
                        onClick={() => handleVerifyUser(user.id)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="Verify User"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                      title="View Details"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {!user.verified && (
                <div className="mt-3 flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600 font-medium">Pending Verification</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateUser(editingUser.id, {
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  role: formData.get('role') as any,
                  phone: formData.get('phone') as string,
                  address: formData.get('address') as string,
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingUser.name}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingUser.email}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      name="role"
                      defaultValue={editingUser.role}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="donor">Donor</option>
                      <option value="partner">Partner</option>
                      <option value="beneficiary">Beneficiary</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={editingUser.phone || ''}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      defaultValue={editingUser.address || ''}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(selectedUser.role)}`}>
                      {getRoleIcon(selectedUser.role)}
                      <span className="ml-1 capitalize">{selectedUser.role}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.verified ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                      {selectedUser.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-sm text-gray-900">{selectedUser.address}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
