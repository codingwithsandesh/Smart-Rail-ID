
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ticket-creator': return t('roles.ticketCreator');
      case 'tte': return t('roles.tte');
      case 'admin': return t('roles.admin');
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-lg transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <h1 className="text-lg md:text-xl font-bold">{t('layout.title')}</h1>
              <p className="text-blue-100 text-sm">{title}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="break-all">
                  {user?.username} ({getRoleDisplayName(user?.role || '')})
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
