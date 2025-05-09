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
  const [catLoading, setCatLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryCode, setNewCategoryCode] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (!loading && user && user.auth !== "01") {
      alert("관리자만 접근 가능합니다.");
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      const { data } = await supabase
        .from("tb_codes")
        .select("*")
        .eq("category", 1)
        .order("id", { ascending: true });
      setCategories(data || []);
      setCatLoading(false);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setUserLoading(true);
      const { data } = await supabase
        .from("tb_users")
        .select("id, email, nickname, auth, created_at")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setUserLoading(false);
    };
    fetchUsers();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryCode.trim()) return;

    const parsedCode = parseInt(newCategoryCode, 10);
    if (isNaN(parsedCode)) {
      alert("코드 값은 숫자여야 합니다.");
      return;
    }

    const { data: existing, error: checkError } = await supabase
      .from("tb_codes")
      .select("id")
      .eq("code", parsedCode)
      .eq("category", 1)
      .maybeSingle();

    if (checkError) {
      console.error("중복 확인 중 오류:", checkError.message);
      alert("오류가 발생했습니다.");
      return;
    }

    if (existing) {
      alert("이미 사용 중인 코드값입니다.");
      return;
    }

    const { error } = await supabase.from("tb_codes").insert({
      category: 1,
      name: newCategoryName,
      code: parsedCode,
    });

    if (error) {
      alert("추가 중 오류가 발생했습니다.");
      return;
    }

    setNewCategoryName("");
    setNewCategoryCode("");
    setIsAdding(false);

    const { data } = await supabase
      .from("tb_codes")
      .select("*")
      .eq("category", 1)
      .order("id", { ascending: true });

    setCategories(data || []);
  };

  const handleDeleteCategory = async (code) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from("tb_codes").delete().eq("code", code);
    const { data } = await supabase
      .from("tb_codes")
      .select("*")
      .eq("category", 1)
      .order("id", { ascending: true });
    setCategories(data || []);
  };

  const handleChangeAuth = async (id, newAuth) => {
    if (user && user.id === id) {
      alert("본인의 권한은 수정할 수 없습니다.");
      return;
    }
    await supabase.from("tb_users").update({ auth: newAuth }).eq("id", id);
    const { data } = await supabase
      .from("tb_users")
      .select("id, email, nickname, auth, created_at")
      .order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await supabase.from("tb_users").delete().eq("id", id);
    const { data } = await supabase
      .from("tb_users")
      .select("id, email, nickname, auth, created_at")
      .order("created_at", { ascending: false });
    setUsers(data || []);
  };

  if (loading) return null;
  if (!user || user.auth !== "01")
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        관리자만 접근 가능합니다.
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">카테고리 관리</h2>
              <Button onClick={() => setIsAdding(true)} disabled={isAdding}>추가</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 border">코드</th>
                    <th className="p-2 border">이름</th>
                    <th className="p-2 border">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="p-2 border">{cat.code}</td>
                      <td className="p-2 border">{cat.name}</td>
                      <td className="p-2 border">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCategory(cat.code)}
                        >
                          삭제
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {isAdding && (
                    <tr>
                      <td className="p-2 border">
                        <Input
                          value={newCategoryCode}
                          onChange={(e) => setNewCategoryCode(e.target.value)}
                          placeholder="코드"
                          className="w-24"
                        />
                      </td>
                      <td className="p-2 border">
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="이름"
                          className="w-32"
                        />
                      </td>
                      <td className="p-2 border flex gap-2">
                        <Button size="sm" onClick={handleAddCategory}>
                          저장
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAdding(false);
                            setNewCategoryCode("");
                            setNewCategoryName("");
                          }}
                        >
                          취소
                        </Button>
                      </td>
                    </tr>
                  )}
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
                    <th className="p-2 border">이메일</th>
                    <th className="p-2 border w-32">닉네임</th>
                    <th className="p-2 border w-30">권한</th>
                    <th className="p-2 border w-42">가입일</th>
                    <th className="p-2 border w-20">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="p-2 border">{u.email}</td>
                      <td className="p-2 border w-32">{u.nickname}</td>
                      <td className="p-2 border">
                        <select
                          value={u.auth}
                          onChange={(e) => handleChangeAuth(u.id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="01">관리자</option>
                          <option value="02">사용자</option>
                        </select>
                      </td>
                      <td className="p-2 border">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleString()
                          : ""}
                      </td>
                      <td className="p-2 border">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          삭제
                        </Button>
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