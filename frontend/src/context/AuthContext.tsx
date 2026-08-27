import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_URL } from '../config';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface AssessmentResultItem {
  assessmentId: string;
  code: string;
  title: string;
  score: number;
  severity: string;
  completedAt: string;
}

export interface MoodLogItem {
  mood: string;
  level: number;
  emoji: string;
  type: string;
  confidence?: string;
  note?: string;
  date: string;
  time: string;
  loggedAt?: string;
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone: string;
  bio?: string;
  emergencyContact?: EmergencyContact;
  assessmentResults?: AssessmentResultItem[];
  moodLogs?: MoodLogItem[];
  isDemo: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  demoLogin: () => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  refreshUser: () => Promise<void>;
  recordAssessmentLocally: (item: AssessmentResultItem) => void;
  logout: () => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('ss_token');
    const storedUser = localStorage.getItem('ss_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('ss_token');
        localStorage.removeItem('ss_user');
      }
    }
    setIsLoading(false);
  }, []);

  const persistSession = (tk: string, usr: AuthUser) => {
    localStorage.setItem('ss_token', tk);
    localStorage.setItem('ss_user', JSON.stringify(usr));
    setToken(tk);
    setUser(usr);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        persistSession(data.token, data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch {
      return { success: false, message: 'Unable to reach server. Check your connection.' };
    }
  };

  const register = async (formData: RegisterData) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        persistSession(data.token, data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch {
      return { success: false, message: 'Unable to reach server. Check your connection.' };
    }
  };

  const demoLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        persistSession(data.token, data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Demo login failed.' };
    } catch {
      return { success: false, message: 'Unable to reach server. Check your connection.' };
    }
  };

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('ss_token')}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        persistSession(token || localStorage.getItem('ss_token') || '', data.user);
        return { success: true, message: data.message, user: data.user };
      }
      return { success: false, message: data.message || 'Profile update failed.' };
    } catch {
      return { success: false, message: 'Unable to reach server. Please try again.' };
    }
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('ss_token');
    if (!currentToken) return;
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      const data = await res.json();
      if (data.success && data.user) {
        persistSession(currentToken, data.user);
      }
    } catch (err) {
      console.warn('Silent refresh user error:', err);
    }
  };

  const recordAssessmentLocally = (item: AssessmentResultItem) => {
    try {
      const existing = localStorage.getItem('ss_assessment_history');
      const list: AssessmentResultItem[] = existing ? JSON.parse(existing) : [];
      const updatedList = [item, ...list.filter(x => !(x.assessmentId === item.assessmentId && x.completedAt === item.completedAt))];
      localStorage.setItem('ss_assessment_history', JSON.stringify(updatedList));
    } catch {
      // ignore local parsing errors
    }

    if (user) {
      const currentResults = user.assessmentResults || [];
      const updatedUser: AuthUser = {
        ...user,
        assessmentResults: [item, ...currentResults],
      };
      setUser(updatedUser);
      localStorage.setItem('ss_user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: Boolean(user),
        isLoading,
        login,
        register,
        demoLogin,
        updateProfile,
        refreshUser,
        recordAssessmentLocally,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
