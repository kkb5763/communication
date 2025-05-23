'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import bcrypt from 'bcryptjs';
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.target;
    const email = form.email.value; 
    const password = form.password.value;

    try {
      // tb_users 테이블에서 이메일로 사용자 조회
      const { data: users, error: fetchError } = await supabase
        .from('tb_users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      if (!users) {
        throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
      }

      // 비밀번호 비교
      const isValidPassword = await bcrypt.compare(password, users.password_hash);
      
      if (!isValidPassword) {
        throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
      }

      // 로그인 성공 시 사용자 정보를 localStorage에 저장
      const userData = {
        id: users.id,
        email: users.email,
        nickname: users.nickname,
        profile_image_url: users.profile_image_url,
        auth: users.auth,
        loggedInAt: new Date().toISOString()
      };
      
      try {
        const storageKey = `user_${window.location.hostname}`;
        localStorage.setItem(storageKey, JSON.stringify(userData));
        localStorage.setItem('user', JSON.stringify(userData)); // 이전 버전 호환
        setUser(userData); // 컨텍스트 상태도 즉시 반영
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
      }

      // 로그인 성공 시 홈으로 이동
      router.push('/');
    } catch (error) {
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              환영합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="w-full"
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
            <div className="text-center text-sm mt-4">
              아직 회원이 아니신가요?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                회원가입
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 