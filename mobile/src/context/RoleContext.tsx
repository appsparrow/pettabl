import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

type Role = 'fur_boss' | 'fur_agent';

interface RoleContextValue {
  activeRole: Role;
  loading: boolean;
  setRole: (role: Role) => Promise<void>;
  toggleRole: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue>({
  activeRole: 'fur_boss',
  loading: true,
  setRole: async () => {},
  toggleRole: async () => {},
  refreshRole: async () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<Role>('fur_boss');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void loadInitialRole();
  }, []);

  const loadInitialRole = async () => {
    await refreshRole();
    setLoading(false);
  };

  const refreshRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUserId(null);
      setActiveRole('fur_boss');
      return;
    }

    setUserId(user.id);
    const storageKey = `activeRole:${user.id}`;
    const stored = await AsyncStorage.getItem(storageKey);
    if (stored === 'fur_boss' || stored === 'fur_agent') {
      setActiveRole(stored);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (data?.role === 'fur_agent' || data?.role === 'fur_boss') {
      setActiveRole(data.role);
      await AsyncStorage.setItem(storageKey, data.role);
      return;
    }
    setActiveRole('fur_boss');
    await AsyncStorage.setItem(storageKey, 'fur_boss');
  };

  const setRole = async (role: Role) => {
    setActiveRole(role);
    if (userId) {
      await AsyncStorage.setItem(`activeRole:${userId}`, role);
    }
  };

  const toggleRole = async () => {
    const next = activeRole === 'fur_boss' ? 'fur_agent' : 'fur_boss';
    await setRole(next);
  };

  return (
    <RoleContext.Provider value={{ activeRole, loading, setRole, toggleRole, refreshRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

