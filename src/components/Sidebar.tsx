import React from 'react';
import { User, UserRole } from '../types';
import { BookOpen, Users, Star, Award, Shield, Video, LogOut, RefreshCw, FolderHeart, Activity } from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onChangeRole: (newRole: UserRole) => void;
}

export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout, onChangeRole }: SidebarProps) {
  
  // Return different menus based on user role
  const getMenuItems = () => {
    switch (currentUser.role) {
      case 'teacher':
        return [
          { id: 'rooms', label: 'Minhas Salas', icon: BookOpen },
          { id: 'gamification', label: 'Gamificação (Pontos)', icon: Star },
          { id: 'portfolios', label: 'Portfólios Digitais', icon: FolderHeart },
          { id: 'invitations', label: 'Convites e Links', icon: Users },
          { id: 'audit-logs', label: 'Auditoria de Ações', icon: Shield },
        ];
      case 'student':
        return [
          { id: 'rooms', label: 'Minhas Salas', icon: BookOpen },
          { id: 'gamification', label: 'Meus Pontos', icon: Award },
          { id: 'portfolios', label: 'Meu Portfólio', icon: FolderHeart },
        ];
      case 'parent':
        return [
          { id: 'gamification', label: 'Pontos do Filho', icon: Star },
          { id: 'portfolios', label: 'Portfólio do Filho', icon: FolderHeart },
          { id: 'rooms', label: 'Aulas Ativas', icon: Video },
        ];
      case 'admin':
        return [
          { id: 'school-stats', label: 'Estatísticas da Escola', icon: Activity },
          { id: 'rooms', label: 'Salas Criadas', icon: BookOpen },
          { id: 'presence-logs', label: 'Logs de Presença', icon: Users },
          { id: 'audit-logs', label: 'Logs de Auditoria', icon: Shield },
        ];
      case 'visitor':
        return [
          { id: 'rooms', label: 'Sala Atual', icon: BookOpen },
        ];
      default:
        return [];
    }
  };

  const getRoleBadgeColor = () => {
    switch (currentUser.role) {
      case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'student': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'parent': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'visitor': return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'teacher': return 'Professor';
      case 'student': return 'Estudante';
      case 'parent': return 'Responsável';
      case 'admin': return 'Administrador';
      case 'visitor': return 'Visitante';
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0" id="app-sidebar">
      <div>
        {/* Logo and Brand */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Edu<span className="text-blue-600">Call</span>
          </span>
        </div>

        {/* Profile Card */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-sm"
              alt={currentUser.name}
              onError={(e) => {
                // Failback avatar
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full border ${getRoleBadgeColor()}`}>
                {getRoleLabel()}
              </span>
            </div>
          </div>
          {currentUser.role === 'student' && currentUser.points !== undefined && (
            <div className="mt-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Seus Pontos:</span>
              <span className="text-sm font-black text-amber-600 flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {currentUser.points}
              </span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer & Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 transition-all group"
        >
          <span className="flex items-center gap-3">
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500" />
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}
