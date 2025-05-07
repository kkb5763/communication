This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


create table 
-- 1. 회원정보 테이블
create table tb_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  nickname text not null,
  profile_image_url text,
  created_at timestamp with time zone default now()
);

-- 2. 커뮤니티 코드 테이블
create table tb_codes (
  id serial primary key,
  code text unique not null,
  name text not null,
  description text
);

-- 3. 게시글 테이블
create table tb_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references tb_users(id),
  community_id int references tb_comments(id),
  title text not null,
  content text not null,
  image_urls text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_deleted boolean default false
);

-- 4. 댓글 테이블
create table tb_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id),
  user_id uuid references users(id),
  content text not null,
  parent_id uuid references comments(id),
  created_at timestamp with time zone default now(),
  is_deleted boolean default false
);


==============================================================
-- RLS 활성화
alter table tb_users enable row level security;

-- 회원가입(INSERT)은 누구나 가능
create policy "Allow insert for anyone" on tb_users
for insert
with check (true);

-- 본인만 SELECT/UPDATE/DELETE 가능
create policy "Allow select for self" on tb_users
for select
using (id = auth.uid());

create policy "Allow update for self" on tb_users
for update
using (id = auth.uid());

create policy "Allow delete for self" on tb_users
for delete
using (id = auth.uid());
-------------------------------------------------------------

alter table tb_posts enable row level security;

-- 모든 사용자 SELECT 가능
create policy "Allow select for all" on tb_posts
for select
using (true);

-- 로그인한 사용자만 INSERT 가능
create policy "Allow insert for authenticated" on tb_posts
for insert
with check (auth.uid() is not null);

-- 본인만 UPDATE/DELETE 가능
create policy "Allow update for owner" on tb_posts
for update
using (user_id = auth.uid());

create policy "Allow delete for owner" on tb_posts
for delete
using (user_id = auth.uid());

alter table tb_comments enable row level security;

-- 모든 사용자 SELECT 가능
create policy "Allow select for all" on tb_comments
for select
using (true);

-- 로그인한 사용자만 INSERT 가능
create policy "Allow insert for authenticated" on tb_comments
for insert
with check (auth.uid() is not null);

-- 본인만 UPDATE/DELETE 가능
create policy "Allow update for owner" on tb_comments
for update
using (user_id = auth.uid());

create policy "Allow delete for owner" on tb_comments
for delete
using (user_id = auth.uid());