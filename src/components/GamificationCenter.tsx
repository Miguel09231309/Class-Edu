import React, { useState, useEffect } from 'react';
import { User, UserRole, PointTransaction } from '../types';
import { 
  getStoredUsers, setStoredUsers, 
  getStoredPoints, setStoredPoints,
  getStoredAudits, setStoredAudits 
} from '../data/mockData';
import { 
  Star, Award, ShieldAlert, Sparkles, Smile, Users, Trophy, 
  Home, BookOpen, Check, X, Shield, Settings, Info, RefreshCw, 
  Palette, ChevronRight, CheckCircle, Flame, Plus, Trash2, Send, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GamificationCenterProps {
  currentUser: User;
  onUpdateUser?: (user: User) => void;
}

// ----------------------------------------
// GAMIFICATION LOCAL TYPES
// ----------------------------------------
interface Competency {
  id: string;
  name: string;
  type: 'positive' | 'negative';
  points: number;
  icon: string;
  description: string;
}

interface Reward {
  id: string;
  title: string;
  cost: number;
  target: 'school' | 'home';
  description: string;
  createdBy: string;
}

interface Redemption {
  id: string;
  rewardId: string;
  rewardTitle: string;
  studentId: string;
  studentName: string;
  cost: number;
  date: string;
  status: 'pending' | 'approved' | 'declined';
  target: 'school' | 'home';
}

interface Team {
  id: string;
  name: string;
  studentIds: string[];
  points: number;
}

interface AvatarConfig {
  color: string;
  expression: string;
  accessory: string;
  background: string;
}

// ----------------------------------------
// DYNAMIC SVG MONSTER COMPONENT
// ----------------------------------------
export function Monstrinho({ config, className = 'w-32 h-32' }: { config: AvatarConfig; className?: string }) {
  const colors: Record<string, string> = {
    emerald: '#10b981',
    purple: '#a855f7',
    indigo: '#6366f1',
    amber: '#f59e0b',
    pink: '#ec4899',
    sky: '#0ea5e9',
  };

  const bgStyles: Record<string, string> = {
    solid: 'bg-slate-900',
    stars: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
    sunburst: 'bg-gradient-to-tr from-amber-950 via-slate-900 to-rose-950',
    sparkles: 'bg-gradient-to-r from-teal-950 via-slate-900 to-sky-950',
  };

  const colorHex = colors[config.color] || '#6366f1';

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-inner flex items-center justify-center transition-all duration-500 border border-slate-700/30 ${bgStyles[config.background] || 'bg-slate-950'} ${className}`}>
      {/* Sparkly / star background overlays */}
      {config.background === 'stars' && (
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-10 right-8 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-6 left-12 w-1 h-1 bg-purple-300 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
        </div>
      )}
      {config.background === 'sunburst' && (
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.3)_0,transparent_60%)] animate-pulse"></div>
      )}
      {config.background === 'sparkles' && (
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-3 right-4 w-2 h-2 bg-emerald-300 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-4 left-6 w-1 h-1 bg-white rounded-full animate-ping"></div>
        </div>
      )}

      <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 select-none drop-shadow-xl animate-bounce" style={{ animationDuration: '4s' }}>
        {/* Shadow */}
        <ellipse cx="50" cy="85" rx="20" ry="4" fill="rgba(0,0,0,0.3)" />

        {/* Monster Body Group */}
        <g className="transition-all duration-300">
          {/* Horns or Ears */}
          <path d="M 32 30 Q 25 10 33 22 Z" fill={colorHex} stroke="#1e293b" strokeWidth="1" />
          <path d="M 68 30 Q 75 10 67 22 Z" fill={colorHex} stroke="#1e293b" strokeWidth="1" />
          
          {/* Secondary smaller horns */}
          <path d="M 40 24 Q 38 15 42 22 Z" fill="#ffffff" />
          <path d="M 60 24 Q 62 15 58 22 Z" fill="#ffffff" />

          {/* Main Body (Blob) */}
          <path d="M 30 50 Q 22 25 50 24 Q 78 25 70 50 Q 74 78 50 78 Q 26 78 30 50 Z" fill={colorHex} stroke="#0f172a" strokeWidth="1.5" />
          
          {/* Cute Belly */}
          <ellipse cx="50" cy="62" rx="14" ry="10" fill="rgba(255,255,255,0.15)" />
          
          {/* Belly stripes/pattern */}
          <path d="M 42 62 Q 50 64 58 62" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
          <path d="M 44 58 Q 50 60 56 58" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
          <path d="M 44 66 Q 50 68 56 66" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
        </g>

        {/* EYES & EXPRESSIONS */}
        <g>
          {config.expression === 'happy' && (
            <>
              {/* Joyous eyes */}
              <ellipse cx="40" cy="42" rx="5" ry="5" fill="#ffffff" stroke="#000" strokeWidth="1" />
              <ellipse cx="40" cy="42" rx="2.5" ry="2.5" fill="#0f172a" />
              <circle cx="38" cy="40" r="1" fill="#fff" />
              
              <ellipse cx="60" cy="42" rx="5" ry="5" fill="#ffffff" stroke="#000" strokeWidth="1" />
              <ellipse cx="60" cy="42" rx="2.5" ry="2.5" fill="#0f172a" />
              <circle cx="58" cy="40" r="1" fill="#fff" />

              {/* Rosy Cheeks */}
              <ellipse cx="32" cy="48" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6" />
              <ellipse cx="68" cy="48" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6" />

              {/* Smiling mouth */}
              <path d="M 43 51 Q 50 58 57 51" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          )}

          {config.expression === 'star' && (
            <>
              {/* Star Eyes */}
              <path d="M 40 37 L 42 41 L 46 41 L 43 44 L 44 48 L 40 45 L 36 48 L 37 44 L 34 41 L 38 41 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <path d="M 60 37 L 62 41 L 66 41 L 63 44 L 64 48 L 60 45 L 56 48 L 57 44 L 54 41 L 58 41 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

              {/* Wide excited open mouth with tongue */}
              <path d="M 42 50 Q 50 60 58 50 Z" fill="#be123c" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 46 55 Q 50 53 54 55 Q 50 59 46 55" fill="#f43f5e" />
            </>
          )}

          {config.expression === 'chill' && (
            <>
              {/* Cool sunglasses */}
              <path d="M 30 38 L 70 38" stroke="#0f172a" strokeWidth="2" />
              <path d="M 32 38 Q 40 35 48 38 L 46 46 Q 38 48 34 44 Z" fill="#1e293b" />
              <path d="M 52 38 Q 60 35 68 38 L 66 46 Q 58 48 54 44 Z" fill="#1e293b" />
              {/* Lens glare */}
              <path d="M 34 40 L 42 44" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 54 40 L 62 44" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />

              {/* Smirk */}
              <path d="M 45 52 Q 53 52 51 49" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          )}

          {config.expression === 'cute' && (
            <>
              {/* Big anime eyes */}
              <ellipse cx="40" cy="42" rx="6" ry="7" fill="#0f172a" />
              <circle cx="38" cy="39" r="2.5" fill="#ffffff" />
              <circle cx="42" cy="44" r="1.2" fill="#ffffff" />

              <ellipse cx="60" cy="42" rx="6" ry="7" fill="#0f172a" />
              <circle cx="58" cy="39" r="2.5" fill="#ffffff" />
              <circle cx="62" cy="44" r="1.2" fill="#ffffff" />

              {/* Rosy Cheeks */}
              <ellipse cx="32" cy="48" rx="5" ry="3" fill="#ec4899" opacity="0.8" />
              <ellipse cx="68" cy="48" rx="5" ry="3" fill="#ec4899" opacity="0.8" />

              {/* Little cute curve mouth */}
              <path d="M 46 50 Q 50 53 54 50" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}

          {config.expression === 'wonder' && (
            <>
              {/* Spiralled / surprised eyes */}
              <ellipse cx="40" cy="41" rx="5" ry="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 37 41 A 3 3 0 0 1 43 41" stroke="#0f172a" strokeWidth="1.5" fill="none" />
              
              <ellipse cx="60" cy="41" rx="5" ry="5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 57 41 A 3 3 0 0 1 63 41" stroke="#0f172a" strokeWidth="1.5" fill="none" />

              {/* Rounded mouth */}
              <circle cx="50" cy="51" r="3.5" fill="#0f172a" />
            </>
          )}
        </g>

        {/* ACCESSORIES */}
        <g>
          {config.accessory === 'cap' && (
            <>
              {/* Graduation Cap */}
              <path d="M 50 12 L 72 19 L 50 26 L 28 19 Z" fill="#1e293b" stroke="#000" strokeWidth="1" />
              <path d="M 38 21 L 38 28 C 38 31, 62 31, 62 28 L 62 21" fill="#0f172a" />
              {/* Tassel */}
              <path d="M 50 19 L 68 24 L 68 32" stroke="#fbbf24" strokeWidth="1" fill="none" />
              <polygon points="66,32 70,32 68,36" fill="#fbbf24" />
            </>
          )}

          {config.accessory === 'crown' && (
            <>
              {/* Golden Crown */}
              <path d="M 32 24 L 35 12 L 44 19 L 50 9 L 56 19 L 65 12 L 68 24 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              {/* Jewels */}
              <circle cx="35" cy="11" r="1.5" fill="#f43f5e" />
              <circle cx="50" cy="8" r="1.5" fill="#3b82f6" />
              <circle cx="65" cy="11" r="1.5" fill="#10b981" />
              <ellipse cx="50" cy="19" rx="3" ry="1.5" fill="#f43f5e" />
            </>
          )}

          {config.accessory === 'headphones' && (
            <>
              {/* Headband */}
              <path d="M 28 40 A 22 22 0 0 1 72 40" stroke="#1e293b" strokeWidth="3.5" fill="none" />
              {/* Ear pads */}
              <rect x="22" y="36" width="7" height="12" rx="3.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
              <rect x="71" y="36" width="7" height="12" rx="3.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
            </>
          )}

          {config.accessory === 'glasses' && (
            <>
              {/* Star-shaped glasses frame */}
              <path d="M 32 37 L 48 37 L 40 46 Z" fill="none" stroke="#ec4899" strokeWidth="2" />
              <path d="M 52 37 L 68 37 L 60 46 Z" fill="none" stroke="#ec4899" strokeWidth="2" />
              <line x1="48" y1="39" x2="52" y2="39" stroke="#ec4899" strokeWidth="2" />
            </>
          )}

          {config.accessory === 'bow' && (
            <>
              {/* Red bowtie at bottom */}
              <polygon points="40,73 40,81 46,77" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
              <polygon points="60,73 60,81 54,77" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
              <circle cx="50" cy="77" r="3" fill="#b91c1c" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

// ----------------------------------------
// CORE GAMIFICATION CENTER COMPONENT
// ----------------------------------------
export default function GamificationCenter({ currentUser, onUpdateUser }: GamificationCenterProps) {
  // --- STATE PERSISTENCE ---
  const [activeSubTab, setActiveSubTab] = useState<string>('action'); // action, setup, rewards, home, avatar
  
  // Custom list of students
  const [students, setStudents] = useState<User[]>([]);
  const [pointsLog, setPointsLog] = useState<PointTransaction[]>([]);

  // Local-persisted settings
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [avatars, setAvatars] = useState<Record<string, AvatarConfig>>({});

  // Form helpers
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [customReason, setCustomReason] = useState<string>('');
  
  // Point float animation
  const [celebrationText, setCelebrationText] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Creators/Adders
  const [isNewCompetencyOpen, setIsNewCompetencyOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState<'positive' | 'negative'>('positive');
  const [compVal, setCompVal] = useState(5);
  const [compIcon, setCompIcon] = useState('🤝');
  const [compDesc, setCompDesc] = useState('');

  const [isNewRewardOpen, setIsNewRewardOpen] = useState(false);
  const [rewTitle, setRewTitle] = useState('');
  const [rewCost, setRewCost] = useState(10);
  const [rewTarget, setRewTarget] = useState<'school' | 'home'>('school');
  const [rewDesc, setRewDesc] = useState('');

  const [isNewTeamOpen, setIsNewTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // Student specific custom avatar edit state
  const [myAvatar, setMyAvatar] = useState<AvatarConfig>({
    color: 'indigo',
    expression: 'happy',
    accessory: 'none',
    background: 'solid'
  });

  // Load everything on mount
  useEffect(() => {
    const loadedUsers = getStoredUsers();
    setStudents(loadedUsers.filter(u => u.role === 'student'));
    setPointsLog(getStoredPoints());

    // Load gamification specifics from localStorage with robust initial presets
    const storedCompetencies = localStorage.getItem('se_g_competencies');
    if (storedCompetencies) {
      setCompetencies(JSON.parse(storedCompetencies));
    } else {
      const initialComps: Competency[] = [
        { id: 'c1', name: 'Trabalho Colaborativo', type: 'positive', points: 5, icon: '🤝', description: 'Trabalhou em equipe, respeitou ideias e dividiu tarefas de forma justa.' },
        { id: 'c2', name: 'Esforço e Dedicação', type: 'positive', points: 5, icon: '💪', description: 'Persistiu em tarefas complexas e concluiu desafios adicionais.' },
        { id: 'c3', name: 'Autonomia e Foco', type: 'positive', points: 10, icon: '🧠', description: 'Gerenciou o tempo de estudo sem distrações e cumpriu metas individuais.' },
        { id: 'c4', name: 'Atitude de Respeito', type: 'positive', points: 5, icon: '🌱', description: 'Demonstrou gentileza e empatia com colegas e docentes.' },
        { id: 'c5', name: 'Foco Disperso', type: 'negative', points: 3, icon: '⚠️', description: 'Perda frequente de foco durante a aula (usar com feedback descritivo).' },
      ];
      setCompetencies(initialComps);
      localStorage.setItem('se_g_competencies', JSON.stringify(initialComps));
    }

    const storedRewards = localStorage.getItem('se_g_rewards');
    if (storedRewards) {
      setRewards(JSON.parse(storedRewards));
    } else {
      const initialRewards: Reward[] = [
        { id: 'r1', title: 'Escolher Atividade Lúdica', cost: 15, target: 'school', description: 'Pode sugerir ou escolher a brincadeira final da aula de sexta.', createdBy: 'Prof. Alexandre Souza' },
        { id: 'r2', title: 'Ajudante do Docente por 1 Dia', cost: 10, target: 'school', description: 'Auxilia na coordenação de microfones, chat e divisão de grupos.', createdBy: 'Prof. Alexandre Souza' },
        { id: 'r3', title: 'Adiar 1 Tarefa em 24h', cost: 20, target: 'school', description: 'Extensão de prazo pedagógica com aprovação do professor.', createdBy: 'Prof. Carla Mendes' },
        { id: 'r4', title: '30 min extra de Videogame', cost: 15, target: 'home', description: 'Prêmio familiar sob o Point At Home. Pais aprovam em casa!', createdBy: 'Mariana Silva' },
        { id: 'r5', title: 'Escolher o Jantar de Sexta', cost: 25, target: 'home', description: 'Prêmio familiar. Direito de escolher a janta da família.', createdBy: 'Carlos Costa' },
      ];
      setRewards(initialRewards);
      localStorage.setItem('se_g_rewards', JSON.stringify(initialRewards));
    }

    const storedRedemptions = localStorage.getItem('se_g_redemptions');
    if (storedRedemptions) {
      setRedemptions(JSON.parse(storedRedemptions));
    } else {
      const initialRedemptions: Redemption[] = [
        { id: 'red1', rewardId: 'r2', rewardTitle: 'Ajudante do Docente por 1 Dia', studentId: 's1', studentName: 'Gabriel Silva', cost: 10, date: new Date().toISOString(), status: 'pending', target: 'school' }
      ];
      setRedemptions(initialRedemptions);
      localStorage.setItem('se_g_redemptions', JSON.stringify(initialRedemptions));
    }

    const storedTeams = localStorage.getItem('se_g_teams');
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    } else {
      const initialTeams: Team[] = [
        { id: 't_delta', name: 'Time Delta 🔺', studentIds: ['s1', 's3'], points: 140 },
        { id: 't_curie', name: 'Grupo Curie 🧪', studentIds: ['s2', 's4', 's5'], points: 260 },
      ];
      setTeams(initialTeams);
      localStorage.setItem('se_g_teams', JSON.stringify(initialTeams));
    }

    const storedAvatars = localStorage.getItem('se_g_student_avatars');
    if (storedAvatars) {
      const parsed = JSON.parse(storedAvatars);
      setAvatars(parsed);
      if (currentUser.role === 'student' && parsed[currentUser.id]) {
        setMyAvatar(parsed[currentUser.id]);
      } else if (currentUser.role === 'parent') {
        // Find child's avatar
        const childId = currentUser.name.includes('Silva') ? 's1' : 's2';
        if (parsed[childId]) {
          setMyAvatar(parsed[childId]);
        }
      }
    } else {
      const initialAvatars: Record<string, AvatarConfig> = {
        s1: { color: 'emerald', expression: 'happy', accessory: 'cap', background: 'stars' },
        s2: { color: 'purple', expression: 'star', accessory: 'crown', background: 'sunburst' },
        s3: { color: 'indigo', expression: 'chill', accessory: 'headphones', background: 'solid' },
        s4: { color: 'amber', expression: 'cute', accessory: 'glasses', background: 'sparkles' },
        s5: { color: 'pink', expression: 'wonder', accessory: 'bow', background: 'stars' },
      };
      setAvatars(initialAvatars);
      localStorage.setItem('se_g_student_avatars', JSON.stringify(initialAvatars));
      if (currentUser.role === 'student' && initialAvatars[currentUser.id]) {
        setMyAvatar(initialAvatars[currentUser.id]);
      }
    }

    // Role-based default tabs
    if (currentUser.role === 'student') {
      setActiveSubTab('avatar');
    } else if (currentUser.role === 'parent') {
      setActiveSubTab('home');
    } else {
      setActiveSubTab('action');
    }
  }, [currentUser]);

  // Persist edits helper
  const saveGamificationData = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Resolve child for parents
  const getChildStudent = (): User => {
    const allUsers = getStoredUsers();
    if (currentUser.name.includes('Silva')) {
      return allUsers.find(u => u.id === 's1') || allUsers[2];
    }
    return allUsers.find(u => u.id === 's2') || allUsers[3];
  };

  const resolvedChild = getChildStudent();

  // ----------------------------------------
  // ACTIONS / HANDLERS
  // ----------------------------------------
  const handleAwardPointsToStudent = (student: User, competency: Competency) => {
    const isPositive = competency.type === 'positive';
    const finalPoints = isPositive ? competency.points : -competency.points;

    // Update students state & main users database
    const allUsers = getStoredUsers();
    const updatedUsers = allUsers.map(u => {
      if (u.id === student.id) {
        const prev = u.points || 0;
        const next = Math.max(0, prev + finalPoints);
        return { ...u, points: next };
      }
      return u;
    });

    setStoredUsers(updatedUsers);
    setStudents(updatedUsers.filter(u => u.role === 'student'));

    // If the rewarded student is our current user, update state so top header updates
    if (currentUser.role === 'student' && student.id === currentUser.id) {
      const meUpdated = updatedUsers.find(u => u.id === currentUser.id);
      if (meUpdated && onUpdateUser) onUpdateUser(meUpdated);
    }

    // Add transaction
    const newTx: PointTransaction = {
      id: 'tx_g_' + Date.now(),
      studentId: student.id,
      studentName: student.name,
      points: finalPoints,
      category: competency.type === 'positive' ? 'participacao' : 'comportamento',
      reason: customReason || `${competency.icon} Conquista de: ${competency.name}`,
      date: new Date().toISOString(),
      awardedBy: currentUser.name
    };

    const updatedTxs = [newTx, ...pointsLog];
    setPointsLog(updatedTxs);
    setStoredPoints(updatedTxs);

    // Audit Log
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_g_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: finalPoints > 0 ? 'Pontos Positivos' : 'Aviso Pedagógico',
      target: `${student.name} (${finalPoints > 0 ? '+' : ''}${finalPoints} pts)`,
      timestamp: new Date().toISOString(),
      details: `Atribuídos ${finalPoints} pontos ligados à competência "${competency.name}". Motivo: ${newTx.reason}`
    });
    setStoredAudits(audits);

    // Playful Floating Text Animation
    setCelebrationText(`${finalPoints > 0 ? '+' : ''}${finalPoints} Estrelas para ${student.name}! ${competency.icon}`);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 2500);

    // Reset Console fields
    setCustomReason('');
    setSelectedStudent(null);
  };

  const handleAwardTeamPoints = (team: Team, competency: Competency) => {
    const isPositive = competency.type === 'positive';
    const finalPoints = isPositive ? competency.points : -competency.points;

    // Award all members of the team
    const allUsers = getStoredUsers();
    const updatedUsers = allUsers.map(u => {
      if (team.studentIds.includes(u.id)) {
        const prev = u.points || 0;
        return { ...u, points: Math.max(0, prev + finalPoints) };
      }
      return u;
    });

    setStoredUsers(updatedUsers);
    setStudents(updatedUsers.filter(u => u.role === 'student'));

    // Create transactions for all members
    const newTxs: PointTransaction[] = team.studentIds.map(id => {
      const stud = allUsers.find(x => x.id === id);
      return {
        id: `tx_g_t_${id}_${Date.now()}`,
        studentId: id,
        studentName: stud?.name || 'Estudante',
        points: finalPoints,
        category: 'participacao',
        reason: customReason || `🏆 Trabalho em Equipe no ${team.name} - Competência: ${competency.name}`,
        date: new Date().toISOString(),
        awardedBy: currentUser.name
      };
    });

    const updatedTxs = [...newTxs, ...pointsLog];
    setPointsLog(updatedTxs);
    setStoredPoints(updatedTxs);

    // Update Team Points
    const updatedTeams = teams.map(t => {
      if (t.id === team.id) {
        return { ...t, points: Math.max(0, t.points + (finalPoints * team.studentIds.length)) };
      }
      return t;
    });
    setTeams(updatedTeams);
    saveGamificationData('se_g_teams', updatedTeams);

    // Audit logs
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_g_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Pontuação de Equipe',
      target: team.name,
      timestamp: new Date().toISOString(),
      details: `Atribuídos ${finalPoints} pontos para todos os membros do ${team.name} pela competência "${competency.name}".`
    });
    setStoredAudits(audits);

    // Playful Floating Text Animation
    setCelebrationText(`+${finalPoints} para todos no ${team.name}! 🎉`);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 2500);

    setCustomReason('');
    setSelectedTeam(null);
  };

  // Define new competency
  const handleCreateCompetency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    const newComp: Competency = {
      id: 'comp_' + Date.now(),
      name: compName,
      type: compType,
      points: Number(compVal),
      icon: compIcon,
      description: compDesc || 'Competência educacional definida pela escola.'
    };

    const updated = [...competencies, newComp];
    setCompetencies(updated);
    saveGamificationData('se_g_competencies', updated);

    // Audit Log
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_g_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Configuração de Competência',
      target: compName,
      timestamp: new Date().toISOString(),
      details: `Nova competência criada: ${compName} (${compType === 'positive' ? '+' : '-'}${compVal} pts).`
    });
    setStoredAudits(audits);

    setCompName('');
    setCompDesc('');
    setIsNewCompetencyOpen(false);
  };

  const handleDeleteCompetency = (id: string, name: string) => {
    if (window.confirm(`Deseja mesmo remover a competência "${name}"?`)) {
      const updated = competencies.filter(c => c.id !== id);
      setCompetencies(updated);
      saveGamificationData('se_g_competencies', updated);
    }
  };

  // Define new reward
  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewTitle.trim()) return;

    const newRew: Reward = {
      id: 'rew_' + Date.now(),
      title: rewTitle,
      cost: Number(rewCost),
      target: rewTarget,
      description: rewDesc || 'Prêmio cadastrado para engajamento do aluno.',
      createdBy: currentUser.name
    };

    const updated = [...rewards, newRew];
    setRewards(updated);
    saveGamificationData('se_g_rewards', updated);

    setRewTitle('');
    setRewDesc('');
    setIsNewRewardOpen(false);
  };

  const handleDeleteReward = (id: string) => {
    const updated = rewards.filter(r => r.id !== id);
    setRewards(updated);
    saveGamificationData('se_g_rewards', updated);
  };

  // Create team
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || selectedTeamMembers.length === 0) return;

    const newTeam: Team = {
      id: 'team_' + Date.now(),
      name: teamName,
      studentIds: selectedTeamMembers,
      points: 0
    };

    const updated = [...teams, newTeam];
    setTeams(updated);
    saveGamificationData('se_g_teams', updated);

    setTeamName('');
    setSelectedTeamMembers([]);
    setIsNewTeamOpen(false);
  };

  // Save student customizable avatar
  const handleSaveAvatar = (newConfig: AvatarConfig) => {
    const updatedAvatars = {
      ...avatars,
      [currentUser.role === 'parent' ? resolvedChild.id : currentUser.id]: newConfig
    };
    setAvatars(updatedAvatars);
    saveGamificationData('se_g_student_avatars', updatedAvatars);

    const targetStudentName = currentUser.role === 'parent' ? resolvedChild.name : currentUser.name;

    // Audit Log
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_g_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: 'Estilo de Monstrinho',
      target: targetStudentName,
      timestamp: new Date().toISOString(),
      details: `${currentUser.name} atualizou a personalização do seu monstrinho mascote.`
    });
    setStoredAudits(audits);

    // Floating animation
    setCelebrationText('Mascote Monstrinho Salvo com Sucesso! 🌟');
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  // Student redeems reward
  const handleRedeemReward = (reward: Reward) => {
    const activeStudentUser = currentUser.role === 'student' ? currentUser : resolvedChild;

    if ((activeStudentUser.points || 0) < reward.cost) {
      alert(`Pontos insuficientes! Você precisa de ${reward.cost} pontos e atualmente possui ${activeStudentUser.points || 0}.`);
      return;
    }

    // Deduct points from student user
    const allUsers = getStoredUsers();
    const updatedUsers = allUsers.map(u => {
      if (u.id === activeStudentUser.id) {
        return { ...u, points: Math.max(0, (u.points || 0) - reward.cost) };
      }
      return u;
    });
    setStoredUsers(updatedUsers);
    setStudents(updatedUsers.filter(u => u.role === 'student'));

    // Trigger onUpdateUser callback to refresh main sidebar/header instantly
    if (currentUser.role === 'student') {
      const meUpdated = updatedUsers.find(u => u.id === currentUser.id);
      if (meUpdated && onUpdateUser) onUpdateUser(meUpdated);
    }

    // Register Redemption request
    const newRedemption: Redemption = {
      id: 'red_' + Date.now(),
      rewardId: reward.id,
      rewardTitle: reward.title,
      studentId: activeStudentUser.id,
      studentName: activeStudentUser.name,
      cost: reward.cost,
      date: new Date().toISOString(),
      status: 'pending',
      target: reward.target
    };

    const updatedReds = [newRedemption, ...redemptions];
    setRedemptions(updatedReds);
    saveGamificationData('se_g_redemptions', updatedReds);

    // Points Log transaction
    const newTx: PointTransaction = {
      id: 'tx_g_red_' + Date.now(),
      studentId: activeStudentUser.id,
      studentName: activeStudentUser.name,
      points: -reward.cost,
      category: 'trabalho',
      reason: `Resgate do prêmio: "${reward.title}" (Aguardando aprovação)`,
      date: new Date().toISOString(),
      awardedBy: reward.target === 'school' ? 'Docente' : 'Família'
    };
    const updatedTxs = [newTx, ...pointsLog];
    setPointsLog(updatedTxs);
    setStoredPoints(updatedTxs);

    alert(`Solicitação de resgate enviada! O prêmio "${reward.title}" será liberado assim que o ${reward.target === 'school' ? 'professor' : 'responsável'} aprovar.`);
  };

  // Approve or Decline redemptions
  const handleResolveRedemption = (red: Redemption, status: 'approved' | 'declined') => {
    const updatedReds = redemptions.map(r => {
      if (r.id === red.id) {
        return { ...r, status };
      }
      return r;
    });
    setRedemptions(updatedReds);
    saveGamificationData('se_g_redemptions', updatedReds);

    // If declined, refund points to student
    if (status === 'declined') {
      const allUsers = getStoredUsers();
      const updatedUsers = allUsers.map(u => {
        if (u.id === red.studentId) {
          return { ...u, points: (u.points || 0) + red.cost };
        }
        return u;
      });
      setStoredUsers(updatedUsers);
      setStudents(updatedUsers.filter(u => u.role === 'student'));

      // Refund transaction log
      const newTx: PointTransaction = {
        id: 'tx_refund_' + Date.now(),
        studentId: red.studentId,
        studentName: red.studentName,
        points: red.cost,
        category: 'participacao',
        reason: `Reembolso: Resgate recusado de "${red.rewardTitle}"`,
        date: new Date().toISOString(),
        awardedBy: currentUser.name
      };
      const updatedTxs = [newTx, ...pointsLog];
      setPointsLog(updatedTxs);
      setStoredPoints(updatedTxs);
    }

    // Audit logs
    const audits = getStoredAudits();
    audits.unshift({
      id: 'aud_g_' + Date.now(),
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action: status === 'approved' ? 'Aprovação de Resgate' : 'Recusa de Resgate',
      target: `${red.studentName} (${red.rewardTitle})`,
      timestamp: new Date().toISOString(),
      details: `Resgate do prêmio "${red.rewardTitle}" para ${red.studentName} foi ${status === 'approved' ? 'APROVADO' : 'RECUSADO'} por ${currentUser.name}.`
    });
    setStoredAudits(audits);
  };

  // Toggle selection for multiple student group creation
  const toggleSelectTeamMember = (id: string) => {
    if (selectedTeamMembers.includes(id)) {
      setSelectedTeamMembers(prev => prev.filter(x => x !== id));
    } else {
      setSelectedTeamMembers(prev => [...prev, id]);
    }
  };

  // Get student's overall achievements count by filtering positive transactions
  const getCompetencyStats = (studentId: string) => {
    const studentTxs = pointsLog.filter(tx => tx.studentId === studentId && tx.points > 0);
    const stats: Record<string, number> = {};
    studentTxs.forEach(tx => {
      const reasonPrefix = tx.reason.substring(0, 2); // Extract emoji icon if exists
      const cat = tx.reason || 'Conquista Geral';
      stats[cat] = (stats[cat] || 0) + tx.points;
    });
    return stats;
  };

  // ----------------------------------------
  // SUB-RENDERS BASED ON SELECTIONS
  // ----------------------------------------
  return (
    <div className="space-y-6" id="gamification-center-container">
      
      {/* 1. FLOATING ACHIEVEMENT CELEBRATION */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ scale: 0.3, opacity: 0, y: 80 }}
            animate={{ scale: 1, opacity: 1, y: -40 }}
            exit={{ scale: 0.8, opacity: 0, y: -120 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          >
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-xl py-4.5 px-8 rounded-full shadow-2xl border-4 border-white flex items-center gap-3 animate-pulse">
              <Sparkles className="h-6 w-6 fill-white animate-spin" style={{ animationDuration: '3s' }} />
              <span>{celebrationText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. TAB CONTROLS */}
      <div className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500 fill-amber-100" />
            Arena do Engajamento e Recompensas
          </h1>
          <p className="text-xs text-slate-500">Mecânicas de gamificação pedagógica saudáveis, avatares mascotes e acompanhamento familiar.</p>
        </div>

        {/* Dynamic Nav Sub-tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100/80 w-full md:w-auto">
          {currentUser.role === 'teacher' && (
            <>
              <button
                id="g-tab-action"
                onClick={() => setActiveSubTab('action')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'action' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Distribuir Pontos
              </button>
              <button
                id="g-tab-setup"
                onClick={() => setActiveSubTab('setup')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'setup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Competências
              </button>
              <button
                id="g-tab-rewards"
                onClick={() => setActiveSubTab('rewards')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'rewards' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Loja & Resgastes
              </button>
            </>
          )}

          {currentUser.role === 'student' && (
            <>
              <button
                id="g-tab-avatar"
                onClick={() => setActiveSubTab('avatar')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'avatar' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Meu Monstrinho
              </button>
              <button
                id="g-tab-student-score"
                onClick={() => setActiveSubTab('student-score')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'student-score' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Minhas Conquistas
              </button>
              <button
                id="g-tab-student-rewards"
                onClick={() => setActiveSubTab('student-rewards')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'student-rewards' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Resgatar Prêmios
              </button>
            </>
          )}

          {currentUser.role === 'parent' && (
            <>
              <button
                id="g-tab-parent-avatar"
                onClick={() => setActiveSubTab('avatar')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'avatar' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Mascote do Filho
              </button>
              <button
                id="g-tab-parent-home"
                onClick={() => setActiveSubTab('home')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'home' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/50'}`}
              >
                Points At Home (Familiar)
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. SUBTAB CONTENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- TEACHER VIEW: DISTRIBUTE POINTS (TAP 1 & 2 + TEAMS) --- */}
        {activeSubTab === 'action' && currentUser.role === 'teacher' && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Quick explanation banner */}
            <div className="bg-blue-50/60 p-5 rounded-3xl border border-blue-100/50 text-xs text-slate-600 leading-relaxed flex gap-3.5">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-900 block font-black mb-1">Mecânica de Dois Toques (2-Tap Console)</strong>
                Selecione um estudante ou uma equipe colaborativa abaixo para habilitar o console lateral e creditar/debitar estrelas associadas a uma competência pedagógica específica.
              </div>
            </div>

            {/* Tap 1: Select Student Card Grid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Selecione o Estudante
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {students.map((student) => {
                  const studentAvatarConfig = avatars[student.id] || { color: 'indigo', expression: 'happy', accessory: 'none', background: 'solid' };
                  const isSelected = selectedStudent?.id === student.id;

                  return (
                    <button
                      key={student.id}
                      id={`teacher-g-stud-${student.id}`}
                      onClick={() => { setSelectedStudent(student); setSelectedTeam(null); }}
                      className={`p-4 text-left rounded-2xl border transition-all flex items-center gap-3.5 relative overflow-hidden cursor-pointer group ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/10' 
                          : 'border-slate-100 bg-slate-50/20 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Little SVG Monstrinho preview on card */}
                      <div className="w-10 h-10 shrink-0">
                        <Monstrinho config={studentAvatarConfig} className="w-full h-full rounded-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.grade}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {student.points || 0}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tap 1.1: Collaborative Teams Selection */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-slate-400" />
                  Selecione uma Equipe (Trabalho em Grupo)
                </h2>
                <button
                  id="btn-open-create-team"
                  onClick={() => setIsNewTeamOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Criar Equipe
                </button>
              </div>

              {teams.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum time cadastrado ainda.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teams.map((team) => {
                    const isSelected = selectedTeam?.id === team.id;
                    return (
                      <button
                        key={team.id}
                        id={`teacher-g-team-${team.id}`}
                        onClick={() => { setSelectedTeam(team); setSelectedStudent(null); }}
                        className={`p-4 text-left rounded-2xl border transition-all flex items-center justify-between relative overflow-hidden cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/10' 
                            : 'border-slate-100 bg-slate-50/20 hover:border-slate-200 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{team.name}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-medium">Membros: {team.studentIds.length} estudantes</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl">
                            {team.points} pts
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- TEACHER VIEW: COMPETENCY SETUP LISTS --- */}
        {activeSubTab === 'setup' && currentUser.role === 'teacher' && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Regras de Competências Ativas</h2>
                <button
                  id="btn-open-new-competency"
                  onClick={() => setIsNewCompetencyOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Parâmetro
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {competencies.map((comp) => (
                  <div key={comp.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl p-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                        {comp.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900">{comp.name}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            comp.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {comp.type === 'positive' ? 'Positivo' : 'Alerta'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-md">{comp.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                        comp.type === 'positive' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                      }`}>
                        {comp.type === 'positive' ? `+${comp.points}` : `-${comp.points}`} estrelas
                      </span>

                      {/* Protect defaults */}
                      {!['c1', 'c2', 'c3', 'c4', 'c5'].includes(comp.id) && (
                        <button
                          id={`btn-del-comp-${comp.id}`}
                          onClick={() => handleDeleteCompetency(comp.id, comp.name)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TEACHER VIEW: REWARDS & STUDENT REDEMPTIONS MANAGER --- */}
        {activeSubTab === 'rewards' && currentUser.role === 'teacher' && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Redemptions requests queue */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 text-blue-500" />
                Fila de Solicitações de Resgate Escolar ({redemptions.filter(r => r.status === 'pending' && r.target === 'school').length})
              </h2>

              <div className="divide-y divide-slate-100">
                {redemptions.filter(r => r.target === 'school').length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">Nenhuma solicitação de resgate pendente de aprovação docente.</p>
                ) : (
                  redemptions.filter(r => r.target === 'school').map((red) => (
                    <div key={red.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">
                          {red.studentName} <span className="font-normal text-slate-400">solicitou resgate de:</span> <span className="text-blue-600 font-bold">{red.rewardTitle}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Custo: {red.cost} estrelas • Data: {new Date(red.date).toLocaleDateString('pt-BR')}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {red.status === 'pending' ? (
                          <>
                            <button
                              id={`btn-decline-red-${red.id}`}
                              onClick={() => handleResolveRedemption(red, 'declined')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-all"
                            >
                              Recusar
                            </button>
                            <button
                              id={`btn-approve-red-${red.id}`}
                              onClick={() => handleResolveRedemption(red, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all"
                            >
                              Aprovar!
                            </button>
                          </>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            red.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {red.status === 'approved' ? 'Aprovado' : 'Recusado'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* General Rewards store setup */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Catálogo de Prêmios Ativos (Sala & Casa)</h2>
                <button
                  id="btn-open-new-reward"
                  onClick={() => setIsNewRewardOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Prêmio
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {rewards.map((rew) => (
                  <div key={rew.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900">{rew.title}</h4>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                          rew.target === 'school' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {rew.target === 'school' ? 'Sala de Aula' : 'Points At Home'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{rew.description}</p>
                      <p className="text-[9px] text-slate-400 mt-1">Definido por: {rew.createdBy}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                        {rew.cost} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      </span>
                      {!['r1', 'r2', 'r3', 'r4', 'r5'].includes(rew.id) && (
                        <button
                          id={`btn-del-rew-${rew.id}`}
                          onClick={() => handleDeleteReward(rew.id)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- STUDENT VIEW: CUSTOMIZE MONSTRINHO AVATAR --- */}
        {activeSubTab === 'avatar' && (
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            
            {/* Left: Dynamic Monster Preview */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <Monstrinho config={myAvatar} className="w-56 h-56 md:w-64 md:h-64 rounded-3xl" />
              <div className="text-center">
                <h3 className="text-sm font-black text-slate-900">Seu Monstrinho Companheiro</h3>
                <p className="text-[10px] text-slate-400 mt-1">Este monstrinho reflete sua evolução pedagógica no portal.</p>
              </div>
            </div>

            {/* Right: Controls & Presets (Only editable if user is student or parent editing child) */}
            <div className="space-y-5">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-emerald-500" /> Personalize seu Mascote
              </h3>

              {/* Color selectors */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cor do Corpo</label>
                <div className="flex gap-2">
                  {['emerald', 'purple', 'indigo', 'amber', 'pink', 'sky'].map((col) => (
                    <button
                      key={col}
                      id={`col-btn-${col}`}
                      onClick={() => setMyAvatar(prev => ({ ...prev, color: col }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        myAvatar.color === col ? 'scale-110 ring-2 ring-emerald-500/20' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: 
                          col === 'emerald' ? '#10b981' : 
                          col === 'purple' ? '#a855f7' : 
                          col === 'indigo' ? '#6366f1' : 
                          col === 'amber' ? '#f59e0b' : 
                          col === 'pink' ? '#ec4899' : '#0ea5e9'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Expression selectors */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expressão / Humor</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'happy', label: 'Contente' },
                    { id: 'star', label: 'Estrela' },
                    { id: 'chill', label: 'Estilo' },
                    { id: 'cute', label: 'Fofo' },
                    { id: 'wonder', label: 'Curioso' },
                  ].map((exp) => (
                    <button
                      key={exp.id}
                      id={`exp-btn-${exp.id}`}
                      onClick={() => setMyAvatar(prev => ({ ...prev, expression: exp.id }))}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                        myAvatar.expression === exp.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories selectors */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Acessório</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'none', label: 'Nenhum' },
                    { id: 'cap', label: 'Formatura' },
                    { id: 'crown', label: 'Coroa' },
                    { id: 'headphones', label: 'Fones' },
                    { id: 'glasses', label: 'Estrelas' },
                    { id: 'bow', label: 'Gravata' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      id={`acc-btn-${acc.id}`}
                      onClick={() => setMyAvatar(prev => ({ ...prev, accessory: acc.id }))}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                        myAvatar.accessory === acc.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background selectors */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ambiente de Fundo</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'solid', label: 'Vácuo Escuro' },
                    { id: 'stars', label: 'Estelar' },
                    { id: 'sunburst', label: 'Solar' },
                    { id: 'sparkles', label: 'Esmeralda' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      id={`bg-btn-${bg.id}`}
                      onClick={() => setMyAvatar(prev => ({ ...prev, background: bg.id }))}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                        myAvatar.background === bg.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Save Button */}
              <button
                id="btn-save-custom-avatar"
                onClick={() => handleSaveAvatar(myAvatar)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Salvar Customização de Mascote
              </button>
            </div>
          </div>
        )}

        {/* --- STUDENT VIEW: INDIVIDUAL CONQUEST LOGS --- */}
        {activeSubTab === 'student-score' && currentUser.role === 'student' && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Overview level and metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level Escolar</p>
                  <p className="text-xl font-black text-slate-900 mt-1">Nível {(Math.floor((currentUser.points || 0) / 50)) + 1}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Próximo nível em {50 - ((currentUser.points || 0) % 50)} pontos.</p>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-500 border border-emerald-100">
                  <Flame className="h-6 w-6 fill-emerald-500 text-emerald-500" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patamar ClassDojo</p>
                  <p className="text-xl font-black text-amber-500 mt-1">
                    {currentUser.points && currentUser.points >= 200 ? 'Lenda de Curitiba' : currentUser.points && currentUser.points >= 150 ? 'Ouro Escolar' : 'Ativo'}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">Baseado nas estrelas de comportamento acumuladas.</p>
                </div>
                <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-500 border border-amber-100">
                  <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Core logs of earned stars */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Seu Extrato de Estrelas Adquiridas</h2>
              
              <div className="divide-y divide-slate-100">
                {pointsLog.filter(tx => tx.studentId === currentUser.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">Você ainda não recebeu estrelas de feedback.</p>
                ) : (
                  pointsLog.filter(tx => tx.studentId === currentUser.id).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{p.reason}</p>
                        <p className="text-[10px] text-slate-400">Atribuído por: {p.awardedBy} em {new Date(p.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`inline-flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-lg ${
                          p.points > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {p.points > 0 ? `+${p.points}` : p.points} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- STUDENT VIEW: REDEEM SCHOOL & DOMESTIC REWARDS --- */}
        {activeSubTab === 'student-rewards' && currentUser.role === 'student' && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Quick Balance */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-3xl text-white flex justify-between items-center shadow-md">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Saldo Disponível para Troca</p>
                <p className="text-3xl font-black mt-1">{currentUser.points || 0} Estrelas</p>
              </div>
              <Sparkles className="h-8 w-8 text-emerald-200 fill-emerald-100 opacity-60 animate-pulse" />
            </div>

            {/* Reward exchange list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Prêmios Disponíveis no Catálogo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((rew) => {
                  const isAffordable = (currentUser.points || 0) >= rew.cost;
                  return (
                    <div key={rew.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-black text-slate-900 leading-tight">{rew.title}</h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            rew.target === 'school' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {rew.target === 'school' ? 'Sala' : 'Casa'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{rew.description}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-slate-200/50 pt-3">
                        <span className="text-xs font-black text-amber-600 flex items-center gap-0.5">
                          {rew.cost} <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        </span>

                        <button
                          id={`btn-redeem-${rew.id}`}
                          onClick={() => handleRedeemReward(rew)}
                          disabled={!isAffordable}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            isAffordable 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm shadow-emerald-600/10' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {isAffordable ? 'Trocar Estrelas!' : 'Estrelas Insuficientes'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending redemptions list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Histórico de Resgates Enviados</h2>
              <div className="space-y-2">
                {redemptions.filter(r => r.studentId === currentUser.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Nenhum prêmio trocado ainda.</p>
                ) : (
                  redemptions.filter(r => r.studentId === currentUser.id).map((red) => (
                    <div key={red.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{red.rewardTitle}</p>
                        <p className="text-[10px] text-slate-400">Data: {new Date(red.date).toLocaleDateString('pt-BR')} • Canal: {red.target === 'school' ? 'Docente' : 'Família'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        red.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                        red.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {red.status === 'approved' ? 'Aprovado!' : red.status === 'declined' ? 'Recusado' : 'Aguardando aprovação'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- PARENT VIEW: POINTS AT HOME (CLASSDOJO PLUS REFORÇO DOMÉSTICO) --- */}
        {activeSubTab === 'home' && currentUser.role === 'parent' && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Introductory Info Banner */}
            <div className="bg-purple-50 border border-purple-100 p-5 rounded-3xl text-xs text-slate-600 leading-relaxed flex gap-3.5">
              <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-purple-950 block font-black mb-1">Recurso Premium: Points At Home (ClassDojo Plus)</strong>
                Aproveite o ambiente residencial para incentivar a rotina de estudos do seu filho! Defina desafios caseiros (arrumar quarto, dever de casa) e resgate prêmios familiares exclusivos com estrelas escolares.
              </div>
            </div>

            {/* Award Points at Home console */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Atribuir Estrela de Rotina Familiar</h2>
              
              <div className="flex items-center gap-3 bg-purple-50/40 p-3 rounded-2xl border border-purple-100/40">
                <Monstrinho config={avatars[resolvedChild.id] || { color: 'indigo', expression: 'happy', accessory: 'none', background: 'solid' }} className="w-11 h-11 rounded-xl" />
                <div>
                  <p className="text-xs font-black text-slate-900">Aplicar em: {resolvedChild.name}</p>
                  <p className="text-[10px] text-purple-800 font-bold">Saldo do Filho: {resolvedChild.points || 0} estrelas</p>
                </div>
              </div>

              {/* Point giving triggers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { name: 'Arrumar o Quarto 🧹', pts: 5, desc: 'Organizou pertences e manteve higiene.' },
                  { name: 'Dever de Casa Concluído 📚', pts: 10, desc: 'Realizou tarefas sem necessidade de cobrança.' },
                  { name: 'Cuidado e Empatia em Casa 🌱', pts: 5, desc: 'Ajudou irmãos ou pais voluntariamente.' },
                  { name: 'Higiene e Sono no Horário 😴', pts: 5, desc: 'Escovou dentes e foi dormir pontualmente.' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    id={`btn-home-award-${idx}`}
                    onClick={() => {
                      const mockCompetency: Competency = {
                        id: 'c_home_' + idx,
                        name: item.name,
                        type: 'positive',
                        points: item.pts,
                        icon: '🏠',
                        description: item.desc
                      };
                      handleAwardPointsToStudent(resolvedChild, mockCompetency);
                    }}
                    className="p-3 bg-slate-50 border border-slate-100 hover:border-purple-300 hover:bg-purple-50/20 rounded-2xl text-left flex flex-col justify-between gap-3 group transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-purple-900 transition-colors">{item.name}</span>
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-lg w-fit">+{item.pts} pts</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Domestic redemption approves */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Aprovar Prêmios Residenciais Solicitados</h2>
              <div className="divide-y divide-slate-100">
                {redemptions.filter(r => r.studentId === resolvedChild.id && r.target === 'home').length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Seu filho ainda não solicitou troca de estrelas por prêmios caseiros.</p>
                ) : (
                  redemptions.filter(r => r.studentId === resolvedChild.id && r.target === 'home').map((red) => (
                    <div key={red.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">
                          {red.studentName} quer trocar <span className="text-purple-600 font-bold">{red.cost} estrelas</span> por: <strong className="text-slate-900">{red.rewardTitle}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Data: {new Date(red.date).toLocaleDateString('pt-BR')}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {red.status === 'pending' ? (
                          <>
                            <button
                              id={`btn-parent-reject-${red.id}`}
                              onClick={() => handleResolveRedemption(red, 'declined')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-[10px]"
                            >
                              Negar
                            </button>
                            <button
                              id={`btn-parent-approve-${red.id}`}
                              onClick={() => handleResolveRedemption(red, 'approved')}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px]"
                            >
                              Aprovar!
                            </button>
                          </>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            red.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {red.status === 'approved' ? 'Liberado!' : 'Negado'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- DYNAMIC SIDEBAR CONSOLE (TAP 2 INTERACTIVE COMPONENT) --- */}
        {activeSubTab === 'action' && currentUser.role === 'teacher' && (
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              {selectedStudent ? (
                <motion.div
                  key="stud-giver"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border border-amber-200 p-6 rounded-3xl shadow-lg relative overflow-hidden"
                  id="teacher-score-console-g"
                >
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="h-5 w-5 text-amber-500" />
                    Console de Atribuição
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-4">Escolha uma competência ativa para creditar estrelas a este estudante.</p>

                  <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-2xl mb-4">
                    <Monstrinho config={avatars[selectedStudent.id] || { color: 'indigo', expression: 'happy', accessory: 'none', background: 'solid' }} className="w-10 h-10 rounded-xl" />
                    <div>
                      <p className="text-xs font-black text-slate-900">{selectedStudent.name}</p>
                      <p className="text-[9px] text-amber-800 font-semibold">Turma: {selectedStudent.grade}</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Competências Disponíveis</label>
                      <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {competencies.map((comp) => (
                          <button
                            key={comp.id}
                            id={`comp-btn-select-${comp.id}`}
                            onClick={() => handleAwardPointsToStudent(selectedStudent, comp)}
                            className="p-2.5 text-left text-xs font-bold rounded-xl border border-slate-100 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/10 transition-all flex items-center justify-between cursor-pointer group"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="text-base shrink-0">{comp.icon}</span>
                              <span className="truncate text-slate-800 group-hover:text-amber-900 transition-colors">{comp.name}</span>
                            </span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                              comp.type === 'positive' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {comp.type === 'positive' ? `+${comp.points}` : `-${comp.points}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nota Justificativa (Opcional)</label>
                      <input
                        id="tx-reason-custom"
                        type="text"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Ex: Resposta brilhante sobre fotossíntese."
                        className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 bg-slate-50/50"
                      />
                    </div>

                    <button
                      id="btn-cancel-select-stud"
                      onClick={() => { setSelectedStudent(null); setCustomReason(''); }}
                      className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs transition-colors"
                    >
                      Cancelar Seleção
                    </button>
                  </div>
                </motion.div>
              ) : selectedTeam ? (
                <motion.div
                  key="team-giver"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border border-indigo-200 p-6 rounded-3xl shadow-lg relative overflow-hidden"
                  id="teacher-score-console-team"
                >
                  <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider mb-2">Recompensar Equipe</h3>
                  <p className="text-[10px] text-slate-400 mb-4">Escolha uma competência colaborativa para bonificar todos os membros simultaneamente.</p>

                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-4">
                    <p className="text-xs font-black text-slate-900">{selectedTeam.name}</p>
                    <p className="text-[9px] text-indigo-800 font-semibold">Alunos integrados: {selectedTeam.studentIds.length}</p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Competências Coletivas</label>
                      <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {competencies.filter(c => c.type === 'positive').map((comp) => (
                          <button
                            key={comp.id}
                            id={`team-comp-btn-${comp.id}`}
                            onClick={() => handleAwardTeamPoints(selectedTeam, comp)}
                            className="p-2.5 text-left text-xs font-bold rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/10 transition-all flex items-center justify-between cursor-pointer group"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span className="text-base shrink-0">{comp.icon}</span>
                              <span className="truncate text-slate-800 group-hover:text-indigo-900 transition-colors">{comp.name}</span>
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                              +{comp.points}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Justificativa do Grupo</label>
                      <input
                        id="tx-reason-team-custom"
                        type="text"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Ex: Excelente sinergia no projeto de maquetes."
                        className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 bg-slate-50/50"
                      />
                    </div>

                    <button
                      id="btn-cancel-select-team"
                      onClick={() => { setSelectedTeam(null); setCustomReason(''); }}
                      className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs transition-colors"
                    >
                      Cancelar Seleção
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                  <Award className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold">Aguardando Seleção</p>
                  <p className="text-[10px] mt-1">Toque em qualquer estudante ou equipe colaborativa no painel lateral para habilitar ações rápidas.</p>
                </div>
              )}
            </AnimatePresence>

            {/* Pedagogy Safeguards box (Curitiba style) */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl mt-6 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                Guia Pedagógico de Cuidados
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ao utilizar pontuações na rede de Curitiba, observe estas recomendações recomendadas pelas melhores práticas educacionais:
              </p>
              <div className="space-y-2.5 text-[10px]">
                <div className="p-2.5 bg-rose-50/40 rounded-xl border border-rose-100/30">
                  <strong className="text-rose-900 block font-bold mb-0.5">⚠️ Evite Estigmas e Rotulação</strong>
                  A pontuação não deve rotular alunos. Prefira feedbacks descritivos detalhados. Use estrelas negativas com extrema moderação.
                </div>
                <div className="p-2.5 bg-amber-50/40 rounded-xl border border-amber-100/30">
                  <strong className="text-amber-900 block font-bold mb-0.5">📶 Desigualdade de Acesso</strong>
                  Nem todos os responsáveis acessam redes de internet a todo momento. Combine feedbacks digitais com conversas presenciais nas reuniões de pais.
                </div>
                <div className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-100/30">
                  <strong className="text-blue-900 block font-bold mb-0.5">🛡️ Consentimento e Privacidade</strong>
                  Certifique-se de recolher o termo de autorização assinado pelos responsáveis antes de compartilhar imagens de alunos em portfólios compartilhados ou feeds públicos.
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- DYNAMIC SIDEBAR PREVIEW FOR STUDENTS --- */}
        {['student-score', 'student-rewards'].includes(activeSubTab) && currentUser.role === 'student' && (
          <div className="lg:col-span-4">
            {/* Visual Avatar preview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5 text-center flex flex-col items-center justify-center">
              <Monstrinho config={avatars[currentUser.id] || { color: 'indigo', expression: 'happy', accessory: 'none', background: 'solid' }} className="w-40 h-40 rounded-3xl" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{currentUser.name}</h3>
                <p className="text-xs text-slate-400">Pontos totais acumulados: <span className="font-bold text-amber-500">{currentUser.points || 0} stars</span></p>
              </div>
              <button
                id="btn-quick-edit-mascote"
                onClick={() => setActiveSubTab('avatar')}
                className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-xl transition-all"
              >
                Personalizar Meu Monstrinho
              </button>
            </div>
          </div>
        )}

        {/* --- DYNAMIC SIDEBAR PREVIEW FOR PARENTS --- */}
        {activeSubTab === 'home' && currentUser.role === 'parent' && (
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
              <Monstrinho config={avatars[resolvedChild.id] || { color: 'indigo', expression: 'happy', accessory: 'none', background: 'solid' }} className="w-40 h-40 rounded-3xl" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{resolvedChild.name}</h3>
                <p className="text-xs text-slate-500">Mascote Monstrinho do Filho</p>
              </div>
              <button
                id="btn-parent-mascote-edit"
                onClick={() => setActiveSubTab('avatar')}
                className="py-1.5 px-4 bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold rounded-xl transition-all w-full"
              >
                Ajudar a customizar o monstrinho
              </button>
            </div>
          </div>
        )}

      </div>

      {/* --- DIALOGS & MODAL BOXES --- */}
      
      {/* 1. Modal: Create Competency */}
      <AnimatePresence>
        {isNewCompetencyOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="modal-new-competency">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsNewCompetencyOpen(false)}></div>
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>
                
                <h3 className="text-base font-bold text-slate-900 mb-2">Cadastrar Nova Competência</h3>
                <p className="text-xs text-slate-500 mb-4">Parâmetro de feedback lúdico em tempo real.</p>

                <form onSubmit={handleCreateCompetency} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome da Competência</label>
                    <input
                      id="g-comp-name-input"
                      type="text"
                      required
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="Ex: Trabalho de Campo Integrado"
                      className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tipo</label>
                      <select
                        id="g-comp-type-input"
                        value={compType}
                        onChange={(e) => setCompType(e.target.value as any)}
                        className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <option value="positive">Reconhecimento (+)</option>
                        <option value="negative">Aviso Pedagógico (-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Valor do Peso (Pontos)</label>
                      <input
                        id="g-comp-val-input"
                        type="number"
                        min="1"
                        max="50"
                        value={compVal}
                        onChange={(e) => setCompVal(Number(e.target.value))}
                        className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Emoji do Ícone</label>
                      <select
                        id="g-comp-icon-input"
                        value={compIcon}
                        onChange={(e) => setCompIcon(e.target.value)}
                        className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <option value="🤝">🤝 Colaboração</option>
                        <option value="🧠">🧠 Intelecto</option>
                        <option value="💪">💪 Esforço</option>
                        <option value="🌱">🌱 Crescimento</option>
                        <option value="⚡">⚡ Velocidade</option>
                        <option value="🎨">🎨 Criatividade</option>
                        <option value="⚠️">⚠️ Alerta</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descrição</label>
                    <textarea
                      id="g-comp-desc-input"
                      value={compDesc}
                      onChange={(e) => setCompDesc(e.target.value)}
                      placeholder="Explique os critérios para ganhar ou receber este parecer pedagógico..."
                      rows={2}
                      className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      id="btn-cancel-new-comp"
                      type="button"
                      onClick={() => setIsNewCompetencyOpen(false)}
                      className="w-1/3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs"
                    >
                      Voltar
                    </button>
                    <button
                      id="btn-save-new-comp"
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                    >
                      Criar Parâmetro
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal: Create Reward */}
      <AnimatePresence>
        {isNewRewardOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="modal-new-reward">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsNewRewardOpen(false)}></div>
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

                <h3 className="text-base font-bold text-slate-900 mb-2">Adicionar Novo Prêmio</h3>
                <p className="text-xs text-slate-500 mb-4">Defina prêmios divertidos para incentivar o engajamento saudável.</p>

                <form onSubmit={handleCreateReward} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Título do Prêmio</label>
                    <input
                      id="g-rew-title-input"
                      type="text"
                      required
                      value={rewTitle}
                      onChange={(e) => setRewTitle(e.target.value)}
                      placeholder="Ex: Escolher o Tema do Próximo Quiz"
                      className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Custo (Estrelas)</label>
                      <input
                        id="g-rew-cost-input"
                        type="number"
                        min="5"
                        max="200"
                        value={rewCost}
                        onChange={(e) => setRewCost(Number(e.target.value))}
                        className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ambiente</label>
                      <select
                        id="g-rew-target-input"
                        value={rewTarget}
                        onChange={(e) => setRewTarget(e.target.value as any)}
                        className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <option value="school">Escola (Sala de Aula)</option>
                        <option value="home">Casa (Points At Home)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descrição</label>
                    <textarea
                      id="g-rew-desc-input"
                      value={rewDesc}
                      onChange={(e) => setRewDesc(e.target.value)}
                      placeholder="Escreva as regras para resgate deste prêmio..."
                      rows={2}
                      className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      id="btn-cancel-new-rew"
                      type="button"
                      onClick={() => setIsNewRewardOpen(false)}
                      className="w-1/3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs"
                    >
                      Voltar
                    </button>
                    <button
                      id="btn-save-new-rew"
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                    >
                      Cadastrar Prêmio
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Modal: Create Team */}
      <AnimatePresence>
        {isNewTeamOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="modal-new-team">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsNewTeamOpen(false)}></div>
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 border border-slate-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>

                <h3 className="text-base font-bold text-slate-900 mb-2">Montar Nova Equipe Colaborativa</h3>
                <p className="text-xs text-slate-500 mb-4">Escolha os estudantes e monte um grupo para dinâmicas coletivas de estrelas.</p>

                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome da Equipe</label>
                    <input
                      id="g-team-name-input"
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Ex: Equipe Einstein 💡"
                      className="block w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Integrantes (Selecione ao menos 1)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {students.map(s => {
                        const isSelected = selectedTeamMembers.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            id={`btn-select-member-${s.id}`}
                            type="button"
                            onClick={() => toggleSelectTeamMember(s.id)}
                            className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all truncate flex items-center justify-between cursor-pointer ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold shadow-sm' 
                                : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{s.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      id="btn-cancel-new-team"
                      type="button"
                      onClick={() => setIsNewTeamOpen(false)}
                      className="w-1/3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-xl text-xs"
                    >
                      Voltar
                    </button>
                    <button
                      id="btn-save-new-team"
                      type="submit"
                      disabled={!teamName.trim() || selectedTeamMembers.length === 0}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl text-xs"
                    >
                      Salvar Equipe
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
