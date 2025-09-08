import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import AdvancedAnalyticsDashboard from './analytics/AdvancedAnalyticsDashboard';
import {
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  DatabaseIcon
} from '@heroicons/react/24/outline';

interface User {
  uid: string;
  email: string;
  role: string;
  getIdToken: () => Promise<string>;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'system'>('users');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    user.getIdToken().then(token => {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUsers(res.data.users))
        .catch(() => setError('Failed to load users'))
        .finally(() => setLoading(false));
    });
  }, [user]);

  const handleRoleChange = async (uid: string, newRole: string) => {
    setRoleUpdating(uid);
    try {
      if (!user) throw new Error('No authenticated user');
      const token = await user.getIdToken();
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/role`, { uid, role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users => users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch {
      setError('Failed to update role');
    } finally {
      setRoleUpdating(null);
    }
  };

  const renderUserManagement = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
      <p className="text-gray-600 mb-6">Manage user roles and permissions</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      u.role === 'admin' ? 'bg-red-100 text-red-800' :
                      u.role === 'paiduser' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {u.role === 'paiduser' ? 'Paid User' : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.uid, e.target.value)}
                      disabled={roleUpdating === u.uid}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      title={`Set role for ${u.email}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="paiduser">Paid User</option>
                    </select>
                    {roleUpdating === u.uid && (
                      <span className="ml-2 text-xs text-indigo-600">Updating...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSystemStatus = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Backend API</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">AI Microservice</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Database</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Total Users</h4>
              <p className="text-2xl font-bold text-blue-600">{users.length}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Active Sessions</h4>
              <p className="text-2xl font-bold text-purple-600">--</p>
              <p className="text-xs text-gray-500 mt-1">Real-time data coming soon</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <DatabaseIcon className="h-5 w-5 mr-2" />
            Backup Database
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <CogIcon className="h-5 w-5 mr-2" />
            System Maintenance
          </button>
          
          <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Export Reports
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Manage users, monitor AI performance, and oversee system operations</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', name: 'User Management', icon: UserGroupIcon },
              { id: 'analytics', name: 'AI Analytics', icon: ChartBarIcon },
              { id: 'system', name: 'System Status', icon: CogIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'analytics' && <AdvancedAnalyticsDashboard />}
        {activeTab === 'system' && renderSystemStatus()}
      </div>
    </div>
  );
}
