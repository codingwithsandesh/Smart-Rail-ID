
import { Station, Route } from '../types';

export const getStoredStations = (): Station[] => {
  const stored = localStorage.getItem('railway-stations');
  if (!stored) {
    // Initialize with default stations if none exist
    const defaultStations: Station[] = [
      { id: '1', name: 'Washim', code: 'WH', address: 'Washim Railway Station, Washim, Maharashtra 444505', createdAt: new Date().toISOString() },
      { id: '2', name: 'Akola', code: 'AK', address: 'Akola Junction Railway Station, Akola, Maharashtra 444001', createdAt: new Date().toISOString() },
      { id: '3', name: 'Nagpur', code: 'NG', address: 'Nagpur Junction Railway Station, Nagpur, Maharashtra 440001', createdAt: new Date().toISOString() },
      { id: '4', name: 'Mumbai', code: 'MB', address: 'Chhatrapati Shivaji Maharaj Terminus, Mumbai, Maharashtra 400001', createdAt: new Date().toISOString() },
      { id: '5', name: 'Pune', code: 'PN', address: 'Pune Junction Railway Station, Pune, Maharashtra 411001', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('railway-stations', JSON.stringify(defaultStations));
    return defaultStations;
  }
  return JSON.parse(stored);
};

export const saveStation = (station: Station): void => {
  const stations = getStoredStations();
  stations.push(station);
  localStorage.setItem('railway-stations', JSON.stringify(stations));
};

export const updateStation = (updatedStation: Station): void => {
  const stations = getStoredStations();
  const index = stations.findIndex(s => s.id === updatedStation.id);
  if (index !== -1) {
    stations[index] = updatedStation;
    localStorage.setItem('railway-stations', JSON.stringify(stations));
  }
};

export const deleteStation = (stationId: string): void => {
  const stations = getStoredStations();
  const filteredStations = stations.filter(s => s.id !== stationId);
  localStorage.setItem('railway-stations', JSON.stringify(filteredStations));
};

export const getStoredRoutes = (): Route[] => {
  const stored = localStorage.getItem('railway-routes');
  if (!stored) {
    // Initialize with default routes if none exist
    const defaultRoutes: Route[] = [
      {
        id: '1',
        fromStation: 'Washim',
        toStation: 'Akola',
        distance: 45,
        prices: { general: 25, sleeper: 50, ac: 100 },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        fromStation: 'Akola',
        toStation: 'Nagpur',
        distance: 120,
        prices: { general: 60, sleeper: 120, ac: 240 },
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        fromStation: 'Washim',
        toStation: 'Nagpur',
        distance: 165,
        prices: { general: 85, sleeper: 170, ac: 340 },
        createdAt: new Date().toISOString()
      },
    ];
    localStorage.setItem('railway-routes', JSON.stringify(defaultRoutes));
    return defaultRoutes;
  }
  return JSON.parse(stored);
};

export const saveRoute = (route: Route): void => {
  const routes = getStoredRoutes();
  routes.push(route);
  localStorage.setItem('railway-routes', JSON.stringify(routes));
};

export const updateRoute = (updatedRoute: Route): void => {
  const routes = getStoredRoutes();
  const index = routes.findIndex(r => r.id === updatedRoute.id);
  if (index !== -1) {
    routes[index] = updatedRoute;
    localStorage.setItem('railway-routes', JSON.stringify(routes));
  }
};

export const deleteRoute = (routeId: string): void => {
  const routes = getStoredRoutes();
  const filteredRoutes = routes.filter(r => r.id !== routeId);
  localStorage.setItem('railway-routes', JSON.stringify(filteredRoutes));
};

export const getAvailableDestinations = (fromStation: string): Route[] => {
  const routes = getStoredRoutes();
  return routes.filter(route => route.fromStation === fromStation);
};

export const getRouteInfo = (fromStation: string, toStation: string): Route | null => {
  const routes = getStoredRoutes();
  return routes.find(route => 
    route.fromStation === fromStation && route.toStation === toStation
  ) || null;
};

export const generateStationCode = (stationName: string): string => {
  const words = stationName.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
};
