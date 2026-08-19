'use client';
import { useState, useEffect } from 'react';
import { Send, Smile, Trash2 } from 'lucide-react';
import { Comment, Task } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import api from '@/lib/api';

interface CommentSectionProps {
  taskId: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function CommentItem({ comment, allComments, onReply, taskId, onDelete }: {
  comment: Comment; allComments: Comment[]; onReply: (parentId: string, parentAuthor: string) => void; taskId: string; onDelete?: (id: string) => void;
}) {
  const { user } = useAuth();
  const replies = allComments.filter(c => c.parentComment === comment._id);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: replyText.trim(), parentComment: comment._id });
      setReplyText('');
      setShowReplyBox(false);
    } catch { } finally { setSubmitting(false); }
  };

  const initial = comment.author?.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        {/* Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent)', color: 'var(--accent-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, overflow: 'hidden',
        }}>
          {comment.author?.avatar
            ? <img src={comment.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initial}
        </div>

        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{comment.author?.fullName}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(comment.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn-icon" style={{ padding: 3 }}><Smile size={13} /></button>
              {onDelete && <button className="btn-icon" style={{ padding: 3, color: '#ef4444' }} onClick={() => onDelete(comment._id)}><Trash2 size={13} /></button>}
            </div>
          </div>

          {/* Content */}
          <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.5 }}>{comment.content}</p>

          {/* Reply button */}
          <button
            style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setShowReplyBox(s => !s)}
          >
            Reply
          </button>

          {/* Nested replies */}
          {replies.length > 0 && (
            <div style={{ marginTop: 10, paddingLeft: 0 }}>
              {replies.map(reply => (
                <CommentItem key={reply._id} comment={reply} allComments={allComments} onReply={onReply} taskId={taskId} />
              ))}
            </div>
          )}

          {/* Reply input */}
          {showReplyBox && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Leave a reply..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)' }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                autoFocus
              />
              <button className="btn-icon" onClick={handleReply} disabled={submitting || !replyText.trim()} style={{ color: 'var(--accent)' }}>
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      setComments(res.data.data);
    } catch { }
  };

  useEffect(() => { fetchComments(); }, [taskId]);

  useSocket({
    onCommentCreated: ({ taskId: tid, comment }) => {
      if (tid === taskId) setComments(prev => [...prev, comment]);
    },
  });

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: newComment.trim() });
      setNewComment('');
    } catch { } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments(prev => prev.filter(c => c._id !== id && c.parentComment !== id));
    } catch { }
  };

  const topLevelComments = comments.filter(c => !c.parentComment);
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div>
      {/* Comments list */}
      {topLevelComments.map(comment => (
        <CommentItem
          key={comment._id}
          comment={comment}
          allComments={comments}
          onReply={() => { }}
          taskId={taskId}
          onDelete={handleDelete}
        />
      ))}

      {/* New comment input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginTop: 12,
        padding: '10px 14px', background: 'var(--surface-2)',
        borderRadius: 8, border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)',
          color: 'var(--accent-text)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {user?.avatar
            ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : initial}
        </div>
        <input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)' }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
        />
        <button className="btn-icon" onClick={handleSubmit} disabled={submitting || !newComment.trim()} style={{ color: 'var(--accent)' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
