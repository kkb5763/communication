"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, X } from "lucide-react";

export default function EditPostPage({ params }) {
  const { id } = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("tb_posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        setError("글을 불러오는 데 실패했습니다.");
      } else {
        setPost(data);
        setTitle(data.title || "");
        setContent(data.content || "");
        setCategory(data.category?.toString() || "");
        setImageUrls(Array.isArray(data.image_url) ? data.image_url : []);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("tb_codes")
        .select("*")
        .eq("category", 1)
        .order("id", { ascending: true });
      if (!error) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageUploading(true);
    const uploadedUrls = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('post-images').upload(fileName, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
    }
    setImageUrls(prev => [...prev, ...uploadedUrls]);
    setImageUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageRemove = (url) => {
    setImageUrls(prev => prev.filter(u => u !== url));
  };

  if (authLoading) return null;
  if (!user) return <div className="container mx-auto px-4 py-8 text-center">로그인 후 이용 가능합니다.</div>;
  if (loading) return <div className="container mx-auto px-4 py-8">로딩중...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  if (!post) return null;
  if (user.id !== post.user_id) return <div className="container mx-auto px-4 py-8 text-center">수정 권한이 없습니다.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("tb_posts")
      .update({ title, content, category, image_url: imageUrls })
      .eq("id", post.id);
    setSaving(false);
    if (!error) {
      alert("수정되었습니다.");
      router.push(`/posts/${post.id}`);
    } else {
      alert("수정 실패: " + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-bold">게시글 수정</h1>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-background border border-border">
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border">
                    {categories.length === 0 ? (
                      <div className="p-2 text-muted-foreground">카테고리 없음</div>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.code?.toString() || cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">제목</label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">본문</label>
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  required
                />
              </div>
              {/* 이미지 업로드 및 미리보기 */}
              <div>
                <label className="block mb-1 font-medium">이미지</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {imageUrls.map((url, idx) => (
                    <div key={url} className="relative group">
                      <img src={url} alt={`img${idx}`} className="w-24 h-24 object-cover rounded-lg border" />
                      <button type="button" className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-80 hover:opacity-100" onClick={() => handleImageRemove(url)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {imageUrls.length < 3 && (
                    <label className="w-24 h-24 flex items-center justify-center border rounded-lg cursor-pointer bg-muted hover:bg-accent">
                      <ImagePlus className="w-8 h-8 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                      />
                    </label>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">최대 3장, 1MB 이하 이미지</div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 