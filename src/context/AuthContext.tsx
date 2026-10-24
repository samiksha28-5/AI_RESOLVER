import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isDemoUser: boolean;
  hasCompletedOnboarding: boolean;
  loginDemo: (role: UserRole) => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, orgName: string) => Promise<boolean>;
  logout: () => void;
  setCompletedOnboarding: (completed: boolean) => void;
  canManageSettings: boolean;
  canManageRules: boolean;
  canPublishKB: boolean;
  canAssignTickets: boolean;
  canViewAllTickets: boolean;
  canUseAIAssistant: boolean;
  canExportData: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = storageService.getUsers();
  
  // Default to Sarah Lin (Admin) for instant high-value demonstration
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('resolveai_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return users.find((u) => u.role === 'admin') || users[0];
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('resolveai_onboarding_done') === 'true';
  });

  const [isDemoUser, setIsDemoUser] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('resolveai_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('resolveai_current_user');
    }
  }, [currentUser]);

  const loginDemo = (role: UserRole) => {
    const allUsers = storageService.getUsers();
    let target = allUsers.find((u) => u.role === role);
    if (!target) {
      target = {
        id: `user_demo_${role}`,
        name: `Demo ${role.toUpperCase()}`,
        email: `${role}@resolveai.demo`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: role,
        status: 'active',
      };
    }
    setCurrentUser(target);
    setIsDemoUser(true);
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    const allUsers = storageService.getUsers();
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setIsDemoUser(true);
      return true;
    }
    // Create new agent session
    const newUser: User = {
      id: 'user_' + Date.now(),
      name: email.split('@')[0],
      email: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'agent',
      status: 'active',
    };
    setCurrentUser(newUser);
    setIsDemoUser(true);
    return true;
  };

  const signup = async (name: string, email: string, _pass: string, orgName: string): Promise<boolean> => {
    const newUser: User = {
      id: 'user_' + Date.now(),
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      status: 'active',
    };
    storageService.updateOrganization({ name: orgName });
    setCurrentUser(newUser);
    setIsDemoUser(true);
    setHasCompletedOnboarding(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const setCompletedOnboarding = (completed: boolean) => {
    setHasCompletedOnboarding(completed);
    localStorage.setItem('resolveai_onboarding_done', completed ? 'true' : 'false');
  };

  const role = currentUser?.role || 'agent';

  const canManageSettings = role === 'admin';
  const canManageRules = role === 'admin';
  const canPublishKB = role === 'admin' || role === 'manager';
  const canAssignTickets = role === 'admin' || role === 'manager';
  const canViewAllTickets = role === 'admin' || role === 'manager' || role === 'agent';
  const canUseAIAssistant = role === 'admin' || role === 'manager' || role === 'agent';
  const canExportData = role === 'admin' || role === 'manager';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isDemoUser,
        hasCompletedOnboarding,
        loginDemo,
        loginWithEmail,
        signup,
        logout,
        setCompletedOnboarding,
        canManageSettings,
        canManageRules,
        canPublishKB,
        canAssignTickets,
        canViewAllTickets,
        canUseAIAssistant,
        canExportData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
