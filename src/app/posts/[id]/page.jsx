"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, MessageSquare, Bookmark, Edit, Trash2, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export default function PostDetailPage({ params }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [nickname, setNickname] = useState('[unknown]');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // 게시글 fetch
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("tb_posts")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error) {
        setError("글을 불러오는 데 실패했습니다.");
      } else {
        setPost(data);
        // 닉네임 fetch
        if (data && data.user_id) {
          const { data: userData } = await supabase
            .from("tb_users")
            .select("nickname")
            .eq("id", data.user_id)
            .single();
          setNickname(userData?.nickname || '[unknown]');
        } else {
          setNickname('[unknown]');
        }
      }
      setLoading(false);
    };
    fetchPost();
  }, [params.id]);

  // 댓글 fetch
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("tb_comments")
        .select("*")
        .eq("post_id", params.id)
        .order("created_at", { ascending: true });
      if (!error) setComments(data || []);
    };
    fetchComments();
  }, [params.id, commentSubmitting]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError("");
    if (!user) {
      setCommentError("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    if (!commentInput.trim()) {
      setCommentError("댓글 내용을 입력하세요.");
      return;
    }
    setCommentSubmitting(true);
    const { error } = await supabase
      .from("tb_comments")
      .insert({
        post_id: params.id,
        user_id: user.id,
        content: commentInput.trim(),
      });
    setCommentSubmitting(false);
    if (error) {
      setCommentError("댓글 저장에 실패했습니다: " + error.message);
    } else {
      setCommentInput("");
    }
  };

  // 삭제 핸들러: 게시글과 연결된 댓글도 함께 삭제
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    // 댓글 먼저 삭제
    await supabase.from('tb_comments').delete().eq('post_id', post.id);
    // 게시글 삭제
    const { error } = await supabase.from('tb_posts').delete().eq('id', post.id);
    if (!error) {
      alert("삭제되었습니다.");
      router.push('/');
    } else {
      alert("삭제 실패: " + error.message);
    }
  };

  // 수정 핸들러: 수정 페이지로 이동 (예시)
  const handleEdit = () => {
    router.push(`/posts/${post.id}/edit`);
  };

  if (authLoading) return null;
  if (!user) return <div className="container mx-auto px-4 py-8 text-center">로그인 후 이용 가능합니다.</div>;
  if (loading) return <div className="container mx-auto px-4 py-8">로딩중...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  if (!post) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 게시글 내용 */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold mt-1">{post.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4 mr-1" />
                  북마크
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* 작성자만 수정/삭제 가능 */}
                    {user.id === post.user_id && (
                      <>
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          삭제
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>{nickname}</span>
              <span>{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</span>
            </div>
            {/* 해시태그 등 추가 가능 */}
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p style={{ whiteSpace: 'pre-line' }}>{post.content}</p>
              {Array.isArray(post.image_url) && post.image_url.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {post.image_url.map((url, idx) => (
                    <img
                      key={url}
                      src={url}
                      alt={`Post image ${idx + 1}`}
                      className="rounded-lg w-full"
                    />
                  ))}
                </div>
              )}
            </div>
            {/* 좋아요/싫어요 등은 추후 구현 */}
          </CardContent>
        </Card>

        {/* 댓글 작성 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleCommentSubmit}>
              <Textarea
                placeholder="댓글을 작성하세요"
                className="min-h-[100px]"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                disabled={commentSubmitting}
              />
              {commentError && <div className="text-red-500 text-sm">{commentError}</div>}
              <div className="flex justify-end">
                <Button type="submit" disabled={commentSubmitting}>
                  {commentSubmitting ? "작성 중..." : "댓글 작성"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-muted-foreground text-sm">아직 댓글이 없습니다.</div>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">익명</span>
                        <span className="text-sm text-muted-foreground">
                          {comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="text-sm">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 