import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  userId: string;
  email: string;
  username: string;
  // password should not be stored here
  fullName?: string; // Make optional or ensure API returns it
  role?: string;     // Make optional or ensure API returns it
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  const login = async (userData: User) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      setCurrentUser(userData);
    } catch (e) {
      console.error("Failed to save user to storage", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setCurrentUser(null);
    } catch (e) {
      console.error("Failed to remove user from storage", e);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};