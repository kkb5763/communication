"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

export default function WritePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState([]); // 여러 이미지
  const [imageUploading, setImageUploading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tb_codes")
        .select("*")
        .eq("category", 1)
        .order("id", { ascending: true });
      if (!error) setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (imageUrls.length >= MAX_IMAGES) {
      setError(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
      return;
    }
    for (const file of files) {
      if (imageUrls.length >= MAX_IMAGES) break;
      if (file.size > MAX_IMAGE_SIZE) {
        setError("이미지 크기는 1MB 이하만 가능합니다.");
        continue;
      }
      setImageUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, file);
      if (uploadError) {
        setError("이미지 업로드 실패: " + uploadError.message);
        setImageUploading(false);
        continue;
      }
      const { data: publicUrlData } = supabase
        .storage
        .from('post-images')
        .getPublicUrl(fileName);
      setImageUrls((prev) => [...prev, publicUrlData.publicUrl]);
      setImageUploading(false);
    }
    // 파일 선택 input 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (idx) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) {
      setError("로그인 후 글을 작성할 수 있습니다.");
      return;
    }
    if (!category || !title || !content) {
      setError("카테고리, 제목, 내용을 모두 입력하세요.");
      return;
    }
    setSubmitting(true);
    const { error: insertError } = await supabase
      .from("tb_posts")
      .insert({
        user_id: user.id,
        category,
        title,
        content,
        image_url: imageUrls.length > 0 ? imageUrls : null,
        // TODO: 해시태그 등 추가 필드 필요시 여기에
      });
    setSubmitting(false);
    if (insertError) {
      setError("글 저장에 실패했습니다: " + insertError.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-background border border-border shadow-lg">
          <CardHeader>
            <CardTitle>글 작성</CardTitle>
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
                    {loading ? (
                      <div className="p-2 text-muted-foreground">로딩중...</div>
                    ) : categories.length === 0 ? (
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
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="제목을 입력하세요"
                  required
                  className="bg-background border border-border"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="내용을 입력하세요"
                  className="min-h-[200px] bg-background border border-border"
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>이미지</Label>
                <div className="flex gap-4">
                  <div
                    className={`aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent bg-background ${imageUrls.length >= MAX_IMAGES ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => imageUrls.length < MAX_IMAGES && fileInputRef.current && fileInputRef.current.click()}
                  >
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      multiple
                    />
                  </div>
                  {/* 이미지 썸네일 리스트 */}
                  {imageUrls.map((url, idx) => (
                    <div key={url} className="aspect-square relative rounded-lg overflow-hidden bg-background w-24 h-24 flex-shrink-0">
                      <img
                        src={url}
                        alt={`Uploaded image ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 bg-background rounded-full hover:bg-accent"
                        onClick={() => handleRemoveImage(idx)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {imageUploading && (
                    <div className="aspect-square flex items-center justify-center text-muted-foreground">업로드 중...</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">최대 3장, 1장당 1MB 이하</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtags">해시태그</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    id="hashtags"
                    placeholder="해시태그를 입력하고 엔터를 누르세요"
                    className="flex-1 bg-background border border-border"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-accent rounded-full text-sm">
                    <span>#회사생활</span>
                    <button type="button">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-accent rounded-full text-sm">
                    <span>#일상</span>
                    <button type="button">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  취소
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "작성 중..." : "작성하기"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 