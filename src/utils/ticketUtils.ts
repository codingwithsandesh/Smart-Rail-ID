
import { Ticket, VerificationLog } from '../types';
import { getStoredStations } from './stationUtils';

export const generateTravelId = (fromStation: string): string => {
  const stations = getStoredStations();
  const station = stations.find(s => s.name === fromStation);
  const prefix = station?.code || 'GN';
  
  // Generate random 5-digit number
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNumber}`;
};

export const calculateExpiryTime = (travelDate: string, distance: number): string => {
  const travelDateTime = new Date(travelDate);
  // Estimate journey time: 1 hour per 60 km + 2 hours buffer
  const journeyHours = Math.ceil(distance / 60) + 2;
  travelDateTime.setHours(travelDateTime.getHours() + journeyHours);
  return travelDateTime.toISOString();
};

export const getStoredTickets = (): Ticket[] => {
  const stored = localStorage.getItem('railway-tickets');
  return stored ? JSON.parse(stored) : [];
};

export const saveTicket = (ticket: Ticket): void => {
  const tickets = getStoredTickets();
  tickets.push(ticket);
  localStorage.setItem('railway-tickets', JSON.stringify(tickets));
};

export const getStoredVerificationLogs = (): VerificationLog[] => {
  const stored = localStorage.getItem('railway-verification-logs');
  return stored ? JSON.parse(stored) : [];
};

export const saveVerificationLog = (log: VerificationLog): void => {
  const logs = getStoredVerificationLogs();
  logs.push(log);
  localStorage.setItem('railway-verification-logs', JSON.stringify(logs));
};

export const verifyTicket = (travelId: string, verifierName: string): { 
  isValid: boolean; 
  ticket?: Ticket; 
  status: 'valid' | 'invalid' | 'expired' | 'duplicate';
  message: string;
} => {
  const tickets = getStoredTickets();
  const ticket = tickets.find(t => t.travelId === travelId);
  
  if (!ticket) {
    const log: VerificationLog = {
      id: Date.now().toString(),
      travelId,
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString(),
      status: 'invalid',
      fraudAttempt: true,
      details: 'Travel ID not found'
    };
    saveVerificationLog(log);
    return { 
      isValid: false, 
      status: 'invalid',
      message: 'Travel ID not found - possible fraud attempt'
    };
  }

  // Check if ticket has expired
  const now = new Date();
  const expiryTime = new Date(ticket.expiresAt);
  if (now > expiryTime) {
    const log: VerificationLog = {
      id: Date.now().toString(),
      travelId,
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString(),
      status: 'expired',
      details: 'Ticket has expired'
    };
    saveVerificationLog(log);
    return { 
      isValid: false, 
      ticket, 
      status: 'expired',
      message: 'Ticket has expired'
    };
  }

  // Check if already verified
  if (ticket.isVerified) {
    const log: VerificationLog = {
      id: Date.now().toString(),
      travelId,
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString(),
      status: 'duplicate',
      details: `Already verified by ${ticket.verifiedBy} at ${ticket.verifiedAt}`
    };
    saveVerificationLog(log);
    return { 
      isValid: false, 
      ticket, 
      status: 'duplicate',
      message: 'Ticket already verified'
    };
  }

  // Mark ticket as verified
  ticket.isVerified = true;
  ticket.verifiedBy = verifierName;
  ticket.verifiedAt = new Date().toISOString();
  
  // Update stored tickets
  const updatedTickets = tickets.map(t => t.id === ticket.id ? ticket : t);
  localStorage.setItem('railway-tickets', JSON.stringify(updatedTickets));
  
  // Log successful verification
  const log: VerificationLog = {
    id: Date.now().toString(),
    travelId,
    verifiedBy: verifierName,
    verifiedAt: new Date().toISOString(),
    status: 'valid',
    details: 'Successfully verified'
  };
  saveVerificationLog(log);
  
  return { 
    isValid: true, 
    ticket, 
    status: 'valid',
    message: 'Ticket verified successfully'
  };
};

export const getStations = (): string[] => {
  const stations = getStoredStations();
  return stations.map(station => station.name);
};
