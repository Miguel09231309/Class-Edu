import React, { useState, useEffect } from 'react';
import { User, Room, UserRole } from './types';
import { getStoredUsers, setStoredUsers } from './data/mockData';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import TeacherDashboard from './components/TeacherDashboard';
import StudentParentDashboard from './components/StudentParentDashboard';
import AdminDashboard from './components/AdminDashboard';
import PortfolioFeed from './components/PortfolioFeed';
import VirtualRoom from './components/VirtualRoom';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRoomCall, setActiveRoomCall] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<string>('rooms');
  const [targetRoomParam, setTargetRoomParam] = useState<string | undefined>(undefined);

  // Check on load if the URL contains a direct room invite parameter (e.g., ?room=r1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || params.get('join');
    if (roomParam) {
      setTargetRoomParam(roomParam);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Set role-default active tabs
    if (user.role === 'admin') {
      setActiveTab('school-stats');
    } else if (user.role === 'parent') {
      setActiveTab('gamification');
    } else {
      setActiveTab('rooms');
    }
  };

  const handleJoinAsVisitor = (visitorName: string, targetRoomId: string) => {
    const visitorUser: User = {
      id: 'vis_' + Date.now(),
      name: `${visitorName} (Visitante)`,
      email: 'visitante@escola.edu.br',
      role: 'visitor',
      verified: false
    };

    setCurrentUser(visitorUser);
    setActiveTab('rooms');

    // Automatically trigger entrance to virtual room
    const dummyRoom: Room = {
      id: targetRoomId,
      name: targetRoomId === 'r1' ? 'Matemática - 3º Ano B' : targetRoomId === 'r2' ? 'Ciências - 1º Ano A' : 'Aula Síncrona Especial',
      type: 'temporary',
      capacity: 20,
      joinCode: 'VISITOR',
      description: 'Ingressando via canal de convite de visitante.',
      subject: 'Geral',
      teacherName: 'Prof. Alexandre Souza'
    };
    setActiveRoomCall(dummyRoom);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveRoomCall(null);
    setActiveTab('rooms');
  };

  // Simulated Role Switch in real-time sandbox
  const handleRoleSwitch = (newRole: UserRole) => {
    if (!currentUser) return;
    const allUsers = getStoredUsers();
    const foundUser = allUsers.find(u => u.role === newRole);
    
    if (foundUser) {
      setCurrentUser(foundUser);
      if (newRole === 'admin') {
        setActiveTab('school-stats');
      } else if (newRole === 'parent') {
        setActiveTab('gamification');
      } else {
        setActiveTab('rooms');
      }
    } else {
      // Create temporary fallback role
      const tempUser: User = {
        id: 'tmp_' + Date.now(),
        name: `Simulação ${newRole}`,
        email: `sim.${newRole}@escola.edu.br`,
        role: newRole,
        verified: true,
        points: newRole === 'student' ? 120 : undefined,
        grade: newRole === 'student' ? '3º Ano B' : undefined,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${newRole}`
      };
      setCurrentUser(tempUser);
      if (newRole === 'admin') {
        setActiveTab('school-stats');
      } else if (newRole === 'parent') {
        setActiveTab('gamification');
      } else {
        setActiveTab('rooms');
      }
    }
  };

  // Render correct main view depending on logged user role and selected active tab
  const renderMainContent = () => {
    if (!currentUser) return null;

    if (currentUser.role === 'teacher') {
      if (activeTab === 'portfolios') {
        return <PortfolioFeed currentUser={currentUser} />;
      }
      if (activeTab === 'audit-logs') {
        return <AdminDashboard currentUser={currentUser} activeTab="audit-logs" />;
      }
      return (
        <TeacherDashboard 
          currentUser={currentUser} 
          onStartCall={(room) => setActiveRoomCall(room)} 
          activeTab={activeTab} 
          onUpdateUser={setCurrentUser}
        />
      );
    }

    if (currentUser.role === 'student') {
      return (
        <StudentParentDashboard 
          currentUser={currentUser} 
          onJoinCall={(room) => setActiveRoomCall(room)} 
          activeTab={activeTab} 
          onUpdateUser={setCurrentUser}
        />
      );
    }

    if (currentUser.role === 'parent') {
      if (activeTab === 'portfolios') {
        return <PortfolioFeed currentUser={currentUser} />;
      }
      return (
        <StudentParentDashboard 
          currentUser={currentUser} 
          onJoinCall={(room) => setActiveRoomCall(room)} 
          activeTab={activeTab} 
          onUpdateUser={setCurrentUser}
        />
      );
    }

    if (currentUser.role === 'admin') {
      return (
        <AdminDashboard 
          currentUser={currentUser} 
          activeTab={activeTab} 
        />
      );
    }

    if (currentUser.role === 'visitor') {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-md space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Modo Visitante Ativo</h2>
            <p className="text-sm text-slate-500">Você está conectado como visitante. Para usufruir de portfólios, gamificação e criação de turmas, crie uma conta gratuita.</p>
            {activeRoomCall ? (
              <button
                id="btn-rejoin-visitor-call"
                onClick={() => setActiveRoomCall(activeRoomCall)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Voltar para Chamada
              </button>
            ) : (
              <button
                id="btn-exit-visitor"
                onClick={handleLogout}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Sair / Cadastrar Conta
              </button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // 1. If not logged in, render authentication / onboarding
  if (!currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={handleLoginSuccess} 
        onJoinAsVisitor={handleJoinAsVisitor}
        targetRoomId={targetRoomParam || 'r1'} // Pre-fill with param or fallback default
      />
    );
  }

  // 2. If in virtual call session, render full screen WebRTC meeting room
  if (activeRoomCall) {
    return (
      <VirtualRoom 
        room={activeRoomCall} 
        currentUser={currentUser} 
        onLeave={() => setActiveRoomCall(null)} 
      />
    );
  }

  // 3. Otherwise, render standard single-screen hub with sidebar & panel content
  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans overflow-hidden" id="main-shell">
      {/* Sidebar navigation */}
      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        onChangeRole={handleRoleSwitch}
      />

      {/* Main viewport */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50/50">
        {renderMainContent()}
      </main>
    </div>
  );
}
