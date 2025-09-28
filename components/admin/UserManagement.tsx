import React, { useState } from 'react';
import Button from '../wallet/shared/Button';

type UserType = 'investor' | 'enterprise';
type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'not_started';

interface User {
  id: string;
  email: string;
  type: UserType;
  wallet: string;
  verificationStatus: VerificationStatus;
  joinedAt: string;
  lastActive: string;
  usdcBalance: number;
  vaultShares?: number;
  totalLoans?: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'user_001',
      email: 'investor1@example.com',
      type: 'investor',
      wallet: '0x1234567890123456789012345678901234567890',
      verificationStatus: 'verified',
      joinedAt: '2024-01-15',
      lastActive: '2024-01-20',
      usdcBalance: 5000,
      vaultShares: 4500.123456,
    },
    {
      id: 'user_002', 
      email: 'enterprise@echotech.co',
      type: 'enterprise',
      wallet: '0x2345678901234567890123456789012345678901',
      verificationStatus: 'pending',
      joinedAt: '2024-01-18',
      lastActive: '2024-01-20',
      usdcBalance: 1200,
      totalLoans: 2,
    },
    {
      id: 'user_003',
      email: 'investor2@gmail.com', 
      type: 'investor',
      wallet: '0x3456789012345678901234567890123456789012',
      verificationStatus: 'verified',
      joinedAt: '2024-01-19',
      lastActive: '2024-01-20',
      usdcBalance: 2500,
      vaultShares: 2400.567890,
    },
    {
      id: 'user_004',
      email: 'startup@agrotech.xyz',
      type: 'enterprise', 
      wallet: '0x4567890123456789012345678901234567890123',
      verificationStatus: 'rejected',
      joinedAt: '2024-01-20',
      lastActive: '2024-01-20',
      usdcBalance: 800,
      totalLoans: 0,
    },
  ]);

  const [filterType, setFilterType] = useState<UserType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('all');

  const filteredUsers = users.filter(user => {
    const typeMatch = filterType === 'all' || user.type === filterType;
    const statusMatch = filterStatus === 'all' || user.verificationStatus === filterStatus;
    return typeMatch && statusMatch;
  });

  const updateUserStatus = (userId: string, newStatus: VerificationStatus) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, verificationStatus: newStatus }
        : user
    ));
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case 'verified': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredUsers.length} users shown
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          🔍 Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="investor">Investors Only</option>
              <option value="enterprise">Enterprises Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            👥 User Directory
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                      <p className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {user.wallet.slice(0, 8)}...{user.wallet.slice(-6)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.type === 'investor' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {user.type === 'investor' ? '💼 Investor' : '🏢 Enterprise'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.verificationStatus)}`}>
                      <span className="mr-1">{getStatusIcon(user.verificationStatus)}</span>
                      {user.verificationStatus.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${user.usdcBalance.toLocaleString()}
                      </p>
                      {user.vaultShares && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.vaultShares.toFixed(2)} CVXS
                        </p>
                      )}
                      {user.totalLoans !== undefined && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.totalLoans} loans
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                    <p>Joined: {new Date(user.joinedAt).toLocaleDateString()}</p>
                    <p>Active: {new Date(user.lastActive).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-1">
                      {user.verificationStatus === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateUserStatus(user.id, 'verified')}
                            variant="outline"
                            size="small"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            ✅
                          </Button>
                          <Button
                            onClick={() => updateUserStatus(user.id, 'rejected')}
                            variant="outline"
                            size="small"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            ❌
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => window.open(`https://sepolia.basescan.org/address/${user.wallet}`, '_blank')}
                        variant="outline"
                        size="small"
                      >
                        🔍
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter(u => u.type === 'investor').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Investors</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {users.filter(u => u.type === 'enterprise').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Enterprises</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.verificationStatus === 'verified').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Verified Users</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {users.filter(u => u.verificationStatus === 'pending').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
