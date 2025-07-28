"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [likeState, setLikeState] = useState(null); // 'like', 'dislike', null
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  // 게시글, 댓글, 추천/비추천 불러오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const posts = JSON.parse(localStorage.getItem("posts") || "[]");
      const found = posts.find((p) => String(p.id) === String(id));
      setPost(found);
      const allComments = JSON.parse(localStorage.getItem("comments") || "{}");
      setComments(allComments[id] || []);
      // 추천/비추천
      const votes = JSON.parse(localStorage.getItem("votes") || "{}");
      setLikes(votes[id]?.likes || found?.likes || 0);
      setDislikes(votes[id]?.dislikes || 0);
      setLikeState(localStorage.getItem(`vote_${id}`));
    }
  }, [id]);

  // 댓글 등록
  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("댓글을 입력해주세요.");
      return;
    }
    const newComment = {
      id: Date.now(),
      content: comment,
      author: "익명",
      date: new Date().toISOString().slice(0, 10),
    };
    const allComments = JSON.parse(localStorage.getItem("comments") || "{}");
    const updated = {
      ...allComments,
      [id]: [newComment, ...(allComments[id] || [])],
    };
    localStorage.setItem("comments", JSON.stringify(updated));
    setComments(updated[id]);
    setComment("");
    setError("");
  };

  // 댓글 삭제
  const handleDelete = (cid) => {
    const allComments = JSON.parse(localStorage.getItem("comments") || "{}");
    const updatedList = (allComments[id] || []).filter((c) => c.id !== cid);
    const updated = { ...allComments, [id]: updatedList };
    localStorage.setItem("comments", JSON.stringify(updated));
    setComments(updatedList);
  };

  // 댓글 수정 시작
  const handleEditStart = (cid, content) => {
    setEditingId(cid);
    setEditingContent(content);
  };

  // 댓글 수정 저장
  const handleEditSave = (cid) => {
    if (!editingContent.trim()) {
      setError("수정할 내용을 입력해주세요.");
      return;
    }
    const allComments = JSON.parse(localStorage.getItem("comments") || "{}");
    const updatedList = (allComments[id] || []).map((c) =>
      c.id === cid ? { ...c, content: editingContent } : c
    );
    const updated = { ...allComments, [id]: updatedList };
    localStorage.setItem("comments", JSON.stringify(updated));
    setComments(updatedList);
    setEditingId(null);
    setEditingContent("");
    setError("");
  };

  // 추천/비추천 처리
  const handleVote = (type) => {
    if (likeState) return; // 이미 투표함
    const votes = JSON.parse(localStorage.getItem("votes") || "{}");
    const postVotes = votes[id] || { likes: post?.likes || 0, dislikes: 0 };
    if (type === "like") {
      postVotes.likes += 1;
      setLikes(postVotes.likes);
      setLikeState("like");
      localStorage.setItem(`vote_${id}`, "like");
    } else {
      postVotes.dislikes += 1;
      setDislikes(postVotes.dislikes);
      setLikeState("dislike");
      localStorage.setItem(`vote_${id}`, "dislike");
    }
    localStorage.setItem("votes", JSON.stringify({ ...votes, [id]: postVotes }));
    // 게시글의 likes도 동기화
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    const updatedPosts = posts.map((p) =>
      String(p.id) === String(id)
        ? { ...p, likes: postVotes.likes }
        : p
    );
    localStorage.setItem("posts", JSON.stringify(updatedPosts));
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">존재하지 않는 게시글입니다.</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 상단바 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="text-blue-600 font-semibold">← 뒤로</button>
        <h1 className="text-lg font-bold text-gray-900">게시글</h1>
        <div />
      </header>
      {/* 게시글 내용 */}
      <main className="max-w-xl mx-auto mt-6 px-2">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{post.category}</span>
            <span className="text-xs text-gray-400">{post.date}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
          <div className="text-sm text-gray-500 mb-4">by {post.author}</div>
          <div className="text-gray-800 whitespace-pre-line mb-2">{post.content}</div>
          {/* 추천/비추천 버튼 */}
          <div className="flex gap-4 mt-4">
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded-full border shadow-sm text-blue-600 font-semibold transition ${likeState ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-50"}`}
              onClick={() => handleVote("like")}
              disabled={!!likeState}
            >
              👍 추천 <span className="text-blue-700">{likes}</span>
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded-full border shadow-sm text-red-500 font-semibold transition ${likeState ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50"}`}
              onClick={() => handleVote("dislike")}
              disabled={!!likeState}
            >
              👎 비추천 <span className="text-red-600">{dislikes}</span>
            </button>
          </div>
        </div>
        {/* 댓글 목록 */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">댓글</h3>
          {comments.length === 0 && (
            <div className="text-gray-400 text-sm mb-2">아직 댓글이 없습니다.</div>
          )}
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="bg-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{c.author}</span>
                  <span className="text-xs text-gray-400">{c.date}</span>
                </div>
                {editingId === c.id ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <textarea
                      className="w-full rounded-lg border-gray-200 bg-white p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 min-h-[40px] resize-none"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      maxLength={300}
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-blue-600 text-white rounded-lg px-3 py-1 text-sm font-semibold hover:bg-blue-700 transition"
                        onClick={() => handleEditSave(c.id)}
                        type="button"
                      >저장</button>
                      <button
                        className="bg-gray-300 text-gray-700 rounded-lg px-3 py-1 text-sm font-semibold hover:bg-gray-400 transition"
                        onClick={() => { setEditingId(null); setEditingContent(""); }}
                        type="button"
                      >취소</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-gray-800 text-sm whitespace-pre-line flex-1">{c.content}</div>
                    <div className="flex gap-1 ml-2">
                      <button
                        className="text-xs text-blue-600 hover:underline px-1"
                        onClick={() => handleEditStart(c.id, c.content)}
                        type="button"
                      >수정</button>
                      <button
                        className="text-xs text-red-500 hover:underline px-1"
                        onClick={() => handleDelete(c.id)}
                        type="button"
                      >삭제</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
        {/* 댓글 작성 */}
        <form onSubmit={handleComment} className="flex flex-col gap-2">
          <textarea
            className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            maxLength={300}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold shadow hover:bg-blue-700 transition"
          >
            댓글 등록
          </button>
        </form>
      </main>
    </div>
  );
} 