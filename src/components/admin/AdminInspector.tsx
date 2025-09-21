
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Train, 
  FileText, 
  BarChart3, 
  Database, 
  Users,
  ArrowRight,
  Building,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminInspector = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const adminSections = [
    {
      title: 'Station Management',
      description: 'Manage railway stations and their configurations',
      icon: MapPin,
      path: '/station-management',
      color: 'bg-blue-500',
      stats: 'View & manage all stations'
    },
    {
      title: 'Train Management', 
      description: 'Configure trains, routes, and schedules',
      icon: Train,
      path: '/train-management',
      color: 'bg-green-500',
      stats: 'Manage train operations'
    },
    {
      title: 'Verification Logs',
      description: 'Monitor ticket verification activities',
      icon: FileText,
      path: '/verification-logs',
      color: 'bg-purple-500',
      stats: 'Track verification history'
    },
    {
      title: 'Staff Performance',
      description: 'Analyze staff productivity and performance',
      icon: BarChart3,
      path: '/staff-performance',
      color: 'bg-orange-500',
      stats: 'Performance analytics'
    },
    {
      title: 'Database Statistics',
      description: 'View database usage and system statistics',
      icon: Database,
      path: '/database-stats',
      color: 'bg-red-500',
      stats: 'System health monitoring'
    },
    {
      title: 'Staff Management',
      description: 'Manage staff accounts and permissions',
      icon: Users,
      path: '/staff-management',
      color: 'bg-indigo-500',
      stats: 'User administration'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-blue-600" />
            <CardTitle>Admin Inspector Dashboard</CardTitle>
          </div>
          <CardDescription>
            Comprehensive administration panel for {user?.workingStation} station network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.path} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${section.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {section.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {section.stats}
                      </Badge>
                      <Button
                        onClick={() => navigate(section.path)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Station Network</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Running</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Train Services</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">Live</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Verification</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">Online</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Staff Members</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInspector;
