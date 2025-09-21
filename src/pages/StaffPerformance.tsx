
import React from 'react';
import Layout from '../components/Layout';
import AdminNavigation from '../components/AdminNavigation';
import StaffPerformance from '../components/admin/StaffPerformance';

const StaffPerformancePage = () => {
  return (
    <Layout title="Staff Performance Analytics">
      <div className="max-w-7xl mx-auto space-y-8">
        <AdminNavigation />
        <StaffPerformance />
      </div>
    </Layout>
  );
};

export default StaffPerformancePage;
