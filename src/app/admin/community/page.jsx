"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // 관리자만 접근 가능
  useEffect(() => {
    if (!loading && user && user.auth !== "01") {
      alert("관리자만 접근 가능합니다.");
      router.replace("/");
    }
  }, [user, loading, router]);

  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      const { data } = await supabase.from("tb_codes").select("*").eq("category", 1).order("id", { ascending: true });
      setCategories(data || []);
      setCatLoading(false);
    };
    fetchCategories();
  }, []);

  // 회원 목록 불러오기
  useEffect(() => {
    const fetchUsers = async () => {
      setUserLoading(true);
      const { data } = await supabase.from("tb_users").select("id, email, nickname, auth, created_at").order("created_at", { ascending: false });
      setUsers(data || []);
      setUserLoading(false);
    };
    fetchUsers();
  }, []);

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await supabase.from("tb_codes").insert({ category: 1, name: newCategory, code: Date.now().toString() });
    setNewCategory("");
    // 새로고침
    const { data } = await supabase.from("tb_codes").select("*").eq("category", 1).order("id", { ascending: true });
    setCategories(data || []);
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from("tb_codes").delete().eq("id", id);
    const { data } = await supabase.from("tb_codes").select("*").eq("category", 1).order("id", { ascending: true });
    setCategories(data || []);
  };

  // 회원 권한 변경
  const handleChangeAuth = async (id, newAuth) => {
    await supabase.from("tb_users").update({ auth: newAuth }).eq("id", id);
    const { data } = await supabase.from("tb_users").select("id, email, nickname, auth, created_at").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  // 회원 삭제
  const handleDeleteUser = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from("tb_users").delete().eq("id", id);
    const { data } = await supabase.from("tb_users").select("id, email, nickname, auth, created_at").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  if (loading) return null;
  if (!user || user.auth !== "01") return <div className="container mx-auto px-4 py-8 text-center">관리자만 접근 가능합니다.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">카테고리 관리</h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="새 카테고리명 입력"
                className="w-64"
              />
              <Button onClick={handleAddCategory} disabled={catLoading || !newCategory.trim()}>추가</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">이름</th>
                    <th className="p-2 border">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td className="p-2 border">{cat.id}</td>
                      <td className="p-2 border">{cat.name}</td>
                      <td className="p-2 border">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)}>삭제</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold">회원 관리</h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">이메일</th>
                    <th className="p-2 border">닉네임</th>
                    <th className="p-2 border">권한</th>
                    <th className="p-2 border">가입일</th>
                    <th className="p-2 border">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="p-2 border">{u.id}</td>
                      <td className="p-2 border">{u.email}</td>
                      <td className="p-2 border">{u.nickname}</td>
                      <td className="p-2 border">
                        <select value={u.auth} onChange={e => handleChangeAuth(u.id, e.target.value)} className="border rounded px-2 py-1">
                          <option value="01">관리자</option>
                          <option value="02">사용자</option>
                        </select>
                      </td>
                      <td className="p-2 border">{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</td>
                      <td className="p-2 border">
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}>삭제</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 