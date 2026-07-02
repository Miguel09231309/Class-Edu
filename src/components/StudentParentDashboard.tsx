import React, { useState, useEffect } from 'react';
import { User, Room, PortfolioItem, PointTransaction, AuditLog } from '../types';
import GamificationCenter from './GamificationCenter';
import { 
  getStoredRooms, 
  getStoredPortfolios, setStoredPortfolios,
  getStoredPoints,
  getStoredUsers, setStoredUsers,
  getStoredAudits, setStoredAudits
} from '../data/mockData';
import { 
  Award, Star, BookOpen, Video, FolderPlus, MessageSquare, 
  Clock, CheckCircle, Flame, Calendar, Paperclip, Send 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentParentDashboardProps {
  currentUser: User;
  onJoinCall: (room: Room) => void;
  activeTab: string;
  onUpdateUser?: (user: User) => void;
}

export default function StudentParentDashboard({ currentUser, onJoinCall, activeTab, onUpdateUser }: StudentParentDashboardProps) {
  // Pull persistent states
  const [rooms, setRooms] = useState<Room[]>(getStoredRooms());
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(getStoredPortfolios());

  useEffect(() => {
    setRooms(getStoredRooms());
  }, [activeTab]);
  const [points] = useState<PointTransaction[]>(getStoredPoints());
  const [users, setUsers] = useState<User[]>(getStoredUsers());

  // Portfolio Submission Form
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [workTitle, setWorkTitle] = useState('');
  const [workDesc, setWorkDesc] = useState('');
  const [workType, setWorkType] = useState<'image' | 'document' | 'video'>('image');
  const [selectedPresetImage, setSelectedPresetImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400');

  // Parents' specific: who is their child?
  // Let's resolve the child based on parent name (e.g., Mariana Silva is parent of Gabriel Silva, Carlos Costa is parent of Ana Costa)
  const getChildUser = (): User => {
    if (currentUser.role === 'parent') {
      if (currentUser.name.includes('Silva')) {
        return users.find(u => u.name === 'Gabriel Silva') || users[2]; // Gabriel
      } else {
        return users.find(u => u.name === 'Ana Costa') || users[3]; // Ana
      }
    }
    return currentUser;
  };

  const activeStudent = getChildUser();

  // Filter content specific to the active student (self or child)
  const studentPoints = points.filter(p => p.studentId === activeStudent.id);
  const studentPortfolio = portfolios.filter(p => p.studentId === activeStudent.id);

  // Student portfolio presets
  const presets = [
    { name: 'Ciências / Ecologia', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400' },
    { name: 'Artes / Pintura', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400' },
    { name: 'Física / Óptica', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=400' },
    { name: 'Matemática / Prática', url: 'https://images.unsplash.com/photo-1453733190148-c44698c265f8?auto=format&fit=crop&q=80&w=400' }
  ];

  const handlePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle.trim() || !workDesc.trim()) return;

    const newItem: PortfolioItem = {
      id: 'port_' + Date.now(),
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      title: workTitle,
      description: workDesc,
      mediaType: workType,
      mediaUrl: selectedPresetImage,
      comments: [],
      date: new Date().toISOString()
    };

    const updated = [newItem, ...portfolios];
    setPortfolios(updated);
    setStoredPortfolios(updated);

    // Audit Log
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Envio de Portfólio',
      target: workTitle,
      timestamp: new Date().toISOString(),
      details: `Estudante ${activeStudent.name} submeteu novo trabalho: ${workTitle}.`
    });
    setStoredAudits(audits);

    // Reset
    setWorkTitle('');
    setWorkDesc('');
    setIsSubmitOpen(false);
  };

  const handleAddComment = (portfolioId: string, commentText: string) => {
    if (!commentText.trim()) return;

    const updated = portfolios.map(p => {
      if (p.id === portfolioId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: 'com_' + Date.now(),
              userName: currentUser.name,
              role: currentUser.role,
              text: commentText,
              date: new Date().toISOString()
            }
          ]
        };
      }
      return p;
    });

    setPortfolios(updated);
    setStoredPortfolios(updated);

    // Audit Log
    const targetItem = portfolios.find(p => p.id === portfolioId);
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Comentário em Portfólio',
      target: targetItem ? targetItem.title : 'Trabalho Escolar',
      timestamp: new Date().toISOString(),
      details: `${currentUser.name} fez um comentário no portfólio de ${activeStudent.name}.`
    });
    setStoredAudits(audits);
  };

  // Get dynamic badges based on score
  const getBadgeRank = (score: number) => {
    if (score >= 200) return { title: 'Lenda Escolar', desc: 'Acima de 200 pontos de participação', color: 'bg-amber-500 text-white border-amber-600' };
    if (score >= 150) return { title: 'Destaque de Ouro', desc: 'Acima de 150 pontos', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (score >= 100) return { title: 'Estudante Ativo', desc: 'Acima de 100 pontos', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { title: 'Iniciante', desc: 'Até 100 pontos', color: 'bg-slate-100 text-slate-700 border-slate-300' };
  };

  const badgeRank = getBadgeRank(activeStudent.points || 0);

  return (
    <div className="space-y-8 p-1 sm:p-4 max-w-7xl mx-auto" id="student-parent-dashboard">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl"></div>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentUser.role === 'parent' 
                ? `Acompanhamento de: ${activeStudent.name}` 
                : 'Área do Aluno'}
            </h1>
            {currentUser.role === 'parent' && (
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                Familiar Vinculado
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualização de desempenho acadêmico, notas, portfólios e canais de chamada síncronos.
          </p>
        </div>

        {currentUser.role === 'student' && activeTab === 'portfolios' && (
          <button
            id="btn-open-submit-portfolio"
            onClick={() => setIsSubmitOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" /> Enviar Trabalho
          </button>
        )}
      </div>

      {/* MINHAS SALAS / LIVE CLASSES TAB */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" /> Grade de Matérias e Aulas Ao Vivo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              // We'll simulate a live call state! If the room has an active call, student can click "Entrar na Aula".
              // Let's assume Matemática (r1) has an active class sychronous right now for live testing!
              const isCallActive = room.id === 'r1';

              return (
                <div 
                  key={room.id}
                  id={`student-room-${room.id}`} 
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {room.subject}
                      </span>
                      {isCallActive && (
                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> AO VIVO AGORA
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{room.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Professor: {room.teacherName}</p>
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2">{room.description}</p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Código: <strong>{room.joinCode}</strong></span>
                    
                    {isCallActive ? (
                      <button
                        id={`btn-join-call-${room.id}`}
                        onClick={() => onJoinCall(room)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-red-500/10 animate-pulse cursor-pointer"
                      >
                        <Video className="h-3.5 w-3.5" /> Entrar na Aula
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Sob Agendamento
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MEUS PONTOS / GAMIFICATION TAB */}
      {activeTab === 'gamification' && (
        <GamificationCenter currentUser={currentUser} onUpdateUser={onUpdateUser} />
      )}

      {/* MEU PORTFOLIO TAB */}
      {activeTab === 'portfolios' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-emerald-500" /> Portfólio de Trabalhos Multimídia ({studentPortfolio.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {studentPortfolio.length === 0 ? (
              <div className="md:col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
                <Paperclip className="h-10 w-10 text-slate-300 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-bold">Nenhum trabalho submetido</p>
                {currentUser.role === 'student' && (
                  <button
                    id="btn-first-portfolio-submit"
                    onClick={() => setIsSubmitOpen(true)}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Enviar Meu Primeiro Trabalho
                  </button>
                )}
              </div>
            ) : (
              studentPortfolio.map((item) => {
                const commentInputId = `comment-input-${item.id}`;
                return (
                  <div key={item.id} id={`portfolio-card-${item.id}`} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group">
                    <div>
                      {/* Image Preview */}
                      <div className="h-48 overflow-hidden relative bg-slate-900">
                        <img 
                          src={item.mediaUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                          alt="" 
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase">
                          {item.mediaType}
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="p-6">
                        <span className="text-[10px] text-slate-400 font-semibold">{new Date(item.date).toLocaleDateString('pt-BR')} às {new Date(item.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        <h3 className="text-base font-black text-slate-900 mt-1">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Comments list */}
                    <div className="bg-slate-50/50 border-t border-slate-100 p-6 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> Comentários e Feedbacks ({item.comments.length})
                      </h4>

                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {item.comments.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">Sem comentários ou notas de avaliação ainda.</p>
                        ) : (
                          item.comments.map((com) => (
                            <div key={com.id} className="text-[11px] bg-white p-3 rounded-2xl border border-slate-100/60 shadow-sm space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900">{com.userName}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                                  com.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {com.role === 'teacher' ? 'Prof' : 'Mãe/Pai'}
                                </span>
                              </div>
                              <p className="text-slate-600 leading-relaxed">{com.text}</p>
                              <p className="text-[8px] text-slate-400 text-right">{new Date(com.date).toLocaleDateString('pt-BR')} às {new Date(com.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment Form (For Parents to support, or general comment typing) */}
                      <div className="pt-2 border-t border-slate-100">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const input = document.getElementById(commentInputId) as HTMLInputElement;
                            if (input && input.value.trim()) {
                              handleAddComment(item.id, input.value);
                              input.value = '';
                            }
                          }}
                          className="flex gap-2"
                        >
                          <input
                            id={commentInputId}
                            type="text"
                            placeholder="Escreva um comentário de incentivo..."
                            className="flex-1 text-xs py-1.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                          <button
                            id={`btn-send-comment-${item.id}`}
                            type="submit"
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer"
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
      )}

      {/* PORTFOLIO SUBMISSION DIALOG */}
      <AnimatePresence>
        {isSubmitOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="modal-submit-portfolio">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSubmitOpen(false)}></div>
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 border border-slate-100 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600"></div>

                <div className="mb-5">
                  <h3 className="text-base font-bold text-slate-900">Anexar Trabalho ao Portfólio</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Selecione uma imagem presetada de demonstração ou preencha as descrições de sua tarefa escolar.</p>
                </div>

                <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Título do Trabalho</label>
                    <input
                      id="work-title-input"
                      type="text"
                      required
                      value={workTitle}
                      onChange={(e) => setWorkTitle(e.target.value)}
                      placeholder="Ex: Maquete das Placas Tectônicas"
                      className="block w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Descrição da Atividade</label>
                    <textarea
                      id="work-desc-input"
                      required
                      value={workDesc}
                      onChange={(e) => setWorkDesc(e.target.value)}
                      placeholder="Explique o que você fez, materiais utilizados e o aprendizado..."
                      rows={3}
                      className="block w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Formato de Mídia</label>
                      <select
                        id="work-type-input"
                        value={workType}
                        onChange={(e) => setWorkType(e.target.value as any)}
                        className="block w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                      >
                        <option value="image">Foto / Imagem</option>
                        <option value="document">PDF / Documento</option>
                        <option value="video">Vídeo gravado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Preset de Imagem Demonstrativa</label>
                    <div className="grid grid-cols-2 gap-2">
                      {presets.map((pre, index) => (
                        <button
                          key={index}
                          id={`preset-btn-${index}`}
                          type="button"
                          onClick={() => setSelectedPresetImage(pre.url)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                            selectedPresetImage === pre.url 
                              ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800' 
                              : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <img src={pre.url} className="w-8 h-8 rounded-lg object-cover" alt="" />
                          <span className="text-[10px] font-bold truncate">{pre.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      id="btn-cancel-portfolio-submit"
                      type="button"
                      onClick={() => setIsSubmitOpen(false)}
                      className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-semibold text-xs"
                    >
                      Voltar
                    </button>
                    <button
                      id="btn-save-portfolio"
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                    >
                      Enviar para Portfólio
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
