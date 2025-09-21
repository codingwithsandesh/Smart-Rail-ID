
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketCreation from './pages/TicketCreation';
import TicketValidation from './pages/TicketValidation';
import StationManagement from './pages/StationManagement';
import VerificationLogs from './pages/VerificationLogs';
import StaffManagementPage from './pages/StaffManagementPage';
import StaffPerformancePage from './pages/StaffPerformance';
import DatabaseStatsPage from './pages/DatabaseStats';
import DataManagement from './pages/DataManagement';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/create-ticket" element={
                    <ProtectedRoute allowedRoles={['ticket-creator']}>
                      <TicketCreation />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/validate-ticket" element={
                    <ProtectedRoute allowedRoles={['tte']}>
                      <TicketValidation />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/station-management" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <StationManagement />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/verification-logs" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <VerificationLogs />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/staff-management" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <StaffManagementPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/staff-performance" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <StaffPerformancePage />
                    </ProtectedRoute>
                  } />

                  <Route path="/database-stats" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DatabaseStatsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/data-management" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DataManagement />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin-dashboard" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
