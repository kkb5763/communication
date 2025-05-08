"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategorySidebar from "@/components/CategorySidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function PostListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userMap, setUserMap] = useState({});
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showCategory, setShowCategory] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      let query = supabase.from("tb_posts").select("*").order("created_at", { ascending: false });
      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }
      const { data, error } = await query;
      if (error) {
        setError("글을 불러오는 데 실패했습니다.");
        setLoading(false);
        return;
      }
      setPosts(data || []);
      // user_id 목록 추출
      const userIds = Array.from(new Set((data || []).map(p => p.user_id).filter(Boolean)));
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("tb_users")
          .select("id, nickname")
          .in("id", userIds);
        const map = {};
        (users || []).forEach(u => { map[u.id] = u.nickname; });
        setUserMap(map);
      } else {
        setUserMap({});
      }
      setLoading(false);
    };
    fetchPosts();
  }, [selectedCategory]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="hidden md:flex mb-4 items-center gap-2">
          <Button onClick={() => setShowCategory(v => !v)}>
            카테고리
          </Button>
          <Link href="/write">
            <Button className="ml-2">글 작성</Button>
          </Link>
        </div>
        {showCategory && (
          <div className="fixed bottom-12 left-0 w-full px-4 z-50 md:hidden">
            <div className="bg-background rounded-xl shadow-lg">
              <CategorySidebar
                selectedCategory={selectedCategory}
                onSelectCategory={cat => {
                  setSelectedCategory(cat);
                  setShowCategory(false);
                }}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="hidden md:block">
            <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          </div>
          <div className="flex-1">
            <div className="mb-6 flex items-center gap-2 md:flex">
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                className="w-full"
              />
              <Link href="/write" className="hidden md:block ml-2">
                <Button>글 작성</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-muted-foreground">로딩중...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : posts.length === 0 ? (
                <div className="text-muted-foreground">글이 없습니다.</div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="cursor-pointer" onClick={() => router.push(`/posts/${post.id}`)}>
                    <CardContent className="p-4 flex flex-row-reverse gap-4">
                      {Array.isArray(post.image_url) && post.image_url[0] && (
                        <img
                          src={post.image_url[0]}
                          alt="썸네일"
                          className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-base truncate">{post.title.split("\n")[0]}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>{userMap[post.user_id] || '[unknown]'}</span>
                          <span>{post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko }) : ''}</span>
                          <span>댓글 {post.comments_count ?? 0}</span>
                          <span>추천 {post.likes ?? 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 w-full border-t flex justify-around items-center py-2 md:hidden z-50">
        <Button onClick={() => setShowCategory(v => !v)} size="sm">
          카테고리
        </Button>
        <Link href="/write">
          <Button size="sm">글 작성</Button>
        </Link>
        {user?.auth === "01" && (
          <Link href="/admin/community">
            <Button size="sm">관리페이지</Button>
          </Link>
        )}
      </div>
    </div>
  );
} 