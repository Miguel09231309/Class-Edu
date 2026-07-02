import React, { useState, useEffect } from 'react';
import { User, Room, PresenceLog, AuditLog } from '../types';
import { 
  getStoredRooms, setStoredRooms,
  getStoredUsers, 
  getStoredPresence, setStoredPresence, 
  getStoredAudits, setStoredAudits 
} from '../data/mockData';
import { Shield, Users, BookOpen, Clock, Activity, Calendar, Search, Filter, Plus, Trash } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  currentUser: User;
  activeTab: string;
}

export default function AdminDashboard({ currentUser, activeTab }: AdminDashboardProps) {
  // Pull states
  const [rooms, setRooms] = useState<Room[]>(getStoredRooms());
  const [users] = useState<User[]>(getStoredUsers());

  // Safe UI modal states for iframe compatibility
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showClearLogsConfirm, setShowClearLogsConfirm] = useState(false);

  useEffect(() => {
    setRooms(getStoredRooms());
  }, [activeTab]);

  const [presence, setPresence] = useState<PresenceLog[]>(getStoredPresence());
  const [audits, setAudits] = useState<AuditLog[]>(getStoredAudits());

  const handleDeleteRoomClick = (roomId: string, name: string) => {
    setRoomToDelete({ id: roomId, name });
  };

  const confirmDeleteRoom = () => {
    if (!roomToDelete) return;
    const { id: roomId, name } = roomToDelete;
    const updated = rooms.filter(r => r.id !== roomId);
    setRooms(updated);
    setStoredRooms(updated);

    // Audit Log the attendance insert/delete
    const updatedAudits = [...audits];
    updatedAudits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Remoção de Sala',
      target: name,
      timestamp: new Date().toISOString(),
      details: `Sala "${name}" foi permanentemente removida pelo Administrador.`
    });
    setAudits(updatedAudits);
    setStoredAudits(updatedAudits);
    setRoomToDelete(null);
  };

  // Search and filter states
  const [presenceSearch, setPresenceSearch] = useState('');
  const [presenceFilter, setPresenceFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [auditSearch, setAuditSearch] = useState('');

  // Simulation state to add new logs manually for evaluation
  const [simName, setSimName] = useState('Renato Alves');
  const [simRoom, setSimRoom] = useState('Matemática - 3º Ano B');
  const [simStatus, setSimStatus] = useState<'present' | 'late' | 'absent'>('present');

  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  const handleSimulatePresence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName) return;

    const newLog: PresenceLog = {
      id: 'pr_' + Date.now(),
      studentName: simName,
      role: 'student',
      joinedAt: new Date().toISOString(),
      leftAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      roomName: simRoom,
      status: simStatus
    };

    const updated = [newLog, ...presence];
    setPresence(updated);
    setStoredPresence(updated);

    // Audit Log the attendance insert
    const updatedAudits = [...audits];
    updatedAudits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Simulação de Presença',
      target: `${simName} (${simStatus})`,
      timestamp: new Date().toISOString(),
      details: `Registro de presença inserido manualmente via painel do Administrador na sala ${simRoom}.`
    });
    setAudits(updatedAudits);
    setStoredAudits(updatedAudits);

    setSimName('');
  };

  const confirmClearLogs = () => {
    setPresence([]);
    setStoredPresence([]);
    const defaultAudits: AuditLog[] = [{
      id: 'aud_clear',
      operatorName: currentUser.name,
      operatorRole: 'admin',
      action: 'Limpeza de Logs',
      target: 'Banco de Dados Local',
      timestamp: new Date().toISOString(),
      details: 'Todos os logs de presença e auditoria passados foram limpos pelo administrador.'
    }];
    setAudits(defaultAudits);
    setStoredAudits(defaultAudits);
    setShowClearLogsConfirm(false);
  };

  // Filters
  const filteredPresence = presence.filter(p => {
    const matchesSearch = p.studentName.toLowerCase().includes(presenceSearch.toLowerCase()) || 
                          p.roomName.toLowerCase().includes(presenceSearch.toLowerCase());
    const matchesFilter = presenceFilter === 'all' || p.status === presenceFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredAudits = audits.filter(a => {
    return a.operatorName.toLowerCase().includes(auditSearch.toLowerCase()) || 
           a.action.toLowerCase().includes(auditSearch.toLowerCase()) || 
           a.target.toLowerCase().includes(auditSearch.toLowerCase());
  });

  return (
    <div className="space-y-8 p-1 sm:p-4 max-w-7xl mx-auto" id="admin-dashboard">
      
      {/* KPI METRIC CARDS */}
      {activeTab === 'school-stats' && (
        <div className="space-y-8">
          {/* Main banner */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen opacity-10 filter blur-3xl translate-x-12 -translate-y-12"></div>
            
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-500" /> Console de Administração Geral
              </h1>
              <p className="text-xs text-slate-400 mt-1">Status operacional da escola. Gerencie salas, fiscalize presenças e audite ações sensíveis em tempo real.</p>
            </div>
            
            <button
              id="btn-clear-database-logs"
              onClick={() => setShowClearLogsConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-red-900 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Trash className="h-4 w-4" /> Resetar Banco Local
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salas Criadas</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{rooms.length}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{rooms.filter(r => r.type === 'permanent').length} físicas, {rooms.filter(r => r.type === 'temporary').length} temporárias</p>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estudantes Ativos</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{students.length}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Pontuação média: ~150 estrelas</p>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professores Cadastrados</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{teachers.length}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Vínculo: 100% verificado</p>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logs de Auditoria</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{audits.length}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Registros rastreados</p>
              </div>
            </div>
          </div>

          {/* Quick Simulation Board */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1">🛠️ Simular Registro Rápido de Presença (Para Teste)</h3>
            <form onSubmit={handleSimulatePresence} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estudante</label>
                <input
                  id="sim-student-name"
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="Nome do aluno"
                  className="block w-full py-2 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sala de Aula</label>
                <select
                  id="sim-room-select"
                  value={simRoom}
                  onChange={(e) => setSimRoom(e.target.value)}
                  className="block w-full py-2 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status de Entrada</label>
                <select
                  id="sim-status-select"
                  value={simStatus}
                  onChange={(e) => setSimStatus(e.target.value as any)}
                  className="block w-full py-2 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="present">Presente (Pontual)</option>
                  <option value="late">Atrasado</option>
                  <option value="absent">Falta Justificada</option>
                </select>
              </div>

              <button
                id="btn-simulate-attendance"
                type="submit"
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Registrar Presença
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SALAS DA ESCOLA (Alternative subview) */}
      {activeTab === 'rooms' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Quadro Geral de Salas Criadas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Nome da Sala</th>
                  <th className="py-3 px-4">Matéria</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Capacidade</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Código de Acesso</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {rooms.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                    <td className="py-3 px-4">{r.subject}</td>
                    <td className="py-3 px-4">{r.teacherName}</td>
                    <td className="py-3 px-4">{r.capacity} Alunos</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        r.type === 'permanent' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {r.type === 'permanent' ? 'Permanente' : 'Temporária'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.joinCode}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteRoomClick(r.id, r.name)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer inline-flex items-center"
                        title="Excluir Turma"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOGS DE PRESENÇA TAB */}
      {activeTab === 'presence-logs' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Logs de Presença e Atividade de Chamada</h2>
              <p className="text-xs text-slate-400 mt-0.5">Acompanhe as conexões de estudantes nas salas e eventos virtuais.</p>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input
                  id="presence-search"
                  type="text"
                  placeholder="Pesquisar estudante ou sala..."
                  value={presenceSearch}
                  onChange={(e) => setPresenceSearch(e.target.value)}
                  className="pl-9 py-1.5 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 bg-slate-50/50"
                />
              </div>

              <select
                id="presence-filter"
                value={presenceFilter}
                onChange={(e) => setPresenceFilter(e.target.value as any)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
              >
                <option value="all">Todos os Status</option>
                <option value="present">Presente</option>
                <option value="late">Atrasado</option>
                <option value="absent">Ausente</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Estudante</th>
                  <th className="py-3 px-4">Papel</th>
                  <th className="py-3 px-4">Sala de Aula</th>
                  <th className="py-3 px-4">Horário de Ingresso</th>
                  <th className="py-3 px-4">Horário de Saída</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPresence.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">Nenhum registro de conexão coincide com a busca.</td>
                  </tr>
                ) : (
                  filteredPresence.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/30">
                      <td className="py-3 px-4 font-bold text-slate-950">{p.studentName}</td>
                      <td className="py-3 px-4 capitalize">{p.role}</td>
                      <td className="py-3 px-4">{p.roomName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{new Date(p.joinedAt).toLocaleTimeString('pt-BR')}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{p.leftAt ? new Date(p.leftAt).toLocaleTimeString('pt-BR') : 'Conectado'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.status === 'present' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : p.status === 'late' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {p.status === 'present' ? 'Presente' : p.status === 'late' ? 'Atraso' : 'Falta'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOGS DE AUDITORIA TAB */}
      {activeTab === 'audit-logs' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Histórico Geral de Auditoria Escolar</h2>
              <p className="text-xs text-slate-400 mt-0.5">Trilhas de auditoria imutáveis para ações críticas realizadas por professores e administradores.</p>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                id="audit-search"
                type="text"
                placeholder="Filtrar por operador, ação, alvo..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="pl-9 py-1.5 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredAudits.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhuma ação coincide com a busca.</p>
            ) : (
              filteredAudits.map((a) => (
                <div key={a.id} className="p-4 bg-slate-50/40 hover:bg-slate-50/80 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{a.operatorName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-slate-200 text-slate-700">
                        {a.operatorRole}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{a.action}</span>
                      <span className="text-slate-500 font-bold">({a.target})</span>
                    </div>
                    <p className="text-slate-500">{a.details}</p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {new Date(a.timestamp).toLocaleDateString('pt-BR')} às {new Date(a.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 font-mono">ID: {a.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Custom Confirmation Modals for Iframe Safety */}
      {roomToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="modal-delete-room-confirm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash className="h-6 w-6" />
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

      {showClearLogsConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="modal-clear-logs-confirm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Resetar Banco Local?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Isso irá apagar todos os logs de presença e logs de auditoria do armazenamento local para fins de teste. Tem certeza de que quer fazer isso?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearLogsConfirm(false)}
                className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmClearLogs}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Sim, Resetar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
