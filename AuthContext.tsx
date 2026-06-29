import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserProgress } from '../types';

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  progress: UserProgress | null;
  markLessonComplete: (lessonId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = (token: string, userId: string) => {
    fetch('/api/user/progress', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProgress({ userId, completedLessons: data.completedLessons || [] });
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          fetchProgress(token, data.user.id);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, newUser: User) => {
    localStorage.setItem('token', token);
    setUser(newUser);
    fetchProgress(token, newUser.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProgress(null);
  };

  const markLessonComplete = (lessonId: string) => {
    const token = localStorage.getItem('token');
    if (token && user) {
      fetch('/api/user/progress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ lessonId })
      }).then(() => {
        setProgress(prev => {
          if (!prev) return prev;
          if (prev.completedLessons.includes(lessonId)) return prev;
          return { ...prev, completedLessons: [...prev.completedLessons, lessonId] };
        });
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, progress, markLessonComplete, isLoading }}>
      {!isLoading && children}
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

