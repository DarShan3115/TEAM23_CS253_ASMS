import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Send, ThumbsUp, MessageSquare, 
  Lock, Users, BadgeCheck, Info
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export default function DiscussionPortalPage() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const isFaculty = user.role === 'faculty';

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8080/api/v1/discussions', {
        course_id: "CS101-ALGO",
        content: newPost,
        is_anonymous: isFaculty ? false : isAnon // Faculty forced to non-anon
      }, {
        headers: { 
          'x-auth-token': token,
          'x-user-id': user.id 
        }
      });
      
      setPosts([{ ...res.data, author_name: isFaculty ? `${user.first_name} ${user.last_name}` : (isAnon ? 'Anonymous' : 'Me'), role: user.role }, ...posts]);
      setNewPost("");
    } catch (err) {
      console.error("Post failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <ShieldCheck className="text-indigo-500" size={32} />
              Discussion Portal
            </h1>
            <p className="text-gray-400 mt-1">Safe space for academic collaboration.</p>
          </div>
        </header>

        {/* Composer */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-6 space-y-4">
          <textarea 
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px]"
          />
          <div className="flex items-center justify-between">
            {isFaculty ? (
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold bg-blue-400/10 px-3 py-2 rounded-xl border border-blue-400/20">
                <BadgeCheck size={14} /> Official Faculty Response
              </div>
            ) : (
              <button 
                onClick={() => setIsAnon(!isAnon)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isAnon ? 'bg-indigo-600/10 text-indigo-400' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {isAnon ? <Lock size={14} /> : <Users size={14} />}
                {isAnon ? 'Anonymous Mode' : 'Public Profile'}
              </button>
            )}
            <button onClick={handlePost} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-black flex items-center gap-2">
              Post {loading ? '...' : <Send size={16} />}
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border transition-all ${post.role === 'faculty' ? 'bg-blue-600/5 border-blue-500/30' : 'bg-gray-800/20 border-gray-700/50'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${post.role === 'faculty' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {post.role === 'faculty' ? 'F' : '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-white">{post.author_name}</p>
                      {post.role === 'faculty' && <BadgeCheck size={14} className="text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Today</p>
                  </div>
                </div>
                {post.role === 'faculty' && <span className="text-[10px] font-black text-blue-400 uppercase bg-blue-400/10 px-2 py-0.5 rounded">Faculty</span>}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}