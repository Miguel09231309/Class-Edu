import React, { useState, useEffect } from 'react';
import { User, Room, Invitation, PointTransaction, AuditLog } from '../types';
import GamificationCenter from './GamificationCenter';
import { 
  getStoredRooms, setStoredRooms, 
  getStoredUsers, setStoredUsers, 
  getStoredInvitations, setStoredInvitations,
  getStoredPoints, setStoredPoints,
  getStoredAudits, setStoredAudits
} from '../data/mockData';
import { 
  Plus, Calendar, Users, Video, Award, Star, Mail, Link, QrCode, 
  Trash2, Send, Check, ExternalLink, MessageCircle, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeacherDashboardProps {
  currentUser: User;
  onStartCall: (room: Room) => void;
  activeTab: string;
  onUpdateUser?: (user: User) => void;
}

export default function TeacherDashboard({ currentUser, onStartCall, activeTab, onUpdateUser }: TeacherDashboardProps) {
  // State from LocalStorage
  const [rooms, setRooms] = useState<Room[]>(getStoredRooms());
  const [users, setUsers] = useState<User[]>(getStoredUsers());

  useEffect(() => {
    setRooms(getStoredRooms());
  }, [activeTab]);
  const [invitations, setInvitations] = useState<Invitation[]>(getStoredInvitations());
  const [points, setPoints] = useState<PointTransaction[]>(getStoredPoints());
  
  // Modal states
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedRoomForInvite, setSelectedRoomForInvite] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; name: string } | null>(null);

  // New room form state
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<'permanent' | 'temporary'>('permanent');
  const [roomSubject, setRoomSubject] = useState('Matemática');
  const [roomCapacity, setRoomCapacity] = useState(30);
  const [roomSchedule, setRoomSchedule] = useState('');
  const [roomDuration, setRoomDuration] = useState(60);
  const [roomDescription, setRoomDescription] = useState('');

  // New invitation form state
  const [inviteMethod, setInviteMethod] = useState<'link' | 'email' | 'qr'>('link');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRecipients, setInviteRecipients] = useState<string[]>([]);
  const [generatedInvite, setGeneratedInvite] = useState<Invitation | null>(null);

  // Gamification Point-Giver State (2-Tap)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [awardedPointsAmount, setAwardedPointsAmount] = useState<number>(10);
  const [pointCategory, setPointCategory] = useState<'participacao' | 'trabalho' | 'comportamento' | 'ajuda' | 'criatividade'>('participacao');
  const [pointReason, setPointReason] = useState('');
  const [showPointCelebration, setShowPointCelebration] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState('');

  const students = users.filter(u => u.role === 'student');

  // Trigger LocalStorage save whenever points, rooms, or invites change
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const code = roomName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 900 + 100);
    const newRoom: Room = {
      id: 'rm_' + Date.now(),
      name: roomName,
      type: roomType,
      capacity: Number(roomCapacity),
      scheduleDate: roomType === 'temporary' ? roomSchedule : undefined,
      durationMinutes: roomType === 'temporary' ? Number(roomDuration) : undefined,
      joinCode: code,
      description: roomDescription || `${roomSubject} para turmas escolares.`,
      subject: roomSubject,
      teacherName: currentUser.name
    };

    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    setStoredRooms(updatedRooms);

    // Add Audit Log
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Criação de Sala',
      target: roomName,
      timestamp: new Date().toISOString(),
      details: `Sala ${roomType === 'permanent' ? 'Permanente' : 'Temporária'} criada com código ${code}.`
    });
    setStoredAudits(audits);

    // Reset Form
    setRoomName('');
    setRoomDescription('');
    setIsCreateRoomOpen(false);
  };

  const openInviteModal = (room: Room) => {
    setSelectedRoomForInvite(room);
    setInviteMethod('link');
    setInviteEmail('');
    setInviteRecipients([]);
    setGeneratedInvite(null);
    setIsInviteOpen(true);
  };

  const handleGenerateInvite = () => {
    if (!selectedRoomForInvite) return;

    let code = '';
    if (inviteMethod === 'link') {
      code = `${window.location.origin}/room/${selectedRoomForInvite.id}`;
    } else if (inviteMethod === 'email') {
      if (!inviteEmail) return;
      code = `TOKEN_EM_${Math.floor(Math.random() * 90000 + 10000)}`;
      setInviteRecipients([inviteEmail]);
    } else {
      code = `QR_CODE_${selectedRoomForInvite.joinCode}`;
    }

    const newInvite: Invitation = {
      id: 'inv_' + Date.now(),
      roomId: selectedRoomForInvite.id,
      roomName: selectedRoomForInvite.name,
      method: inviteMethod,
      recipients: inviteMethod === 'email' ? [inviteEmail] : undefined,
      code,
      expiration: inviteMethod === 'link' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : 'Never',
      status: inviteMethod === 'email' ? 'pending' : 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedInvites = [newInvite, ...invitations];
    setInvitations(updatedInvites);
    setStoredInvitations(updatedInvites);

    // Log in audits
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Geração de Convite',
      target: selectedRoomForInvite.name,
      timestamp: new Date().toISOString(),
      details: `Convite tipo ${inviteMethod} gerado para a sala ${selectedRoomForInvite.name}.`
    });
    setStoredAudits(audits);

    setGeneratedInvite(newInvite);
    setInviteEmail('');
  };

  const handleDeleteRoomClick = (roomId: string, name: string) => {
    setRoomToDelete({ id: roomId, name });
  };

  const confirmDeleteRoom = () => {
    if (!roomToDelete) return;
    const { id: roomId, name } = roomToDelete;
    const updated = rooms.filter(r => r.id !== roomId);
    setRooms(updated);
    setStoredRooms(updated);

    // Audit log
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Remoção de Sala',
      target: name,
      timestamp: new Date().toISOString(),
      details: `Sala de ID ${roomId} foi permanentemente removida.`
    });
    setStoredAudits(audits);
    setRoomToDelete(null);
  };

  const handleDeleteInvite = (inviteId: string) => {
    const updated = invitations.filter(i => i.id !== inviteId);
    setInvitations(updated);
    setStoredInvitations(updated);
  };

  // Two-Tap gamification point giving action
  const handleAwardPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const pointsToAward = Number(awardedPointsAmount);
    const categoryLabels = {
      participacao: 'Participação Ativa',
      trabalho: 'Excelente Trabalho',
      comportamento: 'Bom Comportamento',
      ajuda: 'Ajuda ao Próximo',
      criatividade: 'Criatividade e Inovação'
    };

    // Update student's points in users state and LocalStorage
    const updatedUsers = users.map(u => {
      if (u.id === selectedStudent.id) {
        return { ...u, points: (u.points || 0) + pointsToAward };
      }
      return u;
    });
    setUsers(updatedUsers);
    setStoredUsers(updatedUsers);

    // Add Point Transaction
    const newTransaction: PointTransaction = {
      id: 'pt_' + Date.now(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      points: pointsToAward,
      category: pointCategory,
      reason: pointReason || `Pontuação em ${categoryLabels[pointCategory]}`,
      date: new Date().toISOString(),
      awardedBy: currentUser.name
    };
    const updatedPoints = [newTransaction, ...points];
    setPoints(updatedPoints);
    setStoredPoints(updatedPoints);

    // Log in audits
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Atribuição de Pontos',
      target: `${selectedStudent.name} (+${pointsToAward} pts)`,
      timestamp: new Date().toISOString(),
      details: `Atribuídos ${pointsToAward} pontos para ${selectedStudent.name}. Razão: ${newTransaction.reason}.`
    });
    setStoredAudits(audits);

    // Trigger floating celebration animation
    setCelebrationDetails(`+${pointsToAward} para ${selectedStudent.name}!`);
    setShowPointCelebration(true);
    setTimeout(() => {
      setShowPointCelebration(false);
    }, 2500);

    // Reset selections
    setSelectedStudent(null);
    setPointReason('');
  };

  return (
    <div className="space-y-8 p-1 sm:p-4 max-w-7xl mx-auto" id="teacher-dashboard">
      
      {/* Floating Star Point Celebration animation */}
      <AnimatePresence>
        {showPointCelebration && (
          <motion.div 
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1.1, opacity: 1, y: -100 }}
            exit={{ scale: 0.8, opacity: 0, y: -200 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-2xl py-4 px-8 rounded-full shadow-2xl border-4 border-white flex items-center gap-3 animate-pulse">
              <Star className="h-8 w-8 fill-white animate-spin" />
              <span>{celebrationDetails}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Painel de Controle Escolar</h1>
          <p className="text-sm text-slate-500 mt-1">Bem-vindo de volta, <strong>{currentUser.name}</strong>. Crie salas de aula e recompense a dedicação de seus alunos.</p>
        </div>
        <button
          id="btn-open-create-room"
          onClick={() => setIsCreateRoomOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Criar Sala de Aula
        </button>
      </div>

      {/* MINHAS SALAS / CLASSROOMS TAB */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Salas Ativas ({rooms.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div 
                key={room.id} 
                id={`room-card-${room.id}`}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all p-6 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Decorative visual card border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                      {room.subject}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      room.type === 'permanent' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                        : 'bg-amber-50 text-amber-800 border-amber-100'
                    }`}>
                      {room.type === 'permanent' ? 'Física / Permanente' : 'Virtual / Temporária'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{room.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Código: <span className="font-bold text-slate-700">{room.joinCode}</span></p>
                  
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 h-8">{room.description}</p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-300" /> Max: {room.capacity} alunos
                    </span>
                    {room.scheduleDate && (
                      <span className="flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(room.scheduleDate).toLocaleDateString('pt-BR')} {new Date(room.scheduleDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    <button
                      id={`btn-invite-room-${room.id}`}
                      onClick={() => openInviteModal(room)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                      title="Gerar Link ou Código de Convite"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-delete-room-${room.id}`}
                      onClick={() => handleDeleteRoomClick(room.id, room.name)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                      title="Excluir Turma"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    id={`btn-start-call-${room.id}`}
                    onClick={() => onStartCall(room)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Video className="h-3.5 w-3.5" /> Iniciar Aula
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GAMIFICATION & TWO-TAP POINT GIVER TAB */}
      {activeTab === 'gamification' && (
        <GamificationCenter currentUser={currentUser} onUpdateUser={onUpdateUser} />
      )}

      {/* CONVITES TAB */}
      {activeTab === 'invitations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: generate invitation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Gerador de Convites</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">1. Selecionar Sala de Aula</label>
                  <select
                    id="select-invite-room"
                    onChange={(e) => {
                      const roomObj = rooms.find(r => r.id === e.target.value);
                      if (roomObj) setSelectedRoomForInvite(roomObj);
                    }}
                    className="block w-full py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                    defaultValue={selectedRoomForInvite?.id || ''}
                  >
                    <option value="" disabled>Escolha uma sala...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Método de Envio/Ingresso</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'link', label: 'Link Único', icon: Link },
                      { id: 'email', label: 'Por E-mail', icon: Mail },
                      { id: 'qr', label: 'Código QR', icon: QrCode }
                    ].map((m) => {
                      const IconComp = m.icon;
                      return (
                        <button
                          key={m.id}
                          id={`invite-method-${m.id}`}
                          type="button"
                          onClick={() => setInviteMethod(m.id as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                            inviteMethod === m.id 
                              ? 'border-blue-600 bg-blue-50/40 text-blue-700' 
                              : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <IconComp className="h-4 w-4" />
                          <span className="text-[10px] font-bold">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {inviteMethod === 'email' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-mail do Destinatário</label>
                    <div className="flex gap-2">
                      <input
                        id="invite-email-input"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="ex: mae.gabriel@gmail.com"
                        className="flex-1 text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50"
                      />
                    </div>
                  </div>
                )}

                <button
                  id="btn-generate-invite"
                  onClick={handleGenerateInvite}
                  disabled={!selectedRoomForInvite}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" /> Gerar Convite
                </button>
              </div>

              {/* Show newly generated invite */}
              {generatedInvite && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3 animate-fadeIn" id="generated-invite-result">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <Check className="h-4 w-4 bg-emerald-500 text-white rounded-full p-0.5" /> Convite Gerado com Sucesso!
                  </div>
                  
                  {generatedInvite.method === 'link' && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-500">Compartilhe o link de ingresso rápido abaixo:</p>
                      <div className="flex gap-1.5 bg-white p-2 rounded-xl border border-emerald-100 text-[10px] font-mono text-slate-700 break-all select-all">
                        {generatedInvite.code}
                      </div>
                    </div>
                  )}

                  {generatedInvite.method === 'email' && (
                    <p className="text-[10px] text-slate-600">
                      Um token de convite seguro foi encaminhado para <strong>{generatedInvite.recipients?.[0]}</strong>. Ele poderá utilizá-lo para vincular sua conta ao aluno.
                    </p>
                  )}

                  {generatedInvite.method === 'qr' && (
                    <div className="text-center py-2 space-y-2">
                      <div className="inline-block p-2 bg-white rounded-xl border border-emerald-100">
                        <QrCode className="h-24 w-24 text-slate-800" />
                      </div>
                      <p className="text-[10px] text-slate-500">Código do QR: <strong>{generatedInvite.code}</strong></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Invitation log tracking list */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Rastreamento e Logs de Convites</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Total: {invitations.length}</span>
              </h2>

              <div className="space-y-4">
                {invitations.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Nenhum convite gerado ainda.</p>
                ) : (
                  invitations.map((inv) => (
                    <div key={inv.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 truncate">{inv.roomName}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold capitalize ${
                            inv.method === 'link' ? 'bg-blue-100 text-blue-800' : inv.method === 'email' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.method}
                          </span>
                        </div>
                        
                        {inv.method === 'email' && inv.recipients && (
                          <p className="text-slate-500 font-medium">Destinatário: {inv.recipients[0]}</p>
                        )}
                        <p className="text-slate-400 text-[10px] truncate mt-0.5 font-mono">Código/Token: {inv.code}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Expiração: {inv.expiration === 'Never' ? 'Permanente' : new Date(inv.expiration).toLocaleDateString('pt-BR')}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {inv.status === 'accepted' ? 'Aceito' : 'Pendente'}
                        </span>
                        
                        <button
                          id={`btn-delete-invite-${inv.id}`}
                          onClick={() => handleDeleteInvite(inv.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                          title="Revogar Convite"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CREATE ROOM INTERACTIVE MODAL */}
      <AnimatePresence>
        {isCreateRoomOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="modal-create-room">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateRoomOpen(false)}></div>
            
            {/* Modal Body */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 overflow-hidden border border-slate-100"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Nova Sala de Aula / Atividade</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure uma sala física permanente ou uma sessão temporária para aulas síncronas de vídeo.</p>
                </div>

                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nome da Sala / Turma</label>
                    <input
                      id="room-name-input"
                      type="text"
                      required
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Ex: Geografia Aplicada - 1º Ano B"
                      className="block w-full py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Matéria / Tópico</label>
                      <select
                        id="room-subject-input"
                        value={roomSubject}
                        onChange={(e) => setRoomSubject(e.target.value)}
                        className="block w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                      >
                        <option value="Matemática">Matemática</option>
                        <option value="Ciências">Ciências</option>
                        <option value="Geografia">Geografia</option>
                        <option value="Física">Física</option>
                        <option value="História">História</option>
                        <option value="Redação">Redação</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Capacidade Máxima</label>
                      <input
                        id="room-capacity-input"
                        type="number"
                        min="1"
                        max="100"
                        value={roomCapacity}
                        onChange={(e) => setRoomCapacity(Number(e.target.value))}
                        className="block w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tipo de Sala</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        id="type-permanent"
                        type="button"
                        onClick={() => setRoomType('permanent')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          roomType === 'permanent' 
                            ? 'border-blue-600 bg-blue-50/30 text-blue-700' 
                            : 'border-slate-100 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-xs font-bold">Permanente (Física)</span>
                        <span className="text-[10px] opacity-75">Grade semanal regular</span>
                      </button>

                      <button
                        id="type-temporary"
                        type="button"
                        onClick={() => setRoomType('temporary')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          roomType === 'temporary' 
                            ? 'border-blue-600 bg-blue-50/30 text-blue-700' 
                            : 'border-slate-100 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-xs font-bold">Temporária (Virtual)</span>
                        <span className="text-[10px] opacity-75">Atividade síncrona / Vídeo</span>
                      </button>
                    </div>
                  </div>

                  {roomType === 'temporary' && (
                    <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Agendamento (Data/Hora)</label>
                        <input
                          id="room-schedule-input"
                          type="datetime-local"
                          required
                          value={roomSchedule}
                          onChange={(e) => setRoomSchedule(e.target.value)}
                          className="block w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Duração (Minutos)</label>
                        <input
                          id="room-duration-input"
                          type="number"
                          min="15"
                          max="300"
                          value={roomDuration}
                          onChange={(e) => setRoomDuration(Number(e.target.value))}
                          className="block w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Descrição Curta</label>
                    <textarea
                      id="room-desc-input"
                      value={roomDescription}
                      onChange={(e) => setRoomDescription(e.target.value)}
                      placeholder="Indique os objetivos e materiais necessários..."
                      rows={3}
                      className="block w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50 text-xs font-medium"
                    />
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      id="btn-close-create-modal"
                      type="button"
                      onClick={() => setIsCreateRoomOpen(false)}
                      className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-semibold text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      id="btn-save-room"
                      type="submit"
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                    >
                      Salvar Sala
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* GENERATE INVITE IN-DASHBOARD MODAL (IF TRIGGERED DIRECTLY) */}
      <AnimatePresence>
        {isInviteOpen && selectedRoomForInvite && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="modal-quick-invite">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)}></div>
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 overflow-hidden border border-slate-100 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">Gerar Convite Rápido</h3>
                  <p className="text-xs text-slate-500 mt-1">Sala: <strong className="text-slate-700">{selectedRoomForInvite.name}</strong></p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Canal de Convite</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'link', label: 'Link' },
                        { id: 'email', label: 'E-mail' },
                        { id: 'qr', label: 'Código QR' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          id={`quick-invite-method-${m.id}`}
                          onClick={() => { setInviteMethod(m.id as any); setGeneratedInvite(null); }}
                          className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                            inviteMethod === m.id 
                              ? 'border-blue-600 bg-blue-50/40 text-blue-700' 
                              : 'border-slate-100 bg-slate-50 text-slate-600'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {inviteMethod === 'email' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Destinatário</label>
                      <input
                        id="quick-invite-email-input"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="mae@email.com ou aluno@email.com"
                        className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 bg-slate-50/50"
                      />
                    </div>
                  )}

                  <button
                    id="btn-quick-generate-invite"
                    onClick={handleGenerateInvite}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    Gerar e Visualizar Convite
                  </button>

                  {generatedInvite && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2 animate-fadeIn text-xs text-slate-700">
                      <p className="font-bold text-emerald-800 flex items-center gap-1"><Check className="h-4 w-4 bg-emerald-500 text-white rounded-full p-0.5" /> Convite Gerado!</p>
                      
                      {generatedInvite.method === 'link' && (
                        <div className="bg-white p-2 rounded-lg border border-emerald-100 font-mono text-[9px] break-all select-all">
                          {generatedInvite.code}
                        </div>
                      )}
                      {generatedInvite.method === 'email' && (
                        <p className="text-[10px]">Token enviado para: {generatedInvite.recipients?.[0]}</p>
                      )}
                      {generatedInvite.method === 'qr' && (
                        <div className="text-center py-1">
                          <QrCode className="h-20 w-20 text-slate-800 mx-auto" />
                          <p className="text-[9px] mt-1 font-bold">Código: {generatedInvite.code}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-right">
                  <button
                    id="btn-close-quick-invite"
                    onClick={() => setIsInviteOpen(false)}
                    className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Safe confirmation modal for deleting rooms in iframe environments */}
      {roomToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="modal-teacher-delete-room">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Excluir Turma?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tem certeza de que deseja remover permanentemente a sala <strong className="text-slate-800">"{roomToDelete.name}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoomToDelete(null)}
                className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteRoom}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
