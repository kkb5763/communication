'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const passwordConfirm = form.passwordConfirm.value;
    const nickname = form.nickname.value;
    // 프로필 이미지는 확장 시 구현 가능
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }
    const res = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, nickname }),
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || '회원가입 실패');
    } else {
      window.location.href = '/login';
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-md mx-auto">
        <Card className="bg-background border border-border shadow-lg">
          <CardHeader>
            <CardTitle>회원가입</CardTitle>
            <CardDescription>
              Blind Community의 회원이 되어보세요
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
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
                <Input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  placeholder="닉네임을 입력하세요"
                  required
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="accent-primary"
                  required
                />
                <Label htmlFor="agree" className="text-sm">이용약관 및 개인정보 처리방침에 동의합니다.</Label>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button type="submit" className="w-full" disabled={!agree || loading}>
                {loading ? '가입 중...' : '회원가입'}
              </Button>
              <div className="text-center text-sm">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  로그인
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 