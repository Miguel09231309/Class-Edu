import { User, Room, Invitation, PointTransaction, PortfolioItem, PresenceLog, AuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 't1',
    name: 'Prof. Alexandre Souza',
    email: 'alexandre.souza@escola.edu.br',
    role: 'teacher',
    schoolId: 'sc101',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 't2',
    name: 'Profa. Carla Mendes',
    email: 'carla.mendes@escola.edu.br',
    role: 'teacher',
    schoolId: 'sc101',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 's1',
    name: 'Gabriel Silva',
    email: 'gabriel.silva@estudante.edu.br',
    role: 'student',
    schoolId: 'sc101',
    verified: true,
    points: 150,
    grade: '3º Ano B',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 's2',
    name: 'Ana Costa',
    email: 'ana.costa@estudante.edu.br',
    role: 'student',
    schoolId: 'sc101',
    verified: true,
    points: 210,
    grade: '3º Ano B',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 's3',
    name: 'Lucas Oliveira',
    email: 'lucas.oliveira@estudante.edu.br',
    role: 'student',
    schoolId: 'sc101',
    verified: true,
    points: 95,
    grade: '3º Ano B',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 's4',
    name: 'Beatriz Santos',
    email: 'beatriz.santos@estudante.edu.br',
    role: 'student',
    schoolId: 'sc101',
    verified: true,
    points: 180,
    grade: '1º Ano A',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 's5',
    name: 'Juliana Lima',
    email: 'juliana.lima@estudante.edu.br',
    role: 'student',
    schoolId: 'sc101',
    verified: true,
    points: 130,
    grade: '1º Ano A',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'p1',
    name: 'Mariana Silva',
    email: 'mariana.silva@gmail.com',
    role: 'parent',
    schoolId: 'sc101',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'p2',
    name: 'Carlos Costa',
    email: 'carlos.costa@gmail.com',
    role: 'parent',
    schoolId: 'sc101',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'a1',
    name: 'Miguel',
    email: 'miguel.bespalhok.souza@escola.pr.gov.br',
    role: 'admin',
    schoolId: 'sc101',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'Matemática - 3º Ano B',
    type: 'permanent',
    capacity: 30,
    joinCode: 'MAT3B',
    description: 'Sala de aula regular para discussões sobre álgebra, funções e geometria aplicada.',
    subject: 'Matemática',
    teacherName: 'Prof. Alexandre Souza'
  },
  {
    id: 'r2',
    name: 'Ciências - 1º Ano A',
    type: 'permanent',
    capacity: 25,
    joinCode: 'CIE1A',
    description: 'Aulas regulares sobre o ecossistema terrestre, plantas, animais e preservação.',
    subject: 'Ciências',
    teacherName: 'Profa. Carla Mendes'
  },
  {
    id: 'r3',
    name: 'Plantão de Dúvidas de Física',
    type: 'temporary',
    capacity: 15,
    scheduleDate: '2026-07-01T15:00:00Z',
    durationMinutes: 60,
    joinCode: 'FISDUV',
    description: 'Sessão de reforço sobre cinemática e leis de Newton para a prova trimestral.',
    subject: 'Física',
    teacherName: 'Prof. Alexandre Souza'
  }
];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv1',
    roomId: 'r1',
    roomName: 'Matemática - 3º Ano B',
    method: 'link',
    code: 'https://escola.edu/join/MAT3B',
    expiration: '2026-07-15T00:00:00Z',
    status: 'pending',
    createdAt: '2026-06-29T10:00:00Z'
  },
  {
    id: 'inv2',
    roomId: 'r1',
    roomName: 'Matemática - 3º Ano B',
    method: 'email',
    recipients: ['mariana.silva@gmail.com'],
    code: 'EMAIL_TOKEN_889F',
    expiration: '2026-07-05T00:00:00Z',
    status: 'accepted',
    createdAt: '2026-06-29T11:30:00Z'
  },
  {
    id: 'inv3',
    roomId: 'r2',
    roomName: 'Ciências - 1º Ano A',
    method: 'qr',
    code: 'CIE1A_QR_CODE',
    expiration: 'Never',
    status: 'pending',
    createdAt: '2026-06-30T09:15:00Z'
  }
];

export const INITIAL_PORTFOLIOS: PortfolioItem[] = [
  {
    id: 'port1',
    studentId: 's1',
    studentName: 'Gabriel Silva',
    title: 'Maquete de Frações Geométricas',
    description: 'Criação de uma maquete 3D utilizando papelão e tintas para representar a divisão de frações equivalentes em fatias circulares.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400',
    date: '2026-06-28T14:20:00Z',
    comments: [
      {
        id: 'c1',
        userName: 'Prof. Alexandre Souza',
        role: 'teacher',
        text: 'Excelente trabalho na maquete, Gabriel! Ficou muito fácil entender a representação de 3/4 comparado com 6/8.',
        date: '2026-06-28T16:00:00Z'
      },
      {
        id: 'c2',
        userName: 'Mariana Silva',
        role: 'parent',
        text: 'Fiquei muito orgulhosa de ver o Gabriel se dedicando e colando tudo certinho em casa.',
        date: '2026-06-28T18:30:00Z'
      }
    ]
  },
  {
    id: 'port2',
    studentId: 's2',
    studentName: 'Ana Costa',
    title: 'Relatório sobre Poluição Plástica',
    description: 'Texto dissertativo e gráfico analisando o acúmulo de microplásticos nos oceanos e propostas sustentáveis de substituição de copos na cantina escolar.',
    mediaType: 'document',
    mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
    date: '2026-06-29T10:15:00Z',
    comments: [
      {
        id: 'c3',
        userName: 'Profa. Carla Mendes',
        role: 'teacher',
        text: 'Incrível nível de detalhe no seu relatório, Ana. Sua sugestão sobre a cantina foi levada para a reunião de coordenação hoje!',
        date: '2026-06-29T11:00:00Z'
      }
    ]
  }
];

export const INITIAL_PRESENCE: PresenceLog[] = [
  {
    id: 'pr1',
    studentName: 'Gabriel Silva',
    role: 'student',
    joinedAt: '2026-06-30T09:02:00Z',
    leftAt: '2026-06-30T10:00:00Z',
    roomName: 'Matemática - 3º Ano B',
    status: 'present'
  },
  {
    id: 'pr2',
    studentName: 'Ana Costa',
    role: 'student',
    joinedAt: '2026-06-30T09:00:00Z',
    leftAt: '2026-06-30T10:00:00Z',
    roomName: 'Matemática - 3º Ano B',
    status: 'present'
  },
  {
    id: 'pr3',
    studentName: 'Lucas Oliveira',
    role: 'student',
    joinedAt: '2026-06-30T09:12:00Z',
    leftAt: '2026-06-30T10:00:00Z',
    roomName: 'Matemática - 3º Ano B',
    status: 'late'
  }
];

export const INITIAL_AUDITS: AuditLog[] = [
  {
    id: 'aud1',
    operatorName: 'Miguel',
    operatorRole: 'admin',
    action: 'Criação de Usuário',
    target: 'Profa. Carla Mendes',
    timestamp: '2026-06-25T08:00:00Z',
    details: 'Nova conta docente criada e vinculada à escola ID sc101.'
  },
  {
    id: 'aud2',
    operatorName: 'Prof. Alexandre Souza',
    operatorRole: 'teacher',
    action: 'Atribuição de Pontos',
    target: 'Gabriel Silva (+15 pts)',
    timestamp: '2026-06-28T16:05:00Z',
    details: 'Atribuídos 15 pontos na categoria "Criatividade" pelo projeto Maquete de Frações.'
  },
  {
    id: 'aud3',
    operatorName: 'Prof. Alexandre Souza',
    operatorRole: 'teacher',
    action: 'Geração de Link de Convite',
    target: 'Matemática - 3º Ano B',
    timestamp: '2026-06-29T10:00:00Z',
    details: 'Link de ingresso público gerado com código MAT3B.'
  }
];

export const INITIAL_POINTS: PointTransaction[] = [
  {
    id: 'pt1',
    studentId: 's1',
    studentName: 'Gabriel Silva',
    points: 15,
    category: 'criatividade',
    reason: 'Excelente dedicação e capricho na Maquete de Frações Geométricas.',
    date: '2026-06-28T16:05:00Z',
    awardedBy: 'Prof. Alexandre Souza'
  },
  {
    id: 'pt2',
    studentId: 's2',
    studentName: 'Ana Costa',
    points: 20,
    category: 'participacao',
    reason: 'Participação ativa e debate crítico sobre descarte de plásticos em Ciências.',
    date: '2026-06-29T11:05:00Z',
    awardedBy: 'Profa. Carla Mendes'
  }
];

// Helper functions for localStorage persistence
const getStored = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    return defaultValue;
  }
};

const setStored = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getStoredUsers = () => {
  const users = getStored<User[]>('se_users', INITIAL_USERS);
  let updated = false;
  const migrated = users.map(u => {
    if (u.role === 'admin' && (u.name !== 'Miguel' || u.email !== 'miguel.bespalhok.souza@escola.pr.gov.br')) {
      updated = true;
      return {
        ...u,
        name: 'Miguel',
        email: 'miguel.bespalhok.souza@escola.pr.gov.br',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
      };
    }
    return u;
  });
  if (updated) {
    setStored('se_users', migrated);
    return migrated;
  }
  return users;
};
export const setStoredUsers = (users: User[]) => setStored<User[]>('se_users', users);

export const getStoredRooms = () => getStored<Room[]>('se_rooms', INITIAL_ROOMS);
export const setStoredRooms = (rooms: Room[]) => setStored<Room[]>('se_rooms', rooms);

export const getStoredInvitations = () => getStored<Invitation[]>('se_invitations', INITIAL_INVITATIONS);
export const setStoredInvitations = (invitations: Invitation[]) => setStored<Invitation[]>('se_invitations', invitations);

export const getStoredPortfolios = () => getStored<PortfolioItem[]>('se_portfolios', INITIAL_PORTFOLIOS);
export const setStoredPortfolios = (portfolios: PortfolioItem[]) => setStored<PortfolioItem[]>('se_portfolios', portfolios);

export const getStoredPresence = () => getStored<PresenceLog[]>('se_presence', INITIAL_PRESENCE);
export const setStoredPresence = (presence: PresenceLog[]) => setStored<PresenceLog[]>('se_presence', presence);

export const getStoredAudits = () => getStored<AuditLog[]>('se_audits', INITIAL_AUDITS);
export const setStoredAudits = (audits: AuditLog[]) => setStored<AuditLog[]>('se_audits', audits);

export const getStoredPoints = () => getStored<PointTransaction[]>('se_points', INITIAL_POINTS);
export const setStoredPoints = (points: PointTransaction[]) => setStored<PointTransaction[]>('se_points', points);
