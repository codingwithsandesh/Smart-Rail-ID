
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import TodayStats from '../components/admin/TodayStats';
import RevenueAnalytics from '../components/admin/RevenueAnalytics';
import DashboardStaffManagement from '../components/admin/DashboardStaffManagement';
import AdminInspector from '../components/admin/AdminInspector';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect users to their appropriate pages based on role
      if (user.role === 'ticket-creator') {
        navigate('/create-ticket');
        return;
      } else if (user.role === 'tte') {
        navigate('/validate-ticket');
        return;
      }
      // Admin users stay on dashboard
    }
  }, [user, navigate]);

  // Only show dashboard for admin users
  if (!user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-left">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base text-left">
              Welcome back, {user.username}
              {user.workingStation && (
                <span className="block sm:inline ml-0 sm:ml-2 text-blue-600 dark:text-blue-400 font-medium">
                  {user.workingStation} Station
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Admin Inspector Section */}
        <AdminInspector />
        
        {/* Today's Statistics */}
        <TodayStats />
        
        {/* Staff Management Section */}
        <DashboardStaffManagement />
        
        {/* Revenue Analytics Only */}
        <RevenueAnalytics />
      </div>
    </Layout>
  );
};

export default Dashboard;
