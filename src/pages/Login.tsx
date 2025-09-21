import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Train, User, MapPin, Users } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useStations } from '../hooks/useSupabaseData';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { data: stations = [] } = useStations();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ticket-creator' | 'tte' | 'admin' | ''>('');
  const [workingStation, setWorkingStation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({
        title: "Error",
        description: t('login.selectRole'),
        variant: "destructive"
      });
      return;
    }

    if (role === 'admin' && !workingStation) {
      toast({
        title: "Error",
        description: t('login.selectStation'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const success = await login(username, password, role, workingStation);
    
    if (success) {
      toast({
        title: t('common.login') + " Successful",
        description: `Welcome to Railway Admin Panel${workingStation ? ` - ${workingStation} Station` : ''}`
      });
    } else {
      toast({
        title: t('common.login') + " Failed",
        description: "Invalid credentials. Please check your username, password, and role.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay - Indian Railways train as background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(29, 78, 216, 0.85), rgba(37, 99, 235, 0.75)), url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      {/* Indian Railways Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block text-white space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-full border border-white/20">
                  <Train className="h-20 w-20 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold leading-tight">
                {t('layout.title')}
              </h1>
              <div className="h-1 w-32 bg-orange-500 mx-auto"></div>
              <p className="text-2xl font-semibold text-orange-200">
                {t('login.slogan')}
              </p>
            </div>
            
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center space-x-4 text-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>Reliable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span>Efficient</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 shadow-2xl border-0">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4 lg:hidden">
                  <div className="bg-blue-600 p-3 rounded-full">
                    <Train className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('login.title')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {t('login.subtitle')}
                </CardDescription>
                <div className="lg:hidden text-center mt-2">
                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    {t('login.slogan')}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                      {t('login.username')}
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('login.username')}
                      required
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                      {t('login.password')}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('login.password')}
                      required
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">
                      {t('login.role')}
                    </Label>
                    <Select value={role} onValueChange={(value: any) => setRole(value)}>
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder={t('login.selectRole')} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="ticket-creator">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {t('roles.ticketCreator')}
                          </div>
                        </SelectItem>
                        <SelectItem value="tte">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {t('roles.tte')}
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {t('roles.admin')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Working Station Selection */}
                  {role === 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="workingStation" className="text-gray-700 dark:text-gray-300">
                        {t('login.workingStation')} *
                      </Label>
                      <Select value={workingStation} onValueChange={setWorkingStation}>
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder={t('login.selectStation')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                          {stations.map(station => (
                            <SelectItem key={station.id} value={station.name}>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {station.name} ({station.code})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('login.stationNote')}
                      </p>
                    </div>
                  )}

                  {(role === 'ticket-creator' || role === 'tte') && (
                    <div className="space-y-2">
                      <Label htmlFor="workingStation" className="text-gray-700 dark:text-gray-300">
                        {t('login.workingStationOptional')}
                      </Label>
                      <Select value={workingStation} onValueChange={setWorkingStation}>
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder={t('login.selectStation')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                          {stations.map(station => (
                            <SelectItem key={station.id} value={station.name}>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {station.name} ({station.code})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('login.optionalNote')}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800" 
                    disabled={isLoading}
                  >
                    {isLoading ? t('login.signingIn') : t('login.signIn')}
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2">
                    {t('login.demo')}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p><strong>Admin:</strong> {t('login.adminCreds')}</p>
                    <p><strong>Staff:</strong> {t('login.staffCreds')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
