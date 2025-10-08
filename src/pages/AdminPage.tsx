import React from 'react';
import StoreManagement from '../components/admin/StoreManagement';
import FormTemplateManagement from '../components/admin/FormTemplateManagement';
import AllAuditsReport from '../components/admin/AllAuditsReport';

const AdminPage = () => {
  return (
    <div className="space-y-8">
      <StoreManagement />
      <FormTemplateManagement />
      <AllAuditsReport />
    </div>
  );
};

export default AdminPage;