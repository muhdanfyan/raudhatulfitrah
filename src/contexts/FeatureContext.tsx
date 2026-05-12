import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL, TENANT_ID, getHeaders, getPublicHeaders } from '../services/api';



interface FeatureContextType {
  features: string[];
  isFeatureActive: (key: string) => boolean;
  loading: boolean;
  refetch: () => void;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveFeatures = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/features/active`, {
        headers: {
          'Accept': 'application/json',
          'X-Tenant-ID': TENANT_ID,
        }
      });
      const json = await res.json();
      if (json.success) {
        setFeatures(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch features:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveFeatures();
  }, []);

  const isFeatureActive = (key: string) => features.includes(key);

  return (
    <FeatureContext.Provider value={{ features, isFeatureActive, loading, refetch: fetchActiveFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within FeatureProvider');
  }
  return context;
}

export default FeatureContext;
