
import React from 'react';
import Layout from '../components/Layout';
import StaffManagement from '../components/StaffManagement';

const StaffManagementPage = () => {
  return (
    <Layout title="Staff Management">
      <div className="max-w-6xl mx-auto">
        <StaffManagement />
      </div>
    </Layout>
  );
};

export default StaffManagementPage;
