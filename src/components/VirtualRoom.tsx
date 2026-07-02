import React, { useState, useEffect, useRef } from 'react';
import { User, Room, Participant, CallSession, PresenceLog } from '../types';
import { getStoredPresence, setStoredPresence, getStoredAudits, setStoredAudits } from '../data/mockData';
import { 
  Video, VideoOff, Mic, MicOff, ScreenShare, ShieldAlert, 
  Settings, LogOut, Radio, Send, Users, MessageSquare, 
  CircleDot, Volume2, UserX, Minimize, Maximize 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VirtualRoomProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
}

export default function VirtualRoom({ room, currentUser, onLeave }: VirtualRoomProps) {
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isMutedAll, setIsMutedAll] = useState(false);

  // Active chat messages
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; role: string; text: string; time: string }[]>([
    { id: 'm1', sender: 'Prof. Alexandre', role: 'teacher', text: 'Sejam bem-vindos à nossa aula virtual! Hoje revisaremos o conteúdo trimestral.', time: '09:01' },
    { id: 'm2', sender: 'Ana Costa', role: 'student', text: 'Bom dia, professor! Consegui terminar a maquete de frações.', time: '09:02' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Manage in-call mock participants
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 's1', name: 'Gabriel Silva', role: 'student', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', isMuted: false, isVideoOff: false, speechActivity: 0 },
    { id: 's2', name: 'Ana Costa', role: 'student', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', isMuted: false, isVideoOff: false, speechActivity: 0 },
    { id: 's3', name: 'Lucas Oliveira', role: 'student', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', isMuted: true, isVideoOff: false, speechActivity: 0 },
    { id: 's4', name: 'Juliana Lima', role: 'student', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200', isMuted: false, isVideoOff: true, speechActivity: 0 }
  ]);

  // Sidebar toggles inside call
  const [activePanel, setActivePanel] = useState<'chat' | 'participants'>('chat');

  // Webcams and stream element references
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Auto scroll chat to bottom
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize and register attendance
  useEffect(() => {
    // Add presence record
    const allPresence = getStoredPresence();
    const newPresence: PresenceLog = {
      id: 'pr_live_' + Date.now(),
      studentName: currentUser.name,
      role: currentUser.role,
      joinedAt: new Date().toISOString(),
      roomName: room.name,
      status: 'present'
    };
    allPresence.unshift(newPresence);
    setStoredPresence(allPresence);

    // Save in auds
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Ingresso em Aula',
      target: room.name,
      timestamp: new Date().toISOString(),
      details: `${currentUser.name} entrou na aula virtual.`
    });
    setStoredAudits(audits);

    // Start Webcam Capture if allowed
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log('Webcam/mic not available or permission denied. Falling back to stylish mock stream.');
      }
    };
    startWebcam();

    // Cleanup stream on component unmount
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Update Presence record with exit time
      const finalPresence = getStoredPresence();
      const targetRecordIndex = finalPresence.findIndex(p => p.studentName === currentUser.name && p.roomName === room.name && !p.leftAt);
      if (targetRecordIndex !== -1) {
        finalPresence[targetRecordIndex].leftAt = new Date().toISOString();
        setStoredPresence(finalPresence);
      }
    };
  }, [room, currentUser]);

  // Handle auto-scroll for chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Periodic simulated student speak and chat behavior to make it feel super alive!
  useEffect(() => {
    const speakInterval = setInterval(() => {
      // Pick a random participant and let them speak slightly
      setParticipants(prev => {
        return prev.map(p => {
          if (!p.isMuted && Math.random() > 0.6) {
            return { ...p, speechActivity: Math.floor(Math.random() * 80 + 20) };
          }
          return { ...p, speechActivity: 0 };
        });
      });
    }, 1800);

    const chatAnswers = [
      'Entendido, professor!',
      'Tenho uma dúvida nas tarefas de amanhã.',
      'Muito legal esse simulador!',
      'Vou fazer o upload da minha redação agora no portfólio.',
      'Consigo ver a tela compartilhada perfeitamente.',
      'Prof, pode repetir a última frase por favor?'
    ];

    const messageInterval = setInterval(() => {
      // Pick a random student and send a message
      const randomStudent = participants[Math.floor(Math.random() * participants.length)];
      const randomText = chatAnswers[Math.floor(Math.random() * chatAnswers.length)];
      
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      setChatMessages(prev => [
        ...prev,
        {
          id: 'm_' + Date.now(),
          sender: randomStudent.name,
          role: randomStudent.role,
          text: randomText,
          time: timeStr
        }
      ]);
    }, 22000); // Send message every 22 seconds

    return () => {
      clearInterval(speakInterval);
      clearInterval(messageInterval);
    };
  }, [participants]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setChatMessages(prev => [
      ...prev,
      {
        id: 'm_' + Date.now(),
        sender: currentUser.name,
        role: currentUser.role,
        text: chatInput,
        time: timeStr
      }
    ]);
    setChatInput('');
  };

  const toggleLocalVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(t => t.enabled = !videoOn);
    }
    setVideoOn(!videoOn);
  };

  const toggleLocalAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(t => t.enabled = !audioOn);
    }
    setAudioOn(!audioOn);
  };

  const toggleMuteAllStudents = () => {
    const willMute = !isMutedAll;
    setIsMutedAll(willMute);
    setParticipants(prev => {
      return prev.map(p => ({ ...p, isMuted: willMute }));
    });

    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: willMute ? 'Silenciar Todos' : 'Permitir Áudio Todos',
      target: room.name,
      timestamp: new Date().toISOString(),
      details: `${currentUser.name} ${willMute ? 'silenciou' : 'desmutou'} todos os participantes da aula virtual.`
    });
    setStoredAudits(audits);
  };

  const handleKickParticipant = (id: string, name: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));

    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Exclusão de Aluno de Chamada',
      target: name,
      timestamp: new Date().toISOString(),
      details: `${currentUser.name} expulsou ${name} da sala de aula virtual.`
    });
    setStoredAudits(audits);
  };

  const handleToggleRecording = () => {
    const willRecord = !isRecording;
    setIsRecording(willRecord);

    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: willRecord ? 'Início de Gravação' : 'Parada de Gravação',
      target: room.name,
      timestamp: new Date().toISOString(),
      details: `Gravação da aula virtual em ${room.name} ${willRecord ? 'iniciada' : 'parada'} por ${currentUser.name}.`
    });
    setStoredAudits(audits);
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col h-screen overflow-hidden" id="virtual-classroom">
      
      {/* 1. TOP HEADER */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-red-500 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full text-xs font-black animate-pulse">
            <Radio className="h-4 w-4" /> TRANSMISSÃO ATIVA
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight">{room.name}</h1>
            <p className="text-[10px] text-slate-400 font-medium">Liderada por: <span className="text-blue-400">{room.teacherName}</span></p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="flex items-center gap-1.5 bg-red-600/20 text-red-400 border border-red-600/40 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider animate-pulse">
              <CircleDot className="h-3.5 w-3.5 fill-red-500 text-red-500" />
              <span>GRAVANDO</span>
            </div>
          )}
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-xl font-mono">
            Código: <strong className="text-white">{room.joinCode}</strong>
          </span>
        </div>
      </header>

      {/* 2. BODY CONTENT (MAIN STAGE GRID + PANEL SIDEBAR) */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* MAIN VIDEO SCREEN GRID */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-950 items-center justify-center relative">
          
          {/* USER SELF VIEW PANEL */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video relative border-2 border-slate-800 flex flex-col justify-between shadow-lg group">
            {/* Overlay indicators */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-slate-700/50 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              {currentUser.name} (Você)
            </div>

            <div className="absolute top-3 right-3 z-10 flex gap-1">
              {!audioOn && (
                <span className="bg-red-600 p-1.5 rounded-lg text-white text-xs">
                  <MicOff className="h-3.5 w-3.5" />
                </span>
              )}
            </div>

            {/* Simulated webcam stream vs Actual user stream */}
            <div className="flex-1 flex items-center justify-center bg-slate-950 relative overflow-hidden h-full">
              {videoOn ? (
                <>
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* If webcam is not connected, display floating particles */}
                  {!localStreamRef.current && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/30 to-indigo-950/40">
                      <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center animate-pulse mb-3">
                        <Video className="h-8 w-8 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
                      </div>
                      <p className="text-[10px] text-blue-300 font-bold tracking-wide">Capturando câmera local...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center bg-slate-900/40">
                  <img src={currentUser.avatarUrl} className="w-20 h-20 rounded-full object-cover border-4 border-slate-800 mb-3" alt="" />
                  <span className="text-xs font-bold text-slate-400">Vídeo Desativado</span>
                </div>
              )}
            </div>
          </div>

          {/* SCREEN SHARE PANEL (REPLACES MOCK GRID IF HOST AND ACTIVE) */}
          {isSharingScreen && (
            <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-video relative border-2 border-indigo-500 col-span-1 md:col-span-2 flex flex-col justify-between shadow-2xl animate-fadeIn">
              <div className="absolute top-3 left-3 bg-indigo-600 px-3 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-indigo-400/30 z-10">
                <ScreenShare className="h-3.5 w-3.5 animate-bounce" />
                Apresentando Tela: Álgebra Linear Prática
              </div>

              {/* Simulated Slides layout */}
              <div className="flex-1 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex flex-col items-center justify-center p-8 text-center relative select-none">
                <div className="absolute top-4 right-4 text-[9px] text-indigo-300 font-mono">Slide 4 de 12</div>
                
                <h2 className="text-xl font-black text-indigo-200 tracking-tight mb-2">Tema: Aplicação Prática de Matrizes</h2>
                <p className="text-xs text-slate-300 max-w-sm mb-6 leading-relaxed">Matrizes são tabelas organizadas em linhas e colunas, muito utilizadas na computação gráfica e na física mecânica de projeção 3D.</p>
                
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/20 font-mono text-left max-w-xs text-[10px] text-emerald-400">
                  <p className="text-slate-500">// Representação de Rotação 2D</p>
                  <p>cos(θ)  -sin(θ)</p>
                  <p>sin(θ)   cos(θ)</p>
                </div>
              </div>
            </div>
          )}

          {/* MOCK PARTICIPANTS VIDEOS */}
          {participants.map((p) => {
            const isSpeaking = p.speechActivity && p.speechActivity > 20;
            return (
              <div 
                key={p.id} 
                id={`participant-stream-${p.id}`}
                className={`bg-slate-900 rounded-3xl overflow-hidden aspect-video relative border flex flex-col justify-between transition-all duration-300 ${
                  isSpeaking ? 'border-amber-500 shadow-lg ring-4 ring-amber-500/10' : 'border-slate-800'
                }`}
              >
                {/* Overlay Name */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border border-slate-700/50 z-10">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`}></span>
                  {p.name}
                </div>

                {/* Right controls or status */}
                <div className="absolute top-3 right-3 z-10 flex gap-1 items-center">
                  {p.isMuted ? (
                    <span className="bg-red-600 p-1 rounded bg-opacity-90 text-white text-[10px] flex items-center gap-1">
                      <MicOff className="h-3 w-3" /> MUDO
                    </span>
                  ) : (
                    isSpeaking && (
                      <span className="bg-amber-500 p-1 rounded text-slate-950 animate-pulse">
                        <Volume2 className="h-3.5 w-3.5" />
                      </span>
                    )
                  )}

                  {/* Kick Button (Teacher only) */}
                  {currentUser.role === 'teacher' && (
                    <button
                      id={`btn-kick-student-${p.id}`}
                      onClick={() => handleKickParticipant(p.id, p.name)}
                      className="bg-red-600 hover:bg-red-700 p-1 rounded text-white text-[10px] ml-1 opacity-0 hover:opacity-100 group-hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
                      title="Expulsar da chamada"
                    >
                      <UserX className="h-3 w-3" /> Ejetar
                    </button>
                  )}
                </div>

                {/* Simulated Stream canvas/avatar */}
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 relative overflow-hidden h-full">
                  {!p.isVideoOff ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950/20 to-slate-900">
                      
                      {/* Wave audio lines representing simulated camera background */}
                      <div className="absolute inset-0 opacity-10 flex items-center justify-around px-8">
                        <span className="w-1 bg-blue-500 animate-bounce h-12" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1 bg-purple-500 animate-bounce h-16" style={{ animationDelay: '0.3s' }}></span>
                        <span className="w-1 bg-indigo-500 animate-bounce h-8" style={{ animationDelay: '0.5s' }}></span>
                        <span className="w-1 bg-emerald-500 animate-bounce h-14" style={{ animationDelay: '0.2s' }}></span>
                      </div>

                      <img src={p.avatarUrl} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700 z-10 shadow-md" alt="" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-slate-900/40">
                      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 mb-2">
                        <VideoOff className="h-5 w-5 text-slate-500" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">Câmera Desligada</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SIDE PANEL (CHAT OR PARTICIPANTS LIST) */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col justify-between h-full z-10">
          
          {/* Header tabs inside panel */}
          <div className="flex border-b border-slate-800 p-1">
            <button
              id="btn-panel-chat"
              onClick={() => setActivePanel('chat')}
              className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activePanel === 'chat' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="h-4 w-4" /> Chat da Turma
            </button>
            <button
              id="btn-panel-participants"
              onClick={() => setActivePanel('participants')}
              className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activePanel === 'participants' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4" /> Participantes ({participants.length + 1})
            </button>
          </div>

          {/* Tab content 1: LIVE CHAT */}
          {activePanel === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans max-h-[calc(100vh-220px)]">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs space-y-1 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${msg.role === 'teacher' ? 'text-blue-400' : 'text-emerald-400'}`}>{msg.sender}</span>
                      <span className="text-[9px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="bg-slate-800/80 p-2.5 rounded-2xl rounded-tl-none border border-slate-800/50 text-slate-200 leading-relaxed break-all">
                      {msg.text}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 flex gap-2">
                <input
                  id="call-chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escreva sua pergunta..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  id="btn-call-chat-send"
                  type="submit"
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tab content 2: PARTICIPANTS LIST */}
          {activePanel === 'participants' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Anfitrião</div>
              
              <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[10px]">PROF</div>
                  <div>
                    <p className="font-bold">{room.teacherName}</p>
                    <p className="text-[9px] text-slate-500">Organizador</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">Conectados ({participants.length})</div>

              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-slate-800/20 hover:bg-slate-800/50 border border-slate-800/30 rounded-xl text-xs gap-3">
                    <div className="flex items-center gap-2 truncate">
                      <img src={p.avatarUrl} className="w-7 h-7 rounded-lg object-cover" alt="" />
                      <span className="font-medium truncate">{p.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.isMuted ? (
                        <MicOff className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <Mic className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>

      {/* 3. FOOTER CONTROL BAR */}
      <footer className="px-6 py-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between z-10 select-none">
        
        {/* Toggle recording (Teacher only) */}
        <div>
          {currentUser.role === 'teacher' ? (
            <button
              id="btn-call-toggle-rec"
              onClick={handleToggleRecording}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-red-600 border-red-600 text-white shadow-md animate-pulse' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <CircleDot className="h-4 w-4" />
              <span>{isRecording ? 'Interromper Gravação' : 'Gravar Aula'}</span>
            </button>
          ) : (
            <div className="text-[10px] text-slate-500 italic">Gravação controlada pelo moderador.</div>
          )}
        </div>

        {/* Audio Video and Screen buttons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-call-toggle-audio"
            onClick={toggleLocalAudio}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              audioOn 
                ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700' 
                : 'bg-red-600 border-red-600 text-white shadow-md'
            }`}
            title={audioOn ? "Silenciar Microfone" : "Ativar Microfone"}
          >
            {audioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button
            id="btn-call-toggle-video"
            onClick={toggleLocalVideo}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              videoOn 
                ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700' 
                : 'bg-red-600 border-red-600 text-white shadow-md'
            }`}
            title={videoOn ? "Desativar Câmera" : "Ativar Câmera"}
          >
            {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          {/* Screen sharing toggler */}
          <button
            id="btn-call-toggle-share"
            onClick={() => setIsSharingScreen(!isSharingScreen)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isSharingScreen 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Apresentar slides ou tela"
          >
            <ScreenShare className="h-5 w-5" />
          </button>

          {/* Mute all students (Teacher only) */}
          {currentUser.role === 'teacher' && (
            <button
              id="btn-call-mute-all"
              onClick={toggleMuteAllStudents}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isMutedAll 
                  ? 'bg-red-600/30 border-red-600/50 text-red-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              title="Silenciar Todos os Alunos"
            >
              <MicOff className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Leave classroom session button */}
        <div>
          <button
            id="btn-leave-call"
            onClick={onLeave}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Desconectar
          </button>
        </div>

      </footer>

    </div>
  );
}
