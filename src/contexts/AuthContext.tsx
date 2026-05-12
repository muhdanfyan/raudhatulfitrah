import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import { api, getHeaders } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapRole = (role: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'members': 'santri',
    'admin': 'superadmin',
    'pengontrol': 'musyrif',
    'kepsek': 'kepsek',
  };
  return (roleMap[role] || role) as UserRole;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('pisantri_token'));

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('pisantri_token') || localStorage.getItem('ppdb_token');
      
      if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
        const savedPpdbUser = localStorage.getItem('ppdb_user');
        if (savedPpdbUser && localStorage.getItem('ppdb_token') === savedToken) {
          try {
            const verifyRes = await fetch(`${api.getBaseUrl()}/api/ppdb/dashboard`, { 
              headers: getHeaders() 
            });
            
            if (verifyRes.ok) {
              const ppdbData = JSON.parse(savedPpdbUser);
              if (!ppdbData) {
                // If ppdbData is null, we can't map user properly
                setIsLoading(false);
                return;
              }
              const mappedUser: User = {
                id: String(ppdbData.id_santri || ppdbData.id || ''),
                name: ppdbData.nama_lengkap || ppdbData.name || '',
                email: ppdbData.email || '',
                role: 'santri',
                status_santri: 'Daftar',
              };
              setUser(mappedUser);
              setIsLoading(false);
              return;
            } else {
              // Token invalid
              localStorage.removeItem('ppdb_token');
              localStorage.removeItem('ppdb_user');
              localStorage.removeItem('pisantri_token');
            }
          } catch (e) {
            console.error('[AuthContext] Error verifying ppdb session', e);
          }
        }

        try {
          const userData = await api.getMe();
          const mappedRole = mapRole(userData.role);
          
          console.group('%c[AuthContext] Init Session (Me)', 'color: #3b82f6; font-weight: bold;');
          console.log('Backend Role:', userData.role);
          console.log('Mapped Role:', mappedRole);
          console.log('Full User Data:', userData);
          console.groupEnd();

          const mappedUser: User = {
            id: String(userData.id),
            name: userData.name,
            email: userData.email,
            role: mappedRole,
            photo: userData.photo || undefined,
            santri_id: userData.santri_id,
            status_santri: userData.status_santri,
          };
          setUser(mappedUser);
          localStorage.setItem('pisantri_user', JSON.stringify(mappedUser));
        } catch {
          api.setToken(null);
          setToken(null);
          localStorage.removeItem('pisantri_user');
          localStorage.removeItem('ppdb_token');
          localStorage.removeItem('ppdb_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      setToken(localStorage.getItem('pisantri_token'));
      const backendRole = response.user.role;
      const mappedRole = mapRole(backendRole);

      console.group('%c[AuthContext] Login Success', 'color: #10b981; font-weight: bold;');
      console.log('Backend Role:', backendRole);
      console.log('Mapped Role:', mappedRole);
      console.groupEnd();

      const mappedUser: User = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        role: mappedRole,
        photo: response.user.photo || undefined,
        santri_id: response.user.santri_id,
        status_santri: response.user.status_santri,
      };
      setUser(mappedUser);
      localStorage.setItem('pisantri_user', JSON.stringify(mappedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Unregister FCM token before logout
      const fcmToken = localStorage.getItem('fcm_token');
      if (fcmToken) {
        try {
          await api.post('/fcm/unregister', { token: fcmToken });
          localStorage.removeItem('fcm_token');
        } catch (e) {
          console.error('Failed to unregister FCM token:', e);
        }
      }
      await api.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('pisantri_user');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      const mappedUser: User = {
        id: String(userData.id),
        name: userData.name,
        email: userData.email,
        role: mapRole(userData.role),
        photo: userData.photo || undefined,
        santri_id: userData.santri_id || undefined,
        status_santri: userData.status_santri,
      };
      setUser(mappedUser);
      localStorage.setItem('pisantri_user', JSON.stringify(mappedUser));
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, isLoading, token, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
