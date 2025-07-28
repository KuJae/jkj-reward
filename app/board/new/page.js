"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["주식", "코인", "자유"];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }
    // 기존 게시글 불러오기
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const newPost = {
      id: Date.now(),
      title,
      content,
      category,
      author: "익명",
      date: new Date().toISOString().slice(0, 10),
      comments: 0,
      likes: 0,
    };
    localStorage.setItem("posts", JSON.stringify([newPost, ...posts]));
    router.push("/board");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md border border-gray-100 space-y-4"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2">글쓰기</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
          <select
            className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            maxLength={1000}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold shadow hover:bg-blue-700 transition"
        >
          등록
        </button>
      </form>
    </div>
  );
} 