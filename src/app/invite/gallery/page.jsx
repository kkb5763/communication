'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 갤러리 페이지 컴포넌트
export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState([]);

  // Supabase 스토리지에서 이미지 불러오기
  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage.from('wedding-gallery').list('gallery', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

      if (error) {
        console.error('이미지 목록 로딩 실패:', error.message);
        return;
      }

      const urls = (data || [])
        .filter((file) => file.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/))
        .map((file) => supabase.storage.from('wedding-gallery').getPublicUrl(`gallery/${file.name}`).data.publicUrl);

      setImages(urls);
    };

    fetchImages();
  }, []);

  // 이미지 업로드 처리
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `gallery/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('wedding-gallery')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      showToast('업로드 실패: ' + error.message);
    } else {
      showToast('✅ 업로드 성공!');
      // 새로고침
      const { data, error } = await supabase.storage.from('wedding-gallery').list('gallery', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });
      if (!error) {
        const urls = (data || [])
          .filter((file) => file.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/))
          .map((file) => supabase.storage.from('wedding-gallery').getPublicUrl(`gallery/${file.name}`).data.publicUrl);
        setImages(urls);
      }
    }
  };

  // 토스트 메시지 표시
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.className =
      'fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#3e312b] text-white px-4 py-2 rounded shadow z-50 animate-fadeInOut';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fffdf7] text-center px-4 py-10">
      {/* 제목 */}
      <h1 className="text-2xl font-bold text-[#3e312b] mb-6">📸 갤러리</h1>

      {/* 이미지 리스트 */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`사진 ${i + 1}`}
              className="w-full h-auto rounded-xl shadow object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-10">등록된 사진이 없습니다.</p>
      )}

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => router.back()}
          className="bg-[#d36b6b] hover:bg-[#c85c5c] text-white font-semibold py-2 px-6 rounded-full"
        >
          ← 돌아가기
        </button>
        <label className={`bg-[#f0f0f0] hover:bg-[#e4e4e4] cursor-pointer text-[#3e312b] font-medium py-2 px-6 rounded-full shadow ${images.length >= 10 ? 'opacity-50 pointer-events-none' : ''}`}>
          📤 이미지 업로드
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={images.length >= 10}
          />
        </label>
      </div>

      {/* 토스트용 애니메이션 */}
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
        .animate-fadeInOut {
          animation: fadeInOut 2s ease-in-out;
        }
      `}</style>
    </div>
  );
}