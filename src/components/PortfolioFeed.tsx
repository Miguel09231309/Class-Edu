import React, { useState } from 'react';
import { User, PortfolioItem, UserRole } from '../types';
import { getStoredPortfolios, setStoredPortfolios, getStoredAudits, setStoredAudits } from '../data/mockData';
import { MessageSquare, Heart, Calendar, Filter, Send, FolderClosed, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PortfolioFeedProps {
  currentUser: User;
}

export default function PortfolioFeed({ currentUser }: PortfolioFeedProps) {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(getStoredPortfolios());
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [likesState, setLikesState] = useState<Record<string, number>>({
    'port1': 14,
    'port2': 8
  });

  const handleAddCommentToFeedItem = (itemId: string, text: string) => {
    if (!text.trim()) return;

    const updated = portfolios.map(p => {
      if (p.id === itemId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: 'com_' + Date.now(),
              userName: currentUser.name,
              role: currentUser.role,
              text,
              date: new Date().toISOString()
            }
          ]
        };
      }
      return p;
    });

    setPortfolios(updated);
    setStoredPortfolios(updated);

    // Audit log
    const targetItem = portfolios.find(p => p.id === itemId);
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Comentário Feed',
      target: targetItem ? targetItem.title : 'Portfólio Escolar',
      timestamp: new Date().toISOString(),
      details: `${currentUser.name} comentou no portfólio de ${targetItem?.studentName}.`
    });
    setStoredAudits(audits);
  };

  const handleLikeItem = (itemId: string) => {
    setLikesState(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleDeleteItem = (itemId: string, title: string) => {
    if (window.confirm(`Deseja realmente remover o trabalho "${title}" do feed?`)) {
      const updated = portfolios.filter(p => p.id !== itemId);
      setPortfolios(updated);
      setStoredPortfolios(updated);
    }
  };

  // Extract unique students for filtering
  const allStudentNames = Array.from(new Set(portfolios.map(p => p.studentName)));

  const filteredPortfolios = selectedSubjectFilter === 'all' 
    ? portfolios 
    : portfolios.filter(p => p.studentName === selectedSubjectFilter);

  return (
    <div className="space-y-6 p-1 sm:p-4 max-w-7xl mx-auto" id="portfolio-feed-container">
      
      {/* Feed Header and filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Galeria de Portfólios Escolares</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Veja conquistas, maquetes, relatórios e artes compartilhadas pelos estudantes.</p>
        </div>

        {/* Filter widget */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            id="portfolio-student-filter"
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Filtrar por Aluno: Todos</option>
            {allStudentNames.map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPortfolios.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
            <FolderClosed className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold">Nenhum portfólio cadastrado ou correspondente ao filtro.</p>
          </div>
        ) : (
          filteredPortfolios.map((item) => {
            const commentFeedInputId = `feed-comment-input-${item.id}`;
            const likesCount = likesState[item.id] || 0;

            return (
              <div key={item.id} id={`feed-portfolio-card-${item.id}`} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group">
                <div>
                  {/* Media Visual Header */}
                  <div className="h-52 overflow-hidden relative bg-slate-950">
                    <img 
                      src={item.mediaUrl} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90" 
                      alt={item.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    
                    <span className="absolute top-4 left-4 px-3 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black rounded-full uppercase tracking-wider">
                      {item.mediaType}
                    </span>
                  </div>

                  {/* Body textual Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{item.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">•</span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(item.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Delete button only if user is Teacher */}
                      {currentUser.role === 'teacher' && (
                        <button
                          id={`btn-delete-feed-portfolio-${item.id}`}
                          onClick={() => handleDeleteItem(item.id, item.title)}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                          title="Remover do Feed"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 mt-1 leading-tight">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed h-12 line-clamp-3">{item.description}</p>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-4">
                      <button
                        id={`btn-like-portfolio-${item.id}`}
                        onClick={() => handleLikeItem(item.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                        <span>Reconhecer ({likesCount})</span>
                      </button>

                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                        <MessageSquare className="h-4 w-4" /> Feedback ({item.comments.length})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer commentary list */}
                <div className="bg-slate-50/50 border-t border-slate-100 p-6 space-y-4">
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                    {item.comments.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">Nenhum comentário adicionado ainda. Escreva uma mensagem abaixo!</p>
                    ) : (
                      item.comments.map((com) => (
                        <div key={com.id} className="text-[11px] bg-white p-3 rounded-2xl border border-slate-100/60 shadow-sm space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">{com.userName}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                              com.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {com.role === 'teacher' ? 'Docente' : 'Responsável'}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{com.text}</p>
                          <p className="text-[8px] text-slate-400 text-right">{new Date(com.date).toLocaleDateString('pt-BR')} às {new Date(com.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment writer Form */}
                  <div className="pt-2 border-t border-slate-100">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = document.getElementById(commentFeedInputId) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          handleAddCommentToFeedItem(item.id, input.value);
                          input.value = '';
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        id={commentFeedInputId}
                        type="text"
                        placeholder="Escreva seu parecer ou elogio..."
                        className="flex-1 text-xs py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                      <button
                        id={`btn-send-feed-comment-${item.id}`}
                        type="submit"
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
