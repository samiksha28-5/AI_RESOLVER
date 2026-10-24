import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { KnowledgeArticle } from '../types';

interface ArticleDetailPageProps {
  articleId: string;
  navigate: (path: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ articleId, navigate }) => {
  const { currentUser, canPublishKB } = useAuth();
  const { showToast } = useNotifications();

  const [article, setArticle] = useState<KnowledgeArticle | undefined>(() =>
    storageService.getArticleById(articleId)
  );
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setArticle(storageService.getArticleById(articleId));
    });
    return unsubscribe;
  }, [articleId]);

  if (!article) {
    return (
      <div className="py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Article Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested article ID "{articleId}" does not exist in the knowledge repository.
        </p>
        <Button size="sm" onClick={() => navigate('/knowledge-base')}>
          Back to Knowledge Base
        </Button>
      </div>
    );
  }

  // Find related tickets matching this category
  const relatedTickets = storageService
    .getTickets()
    .filter((t) => t.category === article.category)
    .slice(0, 4);

  const handleVoteHelpful = () => {
    if (hasVotedHelpful) return;
    setHasVotedHelpful(true);
    storageService.updateArticle(
      article.id,
      { helpfulCount: article.helpfulCount + 1 },
      currentUser || { id: 'user', name: 'User', email: '', role: 'agent', avatar: '', status: 'active' }
    );
    showToast('Thank you for your feedback!', 'success');
  };

  const handleStatusToggle = (newStatus: 'Published' | 'Draft' | 'Archived') => {
    storageService.updateArticle(
      article.id,
      { status: newStatus },
      currentUser || { id: 'admin', name: 'Admin', email: '', role: 'admin', avatar: '', status: 'active' }
    );
    showToast(`Article status changed to ${newStatus}`, 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/knowledge-base')}
          className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        {canPublishKB && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={article.status}
              onChange={(e) => handleStatusToggle(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        )}
      </div>

      {/* Article Container */}
      <Card>
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            {/* Zero-Pill Unboxed Category Kicker */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {article.category}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  article.status === 'Published'
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {article.status}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{article.title}</h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{article.summary}</p>

            {/* Unboxed Metadata with Typographic Separators */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center space-x-1 text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.authorName}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Updated <span className="font-mono tabular-nums">{new Date(article.updatedAt).toLocaleDateString()}</span></span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{article.views}</span>
                <span>views</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center space-x-1 text-emerald-700">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{article.helpfulCount}</span>
                <span>helpful</span>
              </div>
            </div>
          </div>

          {/* Article Markdown Render */}
          <div className="space-y-4 text-slate-800 leading-relaxed text-xs">
            {article.content.split('\n\n').map((block, idx) => {
              if (block.startsWith('# ')) {
                return (
                  <h2 key={idx} className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1.5 mt-6 first:mt-0">
                    {block.replace('# ', '')}
                  </h2>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-sm font-bold text-slate-800 mt-4">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('```')) {
                const code = block.replace(/```[a-z]*\n?/g, '');
                return (
                  <pre key={idx} className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono">
                    <code>{code}</code>
                  </pre>
                );
              }
              if (block.startsWith('- ') || block.startsWith('1. ')) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                    {block.split('\n').map((item, itemIdx) => (
                      <li key={itemIdx}>{item.replace(/^[-*0-9.]+\s*/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {block}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex items-center space-x-2 text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {article.tags.map((t) => (
                  <span key={t} className="font-mono text-[11px] text-slate-500">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Helpful Feedback Box */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">Was this article helpful to your inquiry?</span>
            <button
              onClick={handleVoteHelpful}
              disabled={hasVotedHelpful}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                hasVotedHelpful
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{hasVotedHelpful ? 'Marked Helpful' : 'Yes, Helpful'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Related Tickets */}
      {relatedTickets.length > 0 && (
        <Card>
          <CardHeader
            title="Active Tickets in this Category"
            subtitle={`Recent support cases tagged with ${article.category}`}
          />
          <CardContent className="divide-y divide-slate-100 p-0">
            {relatedTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/tickets/${t.ticketRef}`)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="truncate mr-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono tabular-nums text-xs font-semibold text-slate-900">
                      {t.ticketRef}
                    </span>
                    <span className="text-xs font-medium text-slate-800 truncate">{t.subject}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                    <span>{t.customerName}</span>
                    <span>·</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
