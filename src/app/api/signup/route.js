import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const { email, password, nickname, profile_image_url } = await request.json();

  const { data: sessionData } = await supabase.auth.getSession();
  console.log('현재 세션:', sessionData);

  // 비밀번호 해싱
  const password_hash = await bcrypt.hash(password, 10);
  console.log(password_hash);
  console.log(await supabase.auth.getUser());
  // tb_users에 insert
  const { data, error } = await supabase
    .from('tb_users')
    .insert([
      {
        email,
        password_hash,
        nickname,
        profile_image_url,
      },
    ])
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ user: data[0] }), { status: 201 });
} 