import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  ThumbsUp,
  ArrowRight,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { KnowledgeArticle } from '../types';

export const KnowledgeBasePage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { currentUser, canPublishKB } = useAuth();
  const { showToast } = useNotifications();

  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => storageService.getKnowledgeArticles());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // New / Edit Article Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Returns and Refunds');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<'Draft' | 'Published'>('Published');

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setArticles(storageService.getKnowledgeArticles());
    });
    return unsubscribe;
  }, []);

  const categories = Array.from(new Set(articles.map((a) => a.category)));

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && art.status !== selectedStatus) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const mTitle = art.title.toLowerCase().includes(q);
        const mSummary = art.summary.toLowerCase().includes(q);
        const mTags = art.tags.some((t) => t.toLowerCase().includes(q));
        if (!mTitle && !mSummary && !mTags) return false;
      }
      return true;
    });
  }, [articles, searchTerm, selectedCategory, selectedStatus]);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormSummary('');
    setFormContent('# New Article Title\n\n### Overview\nDescribe organizational standard here...\n\n### Procedure\n1. Step one\n2. Step two');
    setFormCategory('Returns and Refunds');
    setFormTags('policy, procedures');
    setFormStatus('Published');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (art: KnowledgeArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticle(art);
    setFormTitle(art.title);
    setFormSummary(art.summary);
    setFormContent(art.content);
    setFormCategory(art.category);
    setFormTags(art.tags.join(', '));
    setFormStatus(art.status === 'Archived' ? 'Draft' : art.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this knowledge base article?')) {
      storageService.deleteArticle(id, currentUser || { id: 'admin', name: 'Admin', email: '', role: 'admin', avatar: '', status: 'active' });
      showToast('Article deleted', 'info');
    }
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    const tagsArray = formTags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingArticle) {
      storageService.updateArticle(
        editingArticle.id,
        {
          title: formTitle,
          summary: formSummary,
          content: formContent,
          category: formCategory,
          tags: tagsArray,
          status: formStatus,
        },
        currentUser || { id: 'admin', name: 'Admin', email: '', role: 'admin', avatar: '', status: 'active' }
      );
      showToast('Article updated successfully', 'success');
    } else {
      storageService.createArticle(
        {
          title: formTitle,
          summary: formSummary,
          content: formContent,
          category: formCategory,
          tags: tagsArray,
          status: formStatus,
          authorId: currentUser?.id || 'admin',
          authorName: currentUser?.name || 'Operations Lead',
        },
        currentUser || { id: 'admin', name: 'Admin', email: '', role: 'admin', avatar: '', status: 'active' }
      );
      showToast('New knowledge article created', 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Knowledge Base</h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative operational policies and troubleshooting guides powering support agents and the grounded AI Assistant.
          </p>
        </div>

        {canPublishKB && (
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={handleOpenCreate}>
            New Article
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles by title, keywords, or tags..."
            className="w-full text-xs py-1 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published ({articles.filter((a) => a.status === 'Published').length})</option>
            <option value="Draft">Draft ({articles.filter((a) => a.status === 'Draft').length})</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="No Knowledge Articles Found"
          description={searchTerm ? `No articles matching "${searchTerm}". Try adjusting your filters.` : 'No published policies in this category.'}
          actionText={canPublishKB ? 'Create First Article' : undefined}
          onAction={canPublishKB ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => navigate(`/knowledge-base/${art.id}`)}
              className="bg-white p-5 rounded-xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Lead directly with category kicker and status indicator (Anti-Slop Zero-Pill) */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-indigo-600 text-[11px] uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span
                    className={`text-[10px] font-medium ${
                      art.status === 'Published'
                        ? 'text-emerald-700'
                        : art.status === 'Draft'
                        ? 'text-amber-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {art.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              {/* Clean unboxed footer metadata */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono tabular-nums">{art.views}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono tabular-nums">{art.helpfulCount}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {canPublishKB && (
                    <button
                      onClick={(e) => handleOpenEdit(art, e)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canPublishKB && (
                    <button
                      onClick={(e) => handleDelete(art.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? 'Edit Knowledge Article' : 'Create Knowledge Article'}
        description="Published articles serve as authorized grounding context for the AI Assistant."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveArticle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Article Title *</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Refund & Return Policy Guidelines"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Returns and Refunds">Returns and Refunds</option>
                <option value="Order and Delivery">Order and Delivery</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Account Access">Account Access</option>
                <option value="Billing">Billing</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Published">Published (Authoritative for AI)</option>
                <option value="Draft">Draft (Internal Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Summary *</label>
            <input
              type="text"
              value={formSummary}
              onChange={(e) => setFormSummary(e.target.value)}
              placeholder="1-2 sentence synopsis used for search indexing..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Article Body (Markdown) *</label>
            <textarea
              rows={8}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="# Article Header\n\nInclude rules, policies, error codes, and step-by-step procedures..."
              className="w-full text-xs p-3 font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="refund, return, policy, 30 days"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingArticle ? 'Save Changes' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
