'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CategorySidebar({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('tb_codes')
        .select('*')
        .eq('category', 1)
        .order('id', { ascending: true });
      if (error) {
        setError('카테고리 불러오기 실패');
      } else {
        setCategories(data);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-64 flex-shrink-0">
      <div className="border rounded-xl p-6">
        <div className="font-bold mb-4">카테고리</div>
        {loading && <div className="text-sm text-muted-foreground">로딩중...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        <ul className="space-y-2">
          <li
            className={`hover:bg-accent rounded-lg p-2 cursor-pointer ${!selectedCategory ? 'font-bold text-primary' : ''}`}
            onClick={() => onSelectCategory("")}
          >
            전체
          </li>
          {categories.map((cat) => (
            <li
              key={cat.id}
              className={`hover:bg-accent rounded-lg p-2 cursor-pointer ${selectedCategory == (cat.code?.toString() || cat.id.toString()) ? 'font-bold text-primary' : ''}`}
              onClick={() => onSelectCategory(cat.code?.toString() || cat.id.toString())}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 