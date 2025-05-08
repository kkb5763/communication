"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const storageKey = `user_${typeof window !== 'undefined' ? window.location.hostname : ''}`;
    let userData = null;
    try {
      userData = localStorage.getItem(storageKey) || localStorage.getItem('user');
    } catch {}
    if (userData) {
      router.replace('/post-list');
    } else {
      router.replace('/login');
    }
  }, [router]);
  return null;
} 