"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { User } from "@/lib/types";

type UserContextType = {
  user: User | null; // Allow null initially
  setUser: (user: Partial<User>) => void;
  updateUser: (updates: Partial<User>) => void; // Added for convenience
  resetUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialUser: User = {
    fullName: 'Guest',
    email: '',
    avatar: '',
    securityAnswers: { bestFriend: '', nickname: '', petName: '' },
    highestGameScore: 0,
    gameHighScores: [],
    currency: "INR" // Ensure this exists
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // 1. Start with 'null' or default, but DO NOT read localStorage yet
  const [user, setCurrentUser] = useState<User>(initialUser);
  const [mounted, setMounted] = useState(false);

  // 2. Load data ONLY after the browser is ready (Vercel Safe)
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("spendcontrol_user");
    if (saved) {
        try {
            setCurrentUser(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to parse user data");
        }
    }
  }, []);

  // 3. Save data whenever 'user' changes
  useEffect(() => {
      if (mounted) {
          localStorage.setItem("spendcontrol_user", JSON.stringify(user));
      }
  }, [user, mounted]);

  const updateUser = useCallback((updatedFields: Partial<User>) => {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
  }, []);

  const setUser = useCallback((updatedFields: Partial<User>) => {
       setCurrentUser(prev => ({ ...prev, ...updatedFields }));
  }, []);

  const resetUser = () => {
    if (confirm("Are you sure you want to reset your profile?")) {
        setCurrentUser(initialUser);
        localStorage.removeItem("spendcontrol_user");
        window.location.reload();
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};