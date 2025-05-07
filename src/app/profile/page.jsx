import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, Edit, Settings } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 프로필 헤더 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>AN</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">익명의 사용자</h1>
                    <p className="text-muted-foreground">@anonymous</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    프로필 설정
                  </Button>
                </div>
                <div className="mt-4 flex gap-4">
                  <div>
                    <span className="font-semibold">128</span> 게시글
                  </div>
                  <div>
                    <span className="font-semibold">1.2k</span> 댓글
                  </div>
                  <div>
                    <span className="font-semibold">256</span> 북마크
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 프로필 컨텐츠 */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">내 게시글</TabsTrigger>
            <TabsTrigger value="comments">내 댓글</TabsTrigger>
            <TabsTrigger value="bookmarks">북마크</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-4">
              {[1, 2, 3].map((post) => (
                <Card key={post}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-2">
                          [회사] 오늘 회사에서 있었던 일
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          오늘 회사에서 정말 재미있는 일이 있었는데요...
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>2시간 전</span>
                          <span>댓글 12</span>
                          <span>추천 24</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="space-y-4">
              {[1, 2, 3].map((comment) => (
                <Card key={comment}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm mb-2">
                          정말 재미있는 일이네요! 저희 팀장님도 비슷한 일이 있었는데...
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>게시글: 오늘 회사에서 있었던 일</span>
                          <span>5분 전</span>
                          <span>추천 5</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookmarks">
            <div className="space-y-4">
              {[1, 2, 3].map((bookmark) => (
                <Card key={bookmark}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-2">
                          [학교] 시험 기간이 다가오네요
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          다음 주부터 시험인데 공부가 너무 안되요...
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>익명</span>
                          <span>1일 전</span>
                          <span>댓글 3</span>
                          <span>추천 5</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 