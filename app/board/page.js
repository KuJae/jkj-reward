"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

// 임시 게시글 데이터
const initialPosts = [
  {
    id: 1,
    title: "비트코인 반등 신호!",
    author: "satoshi",
    date: "2024-06-01",
    category: "코인",
    comments: 3,
    likes: 12,
  },
  {
    id: 2,
    title: "삼성전자 2분기 실적 전망",
    author: "stockking",
    date: "2024-06-02",
    category: "주식",
    comments: 1,
    likes: 7,
  },
];

export default function BoardPage() {
  const [posts, setPosts] = useState(initialPosts);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("posts");
      if (saved) {
        setPosts(JSON.parse(saved));
      }
    }
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 상단바 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">게시판</h1>
        <Link href="/board/new" className="text-blue-600 font-semibold hover:underline">글쓰기</Link>
      </header>
      {/* 게시글 목록 */}
      <main className="max-w-xl mx-auto mt-6 space-y-4 px-2">
        {posts.map((post) => (
          <Link
            href={`/board/${post.id}`}
            key={post.id}
            className="block bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                {post.category}
              </span>
              <span className="text-xs text-gray-400">{post.date}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 truncate mb-1">{post.title}</h2>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>by {post.author}</span>
              <span>💬 {post.comments} · 👍 {post.likes}</span>
            </div>
          </Link>
        ))}
      </main>
      {/* 플로팅 글쓰기 버튼 (모바일용) */}
      <Link
        href="/board/new"
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center text-2xl hover:bg-blue-700 transition md:hidden"
        aria-label="글쓰기"
      >
        +
      </Link>
    </div>
  );
} 