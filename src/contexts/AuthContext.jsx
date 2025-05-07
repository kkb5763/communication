'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const storageKey = `user_${typeof window !== 'undefined' ? window.location.hostname : ''}`;

  useEffect(() => {
    // localStorage에서 사용자 정보 로드
    const loadUser = () => {
      try {
        let userData = localStorage.getItem(storageKey);
        if (!userData) {
          // 이전 버전 호환: 'user' 키도 체크
          userData = localStorage.getItem('user');
        }
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // storage 이벤트 리스너 추가 (다른 탭에서의 변경 감지)
    const handleStorageChange = (e) => {
      if (e.key === storageKey || e.key === 'user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  const signOut = () => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem('user'); // 이전 버전 호환
    } catch (error) {
      console.error('Error removing user data:', error);
    }
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
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