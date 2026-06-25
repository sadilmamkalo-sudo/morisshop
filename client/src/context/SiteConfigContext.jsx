import { createContext, useContext, useState, useEffect } from 'react';

const SiteConfigContext = createContext();

const defaults = {
  siteName: 'MORISSESHOP', whatsappNumber: '', currency: 'MAD',
  instagram: '', facebook: '', twitter: '', tiktok: '',
  email: '', phone: '', logo: '', favicon: ''
};

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(defaults);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(data => {
      if (data?.siteName) setConfig(prev => ({ ...prev, ...data }));
    }).catch(() => {});
  }, []);

  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>;
}

export const useSiteConfig = () => useContext(SiteConfigContext);
