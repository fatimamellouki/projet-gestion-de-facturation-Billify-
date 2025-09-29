import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SidebarAdmin from './SidebarAdmin';
import './AdminLayout.css'; 

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="admin-layout-container bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <SidebarAdmin onLogout={handleLogout} />
      <main className="admin-layout-content">
        <Outlet />
      </main>
    </div>
  );
}
