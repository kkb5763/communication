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

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userMap, setUserMap] = useState({});
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
  if (!user) return <div className="container mx-auto px-4 py-8 text-center">로그인 후 이용 가능합니다.</div>;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 좌측 카테고리 영역 */}
          <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

          {/* 메인 컨텐츠 */}
          <div className="flex-1">
            <div className="mb-6 flex items-center gap-2">
              <Input
                type="search"
                placeholder="검색어를 입력하세요"
                className="w-full"
              />
              <Link href="/write">
                <Button className="ml-2">글 작성</Button>
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
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* 썸네일 */}
                      {Array.isArray(post.image_url) && post.image_url[0] && (
                        <img
                          src={post.image_url[0]}
                          alt="썸네일"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 truncate">
                          {post.title.split("\n")[0]}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{userMap[post.user_id] || '[unknown]'}</span>
                          <span>{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</span>
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
    </div>
  );
} 