'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function InvitePage() {
  const [current, setCurrent] = useState(0);
  const [guestbook, setGuestbook] = useState([]);
  const [form, setForm] = useState({ name: '', message: '', password: '' });
  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState('');

  const images = [
    `/images/wedding-1.png`,
    `/images/wedding-2.png`,
    `/images/wedding-3.png`,
  ];

  const nextSlide = () => setCurrent((current + 1) % images.length);
  const prevSlide = () => setCurrent((current - 1 + images.length) % images.length);

  const fetchGuestbook = async () => {
    const { data } = await supabase
      .from('guestbook')
      .select('*')
      .order('timestamp', { ascending: false });
    setGuestbook(data);
  };

  useEffect(() => {
    fetchGuestbook();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    await supabase.from('guestbook').insert([
      {
        name: form.name,
        message: form.message,
        password: form.password || null,
        timestamp: new Date().toISOString(),
      },
    ]);
    setForm({ name: '', message: '', password: '' });
    fetchGuestbook();
  };

  const handleDelete = async (id, inputPassword) => {
    const { data } = await supabase.from('guestbook').select('password').eq('id', id).single();
    if (data?.password !== inputPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    await supabase.from('guestbook').delete().eq('id', id);
    fetchGuestbook();
  };

  const handleEdit = async (id, inputPassword) => {
    const { data } = await supabase.from('guestbook').select('password').eq('id', id).single();
    if (data?.password !== inputPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    setEditId(id);
    const entry = guestbook.find((g) => g.id === id);
    setEditMessage(entry.message);
  };

  const handleEditSubmit = async () => {
    await supabase.from('guestbook').update({ message: editMessage }).eq('id', editId);
    setEditId(null);
    setEditMessage('');
    fetchGuestbook();
  };

  return (
    <div className="min-h-screen bg-[#fefdfb] text-[#4a3f35] font-[\'Noto Serif KR\'] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden pb-10">
        <div className="w-full h-64 bg-cover bg-center" style={{ backgroundImage: `url(/images/wedding.jpg)` }} />
        <div className="px-6 pt-8 text-center">
          <h1 className="text-3xl font-bold text-[#3e312b] tracking-wide mb-3">저희 결혼합니다</h1>
          <p className="text-base text-[#5e5147] mb-1">2025년 12월 13일 (토)</p>
          <p className="text-base text-[#a09283] mb-6">인덕원 성당</p>
          <p className="text-base leading-relaxed whitespace-pre-line text-[#6b5e51] mb-6">
            서로가 마주 보던 두 사람이 이제 함께 같은 곳을 바라보며
            새로운 시작을 하려 합니다.lo
            바쁘시더라도 오셔서 따뜻한 격려와 축복을 부탁드립니다.
          </p>
          <p className="text-lg font-semibold mb-6">신랑 봉봉 & 신부 나랭</p>



          
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[#3e312b] mb-4">📍 오시는 길</h2>
            <div className="rounded-xl overflow-hidden border">
              <img src="/images/location-map.png" alt="오시는 길 지도" className="w-full" />
            </div>
            <div className="flex justify-center gap-4 my-4">
              <a
                href="https://map.kakao.com/link/map/천주교인덕원성당,37.392608,126.976933"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-[#fbe9e7] text-[#d36b6b] font-semibold px-3 py-1 rounded-full border border-[#f4c6c3]"
              >
                카카오 지도
              </a>

            </div>

            <div className="text-left text-sm text-[#5e5147] space-y-1">
                <p><strong>인덕원 성당</strong></p>
                <p>경기 안양시 동안구 인덕원로 41</p>
                <p>031-345-3456</p>
                <p className="mt-2">🚌 버스: 일반 6, 9, 11 / 마을버스 6-1 / 인덕원역 하차</p>
                <p>🚗 자가용: 인덕원역 사거리에서 성당 방향 200m</p>
                <p>🚇 지하철: 4호선 인덕원역 8번 출구 도보 3분</p>
                <p>🅿 주차: 성당 내외 주차장 이용 가능 (선착순)</p>
                <p>🍽 피로연: 성당 지하 2층 연회실</p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[#3e312b] mb-4">📸 갤러리</h2>
            <div className="relative w-full overflow-hidden rounded-xl shadow">
              <img src={images[current]} alt={`갤러리 ${current + 1}`} className="w-full" />
              <button onClick={prevSlide} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full px-2">◀</button>
              <button onClick={nextSlide} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full px-2">▶</button>
            </div>
          </div>
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[#3e312b] mb-4">💌 마음 전하기</h2>
            <p className="text-sm text-center text-[#5e5147] mb-4">축복의 의미로 축의금을 전달해보세요.</p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('100020003000');
                  const toast = document.createElement('div');
                  toast.innerText = '신랑 측 계좌번호가 복사되었습니다.';
                  toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#3e312b] text-white px-4 py-2 rounded shadow z-50 animate-fadeInOut';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2000);
                }}
                className="w-64 bg-white border border-gray-300 text-[#3e312b] rounded-full py-2 font-medium shadow-sm hover:bg-gray-50"
              >
                신랑 측 계좌번호
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('200030004000');
                  const toast = document.createElement('div');
                  toast.innerText = '신부 측 계좌번호가 복사되었습니다.';
                  toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#3e312b] text-white px-4 py-2 rounded shadow z-50 animate-fadeInOut';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2000);
                }}
                className="w-64 bg-white border border-gray-300 text-[#3e312b] rounded-full py-2 font-medium shadow-sm hover:bg-gray-50"
              >
                신부 측 계좌번호
              </button>
            </div>
          </div>
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[#3e312b] mb-4">💬 방명록</h2>
            <form onSubmit={handleSubmit} className="text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4a3f35]">이름</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} type="text" placeholder="이름을 입력해주세요" className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4a3f35]">메시지</label>
                <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="축하 메시지를 남겨주세요" className="w-full p-2 border border-gray-300 rounded"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4a3f35]">비밀번호 (삭제/수정용)</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="선택 입력" className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <button type="submit" className="bg-[#d36b6b] hover:bg-[#c85c5c] text-white font-bold py-2 px-4 rounded-full">남기기</button>
            </form>

            <ul className="mt-6 space-y-2 text-left">
              {guestbook.map((entry) => (
                <li key={entry.id} className="p-3 border rounded-xl bg-[#fefaf7]">
                  <div className="flex justify-between">
                    <strong>{entry.name}</strong>
                    <div className="space-x-1">
                      <button onClick={() => {
                        const pwd = prompt('삭제 비밀번호를 입력하세요');
                        if (pwd) handleDelete(entry.id, pwd);
                      }} className="text-sm text-red-600">삭제</button>
                      <button onClick={() => {
                        const pwd = prompt('수정 비밀번호를 입력하세요');
                        if (pwd) handleEdit(entry.id, pwd);
                      }} className="text-sm text-blue-600">수정</button>
                    </div>
                  </div>
                  {editId === entry.id ? (
                    <div className="mt-2">
                      <textarea className="w-full border p-2 mb-2" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} />
                      <button onClick={handleEditSubmit} className="bg-blue-500 text-white py-1 px-3 rounded">저장</button>
                    </div>
                  ) : (
                    <p>{entry.message}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}