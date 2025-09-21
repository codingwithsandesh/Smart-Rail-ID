
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, role: User['role'], workingStation?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateWorkingStation: (station: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('railway-admin-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string, role: User['role'], workingStation?: string): Promise<boolean> => {
    // First check if it's a staff member
    if (role === 'ticket-creator' || role === 'tte') {
      try {
        const { data: staffData, error } = await supabase
          .from('staff')
          .select('*')
          .eq('staff_id', username)
          .eq('password', password)
          .eq('role', role === 'ticket-creator' ? 'ticket_creator' : 'tte')
          .eq('is_active', true)
          .single();

        if (error || !staffData) {
          console.log('Staff login failed:', error);
          return false;
        }

        const newUser = { 
          username: staffData.name, 
          role, 
          workingStation: staffData.working_station || workingStation 
        };
        setUser(newUser);
        localStorage.setItem('railway-admin-user', JSON.stringify(newUser));
        
        if (staffData.working_station || workingStation) {
          sessionStorage.setItem('working-station', staffData.working_station || workingStation);
        }
        
        return true;
      } catch (error) {
        console.error('Staff authentication error:', error);
        return false;
      }
    }

    // Admin login (demo credentials)
    const validCredentials = [
      { username: 'admin', password: 'password', role: 'admin' }
    ];

    const isValid = validCredentials.some(
      cred => cred.username === username && cred.password === password && cred.role === role
    );

    if (isValid) {
      const newUser = { username, role, workingStation };
      setUser(newUser);
      localStorage.setItem('railway-admin-user', JSON.stringify(newUser));
      
      if (workingStation) {
        sessionStorage.setItem('working-station', workingStation);
      }
      
      return true;
    }
    return false;
  };

  const updateWorkingStation = (station: string) => {
    if (user) {
      const updatedUser = { ...user, workingStation: station };
      setUser(updatedUser);
      localStorage.setItem('railway-admin-user', JSON.stringify(updatedUser));
      sessionStorage.setItem('working-station', station);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('railway-admin-user');
    sessionStorage.removeItem('working-station');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    updateWorkingStation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
