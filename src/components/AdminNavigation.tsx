
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { 
  LayoutDashboard, 
  MapPin, 
  FileText, 
  Users,
  Database,
  BarChart3,
  Trash2
} from 'lucide-react';

const AdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin-dashboard',
      description: 'Overview and analytics'
    },
    {
      title: 'Station & Train Management',
      icon: MapPin,
      path: '/station-management',
      description: 'Manage stations and trains'
    },
    {
      title: 'Staff Management',
      icon: Users,
      path: '/staff-management',
      description: 'Manage staff members'
    },
    {
      title: 'Staff Performance',
      icon: BarChart3,
      path: '/staff-performance',
      description: 'Monitor staff productivity'
    },
    {
      title: 'Database Statistics',
      icon: Database,
      path: '/database-stats',
      description: 'Database usage and cleanup'
    },
    {
      title: 'Data Management',
      icon: Trash2,
      path: '/data-management',
      description: 'Delete tickets and logs by date'
    },
    {
      title: 'Verification Logs',
      icon: FileText,
      path: '/verification-logs',
      description: 'View ticket verification history'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Card 
            key={item.path}
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
              isActive ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => navigate(item.path)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminNavigation;
