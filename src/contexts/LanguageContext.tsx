
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    'common.login': 'Login',
    'common.logout': 'Logout',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.selectOption': 'Select an option',
    
    // Login Page
    'login.title': 'Railway Admin Login',
    'login.subtitle': 'Access the Smart Ticketing System',
    'login.slogan': 'Lifeline of the Nation',
    'login.username': 'Username / Staff ID',
    'login.password': 'Password',
    'login.role': 'Role',
    'login.workingStation': 'Working Station',
    'login.workingStationOptional': 'Working Station (Optional)',
    'login.signIn': 'Sign In',
    'login.signingIn': 'Signing In...',
    'login.selectRole': 'Select your role',
    'login.selectStation': 'Select your working station',
    'login.stationNote': 'You will only see data related to this station',
    'login.optionalNote': 'Leave blank if working station is already set in your profile',
    'login.demo': 'Demo Credentials:',
    'login.adminCreds': 'Admin: admin / password',
    'login.staffCreds': 'Staff: Use Staff ID and password from Staff Management',
    
    // Roles
    'roles.ticketCreator': 'Ticket Creator',
    'roles.tte': 'TTE (Ticket Checker)',
    'roles.admin': 'Admin Inspector',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.createTicket': 'Create Ticket',
    'nav.validateTicket': 'Validate Ticket',
    'nav.verificationLogs': 'Verification Logs',
    'nav.stationManagement': 'Station Management',
    'nav.staffManagement': 'Staff Management',
    
    // Layout
    'layout.title': 'Railway Smart Ticketing System',
    
    // Journey Form
    'journey.title': 'Journey Details',
    'journey.travelDate': 'Travel Date',
    'journey.fromStation': 'From Station',
    'journey.toStation': 'To Station',
    'journey.workingStationNote': 'This is your working station selected during login',
    'journey.selectDestination': 'Select destination station',
    'journey.loadingStation': 'Loading working station...',
  },
  hi: {
    // Common
    'common.login': 'लॉगिन',
    'common.logout': 'लॉगआउट',
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.add': 'जोड़ें',
    'common.search': 'खोजें',
    'common.loading': 'लोड हो रहा है...',
    'common.selectOption': 'एक विकल्प चुनें',
    
    // Login Page
    'login.title': 'रेलवे प्रशासन लॉगिन',
    'login.subtitle': 'स्मार्ट टिकटिंग सिस्टम एक्सेस करें',
    'login.slogan': 'राष्ट्र की जीवन रेखा',
    'login.username': 'उपयोगकर्ता नाम / स्टाफ आईडी',
    'login.password': 'पासवर्ड',
    'login.role': 'भूमिका',
    'login.workingStation': 'कार्य स्टेशन',
    'login.workingStationOptional': 'कार्य स्टेशन (वैकल्पिक)',
    'login.signIn': 'साइन इन करें',
    'login.signingIn': 'साइन इन हो रहा है...',
    'login.selectRole': 'अपनी भूमिका चुनें',
    'login.selectStation': 'अपना कार्य स्टेशन चुनें',
    'login.stationNote': 'आप केवल इस स्टेशन से संबंधित डेटा देख पाएंगे',
    'login.optionalNote': 'यदि कार्य स्टेशन आपकी प्रोफाइल में पहले से सेट है तो खाली छोड़ें',
    'login.demo': 'डेमो क्रेडेंशियल:',
    'login.adminCreds': 'एडमिन: admin / password',
    'login.staffCreds': 'स्टाफ: स्टाफ प्रबंधन से स्टाफ आईडी और पासवर्ड का उपयोग करें',
    
    // Roles
    'roles.ticketCreator': 'टिकट निर्माता',
    'roles.tte': 'टीटीई (टिकट चेकर)',
    'roles.admin': 'प्रशासन निरीक्षक',
    
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.createTicket': 'टिकट बनाएं',
    'nav.validateTicket': 'टिकट सत्यापित करें',
    'nav.verificationLogs': 'सत्यापन लॉग',
    'nav.stationManagement': 'स्टेशन प्रबंधन',
    'nav.staffManagement': 'स्टाफ प्रबंधन',
    
    // Layout
    'layout.title': 'रेलवे स्मार्ट टिकटिंग सिस्टम',
    
    // Journey Form
    'journey.title': 'यात्रा विवरण',
    'journey.travelDate': 'यात्रा की तारीख',
    'journey.fromStation': 'से स्टेशन',
    'journey.toStation': 'तक स्टेशन',
    'journey.workingStationNote': 'यह आपका कार्य स्टेशन है जो लॉगिन के दौरान चुना गया',
    'journey.selectDestination': 'गंतव्य स्टेशन चुनें',
    'journey.loadingStation': 'कार्य स्टेशन लोड हो रहा है...',
  },
  mr: {
    // Common
    'common.login': 'लॉगिन',
    'common.logout': 'लॉगआउट',
    'common.submit': 'सबमिट करा',
    'common.cancel': 'रद्द करा',
    'common.save': 'सेव्ह करा',
    'common.edit': 'संपादित करा',
    'common.delete': 'हटवा',
    'common.add': 'जोडा',
    'common.search': 'शोधा',
    'common.loading': 'लोड होत आहे...',
    'common.selectOption': 'एक पर्याय निवडा',
    
    // Login Page
    'login.title': 'रेल्वे प्रशासन लॉगिन',
    'login.subtitle': 'स्मार्ट तिकीट प्रणाली वापरा',
    'login.slogan': 'राष्ट्राची जीवनरेषा',
    'login.username': 'वापरकर्ता नाव / कर्मचारी आयडी',
    'login.password': 'पासवर्ड',
    'login.role': 'भूमिका',
    'login.workingStation': 'कार्य स्थानक',
    'login.workingStationOptional': 'कार्य स्थानक (वैकल्पिक)',
    'login.signIn': 'साइन इन करा',
    'login.signingIn': 'साइन इन होत आहे...',
    'login.selectRole': 'तुमची भूमिका निवडा',
    'login.selectStation': 'तुमचे कार्य स्थानक निवडा',
    'login.stationNote': 'तुम्ही फक्त या स्थानकाशी संबंधित डेटा पाहू शकाल',
    'login.optionalNote': 'कार्य स्थानक तुमच्या प्रोफाइलमध्ये आधीपासून सेट असल्यास रिकामे ठेवा',
    'login.demo': 'डेमो क्रेडेन्शियल:',
    'login.adminCreds': 'अॅडमिन: admin / password',
    'login.staffCreds': 'कर्मचारी: कर्मचारी व्यवस्थापनातील कर्मचारी आयडी आणि पासवर्ड वापरा',
    
    // Roles
    'roles.ticketCreator': 'तिकीट निर्माता',
    'roles.tte': 'टीटीई (तिकीट तपासकर्ता)',
    'roles.admin': 'प्रशासन निरीक्षक',
    
    // Navigation
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.createTicket': 'तिकीट तयार करा',
    'nav.validateTicket': 'तिकीट सत्यापित करा',
    'nav.verificationLogs': 'सत्यापन लॉग',
    'nav.stationManagement': 'स्थानक व्यवस्थापन',
    'nav.staffManagement': 'कर्मचारी व्यवस्थापन',
    
    // Layout
    'layout.title': 'रेल्वे स्मार्ट तिकिटिंग प्रणाली',
    
    // Journey Form
    'journey.title': 'प्रवास तपशील',
    'journey.travelDate': 'प्रवासाची तारीख',
    'journey.fromStation': 'पासून स्थानक',
    'journey.toStation': 'पर्यंत स्थानक',
    'journey.workingStationNote': 'हे तुमचे कार्य स्थानक आहे जे लॉगिन दरम्यान निवडले गेले',
    'journey.selectDestination': 'गंतव्य स्थानक निवडा',
    'journey.loadingStation': 'कार्य स्थानक लोड होत आहे...',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
