import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { getStoredUsers, setStoredUsers, getStoredRooms, setStoredRooms, getStoredAudits, setStoredAudits } from '../data/mockData';
import { Shield, BookOpen, User as UserIcon, Users, ArrowRight, CheckCircle2, Lock, Mail, Star, Key, School } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onJoinAsVisitor: (name: string, targetRoomId: string) => void;
  targetRoomId?: string;
}

export default function LoginScreen({ onLoginSuccess, onJoinAsVisitor, targetRoomId }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recover'>('login');
  const [role, setRole] = useState<UserRole>('teacher');
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Onboarding teacher wizard steps
  const [registerStep, setRegisterStep] = useState(1);
  const [isVerified, setIsVerified] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [schoolOption, setSchoolOption] = useState<'create' | 'join'>('create');
  const [firstClassName, setFirstClassName] = useState('');

  // Onboarding student state
  const [classCodeInput, setClassCodeInput] = useState('');
  const [parentName, setParentName] = useState('');

  // Onboarding parent state
  const [studentSearchName, setStudentSearchName] = useState('');

  // Visitor state
  const [visitorName, setVisitorName] = useState('');

  const users = getStoredUsers();

  const handleDemoLogin = (roleName: UserRole) => {
    setError('');
    setInfoMessage('');
    const found = users.find(u => u.role === roleName);
    if (found) {
      onLoginSuccess(found);
    } else {
      setError(`Nenhum usuário de demonstração encontrado para a função: ${roleName}`);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const lowerEmail = email.toLowerCase().trim();

    // Admin exclusive email restriction
    if (selectedRole === 'admin' && lowerEmail !== 'miguel.bespalhok.souza@escola.pr.gov.br') {
      setError('Acesso negado. Apenas o e-mail miguel.bespalhok.souza@escola.pr.gov.br pode acessar o painel de Administrador.');
      return;
    }

    // If they enter the admin email, we force them to log in as the admin Miguel
    if (lowerEmail === 'miguel.bespalhok.souza@escola.pr.gov.br') {
      const foundAdmin = users.find(u => u.email.toLowerCase() === 'miguel.bespalhok.souza@escola.pr.gov.br');
      if (foundAdmin) {
        onLoginSuccess(foundAdmin);
        return;
      }
    }

    let found = users.find(u => u.email.toLowerCase() === lowerEmail);
    if (!found) {
      // Auto-create simulated user so they never get locked out!
      const baseName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
      const capitalizedName = baseName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      found = {
        id: 'usr_' + Date.now(),
        name: capitalizedName || 'Usuário Novo',
        email,
        role: selectedRole,
        verified: true,
        points: selectedRole === 'student' ? 100 : undefined,
        grade: selectedRole === 'student' ? '3º Ano B' : undefined,
        avatarUrl: `https://images.unsplash.com/photo-${selectedRole === 'teacher' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&q=80&w=200`
      };
      const allUsers = [...users, found];
      setStoredUsers(allUsers);
    }
    onLoginSuccess(found);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Insira o seu e-mail cadastrado.');
      return;
    }
    setInfoMessage('Um link de recuperação de senha foi enviado para o seu e-mail!');
    setTimeout(() => {
      setActiveTab('login');
      setError('');
    }, 3000);
  };

  const startRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    if (role === 'admin' && email.toLowerCase().trim() !== 'miguel.bespalhok.souza@escola.pr.gov.br') {
      setError('Não é permitido cadastrar novas contas de Administrador. Apenas miguel.bespalhok.souza@escola.pr.gov.br possui esses privilégios.');
      return;
    }
    setRegisterStep(2); // Go to email verification step
  };

  const confirmEmailVerification = () => {
    setIsVerified(true);
    setRegisterStep(3); // Go to role-specific setup
  };

  const handleFinalRegister = () => {
    const allUsers = getStoredUsers();
    
    // Create new user
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email,
      role,
      schoolId: 'sc101',
      verified: true,
      points: role === 'student' ? 0 : undefined,
      grade: role === 'student' ? '3º Ano B' : undefined,
      avatarUrl: `https://images.unsplash.com/photo-${role === 'teacher' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&q=80&w=200`
    };

    allUsers.push(newUser);
    setStoredUsers(allUsers);

    // If teacher, create first room
    if (role === 'teacher' && firstClassName) {
      const allRooms = getStoredRooms();
      allRooms.push({
        id: 'rm_' + Date.now(),
        name: firstClassName,
        type: 'permanent',
        capacity: 30,
        joinCode: firstClassName.substring(0, 5).toUpperCase() + Math.floor(Math.random() * 10),
        description: 'Sala de aula inicial criada durante o cadastro de ' + name,
        subject: 'Geral',
        teacherName: name
      });
      setStoredRooms(allRooms);
    }

    // Add Audit Log
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: name,
      operatorRole: role,
      action: 'Cadastro de Usuário',
      target: name,
      timestamp: new Date().toISOString(),
      details: `Novo usuário registrado no papel de ${role}.`
    });
    setStoredAudits(audits);

    onLoginSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" id="login-container">
      {/* Background elegant circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center items-center gap-2 mb-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-md text-white">
            <BookOpen className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-950 font-sans">
            Edu<span className="text-blue-600">Call</span>
          </span>
        </div>
        <h2 className="text-xl font-medium text-slate-600 mb-8 px-4">
          Ambiente Integrado de Ensino, Chamadas e Reconhecimento
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0 relative z-10">
        
        {/* Centered Auth Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100 sm:px-10 flex flex-col justify-between">
          <div>
            {/* Tabs selection */}
            {activeTab !== 'recover' && registerStep === 1 && (
              <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  id="tab-login"
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Entrar na Conta
                </button>
                <button
                  id="tab-register"
                  onClick={() => { setActiveTab('register'); setError(''); }}
                  className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Criar Conta
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl" id="error-alert">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="p-4 mb-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm rounded-r-xl" id="success-alert">
                {infoMessage}
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5" id="form-login">
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Selecione seu Perfil para Acesso</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'teacher', label: 'Professor', icon: BookOpen },
                      { role: 'student', label: 'Estudante', icon: UserIcon },
                      { role: 'parent', label: 'Mãe / Pai', icon: Users },
                      { role: 'admin', label: 'Administração', icon: Shield }
                    ].map(opt => {
                      const IconOpt = opt.icon;
                      return (
                        <button
                          key={opt.role}
                          type="button"
                          onClick={() => {
                            setSelectedRole(opt.role as UserRole);
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            selectedRole === opt.role 
                              ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm ring-2 ring-blue-500/20' 
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <IconOpt className="h-5 w-5 mb-1" />
                          <span className="text-xs font-bold">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">E-mail Escolar ou Pessoal</label>
                  <div className="mt-1.5 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 bg-slate-50/50"
                      placeholder="seu.nome@escola.edu.br"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Digite qualquer e-mail para acessar ou simular uma nova conta como {selectedRole === 'teacher' ? 'Professor' : selectedRole === 'student' ? 'Estudante' : selectedRole === 'parent' ? 'Mãe/Pai' : 'Administrador'}.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">Senha</label>
                    <button
                      id="btn-recover-pass"
                      type="button"
                      onClick={() => setActiveTab('recover')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="mt-1.5 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 bg-slate-50/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-login-submit"
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all gap-2 items-center"
                  >
                    Entrar <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* PASSWORD RECOVERY FORM */}
            {activeTab === 'recover' && (
              <form onSubmit={handleRecovery} className="space-y-5" id="form-recovery">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Recuperar Senha</h3>
                  <p className="text-sm text-slate-500 mb-4">Insira o e-mail escolar associado à sua conta para receber o link de reset de senha.</p>
                  <label className="block text-sm font-medium text-slate-700">E-mail</label>
                  <div className="mt-1.5 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="recover-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 bg-slate-50/50"
                      placeholder="nome@escola.edu.br"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    id="btn-recover-back"
                    type="button"
                    onClick={() => { setActiveTab('login'); setError(''); }}
                    className="w-1/2 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Voltar
                  </button>
                  <button
                    id="btn-recover-submit"
                    type="submit"
                    className="w-1/2 py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    Enviar Link
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER WIZARD */}
            {activeTab === 'register' && (
              <div className="space-y-5" id="register-wizard">
                {/* Wizard Step 1: Base Fields & Role */}
                {registerStep === 1 && (
                  <form onSubmit={startRegistration} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Escolha seu Papel Escolar</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          id="role-teacher"
                          type="button"
                          onClick={() => setRole('teacher')}
                          className={`p-3 text-left border rounded-xl flex items-center gap-2.5 transition-all ${
                            role === 'teacher' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <BookOpen className="h-5 w-5" />
                          <div>
                            <p className="text-xs font-bold uppercase">Professor</p>
                            <p className="text-[10px] opacity-75">Criar salas e gerir alunos</p>
                          </div>
                        </button>

                        <button
                          id="role-student"
                          type="button"
                          onClick={() => setRole('student')}
                          className={`p-3 text-left border rounded-xl flex items-center gap-2.5 transition-all ${
                            role === 'student' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <UserIcon className="h-5 w-5" />
                          <div>
                            <p className="text-xs font-bold uppercase">Aluno</p>
                            <p className="text-[10px] opacity-75">Entrar com código da sala</p>
                          </div>
                        </button>

                        <button
                          id="role-parent"
                          type="button"
                          onClick={() => setRole('parent')}
                          className={`p-3 text-left border rounded-xl flex items-center gap-2.5 transition-all ${
                            role === 'parent' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Users className="h-5 w-5" />
                          <div>
                            <p className="text-xs font-bold uppercase">Responsável</p>
                            <p className="text-[10px] opacity-75">Ver pontos e portfólios</p>
                          </div>
                        </button>

                        <button
                          id="role-admin"
                          type="button"
                          onClick={() => setRole('admin')}
                          className={`p-3 text-left border rounded-xl flex items-center gap-2.5 transition-all ${
                            role === 'admin' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Shield className="h-5 w-5" />
                          <div>
                            <p className="text-xs font-bold uppercase">Admin</p>
                            <p className="text-[10px] opacity-75">Visão geral e logs</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">Nome Completo</label>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-slate-50/50"
                        placeholder="Ex: Alexandre de Souza"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">E-mail</label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-slate-50/50"
                        placeholder="nome@escola.edu.br"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">Senha</label>
                      <input
                        id="reg-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1.5 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-slate-50/50"
                        placeholder="Crie uma senha segura"
                      />
                    </div>

                    <button
                      id="btn-reg-next"
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl mt-2 transition-all flex justify-center items-center gap-2"
                    >
                      Avançar para Verificação <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                )}

                {/* Wizard Step 2: Email Verification Simulation */}
                {registerStep === 2 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="inline-flex p-3 bg-blue-50 rounded-2xl text-blue-600 mb-2">
                      <Mail className="h-8 w-8 animate-bounce" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Verifique seu E-mail</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      Simulamos o envio de um código de verificação para <strong>{email}</strong> para garantir a segurança da escola.
                    </p>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-xs mx-auto">
                      <span className="text-2xl font-mono tracking-widest font-bold text-slate-700">482-195</span>
                    </div>
                    <button
                      id="btn-confirm-verify"
                      onClick={confirmEmailVerification}
                      className="w-full max-w-xs py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md"
                    >
                      Confirmar Verificação
                    </button>
                  </div>
                )}

                {/* Wizard Step 3: Role-specific wizard details */}
                {registerStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500 h-5 w-5" /> Configurações de {role === 'teacher' ? 'Professor' : role === 'student' ? 'Aluno' : role === 'parent' ? 'Responsável' : 'Admin'}
                    </h3>

                    {role === 'teacher' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Opção Institucional</label>
                          <div className="grid grid-cols-2 gap-3 mt-1.5">
                            <button
                              id="opt-create-school"
                              type="button"
                              onClick={() => setSchoolOption('create')}
                              className={`p-2.5 text-center text-xs font-semibold rounded-xl border ${schoolOption === 'create' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                            >
                              Criar Nova Escola
                            </button>
                            <button
                              id="opt-join-school"
                              type="button"
                              onClick={() => setSchoolOption('join')}
                              className={`p-2.5 text-center text-xs font-semibold rounded-xl border ${schoolOption === 'join' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                            >
                              Vincular-se a Escola Existente
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">Nome da Escola</label>
                          <input
                            id="school-name"
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 bg-slate-50/50"
                            placeholder={schoolOption === 'create' ? "Ex: Colégio Anglo-Americano" : "Digite o nome da escola"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">Criar Primeira Turma (Opcional)</label>
                          <input
                            id="first-class-name"
                            type="text"
                            value={firstClassName}
                            onChange={(e) => setFirstClassName(e.target.value)}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 bg-slate-50/50"
                            placeholder="Ex: Geografia - 2º Ano A"
                          />
                        </div>
                      </div>
                    )}

                    {role === 'student' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Código de Acesso da Turma</label>
                          <input
                            id="student-class-code"
                            type="text"
                            value={classCodeInput}
                            onChange={(e) => setClassCodeInput(e.target.value)}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 bg-slate-50/50"
                            placeholder="Ex: MAT3B"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Este código é fornecido pelo seu professor para te adicionar automaticamente na turma correta.</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">Nome do Responsável Legal (Opcional)</label>
                          <input
                            id="student-parent-name"
                            type="text"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 bg-slate-50/50"
                            placeholder="Ex: Mariana Silva"
                          />
                        </div>
                      </div>
                    )}

                    {role === 'parent' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Vincular Conta ao Aluno</label>
                          <input
                            id="parent-student-search"
                            type="text"
                            value={studentSearchName}
                            onChange={(e) => setStudentSearchName(e.target.value)}
                            className="mt-1.5 block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 bg-slate-50/50"
                            placeholder="Ex: Gabriel Silva"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Insira o nome do seu filho/estudante para solicitar o vínculo com o professor.</p>
                        </div>
                      </div>
                    )}

                    {role === 'admin' && (
                      <div className="py-2">
                        <p className="text-sm text-slate-500">
                          Como Administrador da plataforma escolar, você terá acesso imediato aos logs de auditoria, estatísticas agregadas e controle de presença.
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-2">
                      <button
                        id="btn-wizard-back"
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50"
                      >
                        Voltar
                      </button>
                      <button
                        id="btn-wizard-finish"
                        onClick={handleFinalRegister}
                        className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all"
                      >
                        Concluir e Entrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Target Room / Visitor access */}
          {targetRoomId && (
            <div className="mt-8 pt-6 border-t border-slate-100 bg-blue-50/40 -mx-6 sm:-mx-10 px-6 sm:px-10 rounded-b-3xl">
              <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Acesso de Visitante por Convite
              </h4>
              <p className="text-xs text-slate-500 mb-3">Você recebeu um link de convite para ingressar diretamente em uma sala de aula.</p>
              
              <div className="flex gap-2">
                <input
                  id="visitor-name-input"
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Seu nome completo para exibição"
                  className="flex-1 rounded-xl border border-blue-200 py-1.5 px-3 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  id="btn-join-visitor"
                  onClick={() => {
                    if (!visitorName.trim()) {
                      setError('Por favor, informe seu nome de visitante para entrar na sala.');
                      return;
                    }
                    onJoinAsVisitor(visitorName, targetRoomId);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-4 rounded-xl transition-all"
                >
                  Entrar na Sala
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
