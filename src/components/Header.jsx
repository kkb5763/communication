'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-end">
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="font-semibold text-primary">{user.nickname}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  로그아웃
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 