"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";

// 샘플 카테고리, 색상, 혜택, 가격 필터
const categories = [
  "생활/건강", "디지털/가전", "화장품/미용", "출산/육아", "여가/생활편의", "스포츠/레저", "패션잡화", "가구/인테리어", "식품", "패션의류"
];
const colors = [
  "#000000", "#ffffff", "#ff0000", "#ffa500", "#ffff00", "#008000", "#00bfff", "#0000ff", "#800080", "#ff69b4"
];
const benefits = ["빠른배송", "무료배송", "희망일배송", "정기구독", "무료교환반품", "핫딜", "카드할인", "쿠폰", "적립"];
const priceRanges = [
  { label: "4만원이하", min: 0, max: 40000 },
  { label: "4만원~8만원", min: 40000, max: 80000 },
  { label: "8만원~16만원", min: 80000, max: 160000 },
  { label: "16만원~32만원", min: 160000, max: 320000 },
  { label: "32만원이상", min: 320000, max: 99999999 },
];

// 샘플 상품 데이터
const products = [
  {
    id: 1,
    name: "픽스 코나 SX2 차량용 거치대 디스플레이 마운트",
    price: 17000,
    image: "/sample.png",
    discount: 5,
    originalPrice: 20500,
    benefit: ["쿠폰할인", "오늘출발"],
    color: "#000000",
    category: "디지털/가전",
    desc: "차량용 휴대폰 거치대, 360도 회전, 계기판 장착",
  },
  {
    id: 2,
    name: "에어컨 필터 클린플러스 항균 차량용 에어컨필터",
    price: 25900,
    image: "/sample.png",
    discount: 0,
    originalPrice: 24900,
    benefit: ["무료배송"],
    color: "#00bfff",
    category: "생활/건강",
    desc: "차량용 에어컨 필터, 항균, 탈취, 초미세먼지 차단",
  },
  {
    id: 3,
    name: "스마트워치 S9",
    price: 99000,
    image: "/sample.png",
    discount: 10,
    originalPrice: 110000,
    benefit: ["카드할인", "무료교환반품"],
    color: "#008000",
    category: "디지털/가전",
    desc: "건강관리, 피트니스, 알림, 방수 지원",
  },
];

export default function ProductsPage() {
  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedBenefit, setSelectedBenefit] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null);

  // 필터링된 상품
  const filtered = products.filter((p) => {
    return (
      (!selectedCategory || p.category === selectedCategory) &&
      (!selectedColor || p.color === selectedColor) &&
      (!selectedBenefit || p.benefit.includes(selectedBenefit)) &&
      (!selectedPrice || (p.price >= selectedPrice.min && p.price < selectedPrice.max))
    );
  });

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="border-b bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-800">상품 목록</h1>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" className="bg-white border-zinc-200 text-zinc-700 hover:bg-amber-100">홈으로</Button>
              </Link>
              <Link href="/products/new">
                <Button className="bg-amber-400 text-amber-900 hover:bg-amber-300 border-amber-200">상품 등록</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 필터 영역 */}
      <section className="border-b bg-amber-50 px-4 py-6">
        <div className="container mx-auto space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-semibold text-zinc-700">카테고리</span>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant="ghost"
                className={`border ${selectedCategory === cat ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-zinc-200 text-zinc-600 hover:bg-amber-50"}`}
                onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-semibold text-zinc-700">가격</span>
            {priceRanges.map((pr) => (
              <Button
                key={pr.label}
                size="sm"
                variant="ghost"
                className={`border ${selectedPrice === pr ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-zinc-200 text-zinc-600 hover:bg-amber-50"}`}
                onClick={() => setSelectedPrice(selectedPrice === pr ? null : pr)}
              >
                {pr.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-semibold text-zinc-700">배송/혜택</span>
            {benefits.map((b) => (
              <Button
                key={b}
                size="sm"
                variant="ghost"
                className={`border ${selectedBenefit === b ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-zinc-200 text-zinc-600 hover:bg-amber-50"}`}
                onClick={() => setSelectedBenefit(selectedBenefit === b ? "" : b)}
              >
                {b}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-zinc-700">색상</span>
            {colors.map((c) => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full border-2 ${selectedColor === c ? "border-amber-500 ring-2 ring-amber-200" : "border-zinc-200"}`}
                style={{ background: c }}
                onClick={() => setSelectedColor(selectedColor === c ? "" : c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 상품 리스트 */}
      <main className="container mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">조건에 맞는 상품이 없습니다.</div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((product) => (
              <div key={product.id} className="border rounded-lg bg-white shadow flex flex-col">
                <div className="aspect-[4/3] bg-amber-100 rounded-t-lg overflow-hidden flex items-center justify-center">
                  {/* 실제 서비스에서는 next/image 사용 및 상품 이미지 적용 */}
                  <img src={product.image} alt={product.name} className="object-contain h-40" />
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2 text-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                      {product.category}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
                        {product.discount}% 할인
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-lg line-clamp-2 min-h-[2.5em]">{product.name}</h2>
                  <div className="text-sm text-zinc-500 line-clamp-2 min-h-[2.5em]">{product.desc}</div>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-xl font-bold text-amber-900">{product.price.toLocaleString()}원</span>
                    {product.discount > 0 && (
                      <span className="line-through text-zinc-400 text-sm">{product.originalPrice.toLocaleString()}원</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.benefit.map((b) => (
                      <span key={b} className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1 bg-amber-400 text-amber-900 hover:bg-amber-300 border-amber-200">구매하기</Button>
                    <Button variant="outline" className="flex-1 border-zinc-200 text-zinc-700 hover:bg-amber-50">상세보기</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 