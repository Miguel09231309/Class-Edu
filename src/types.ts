export type UserRole = 'teacher' | 'student' | 'parent' | 'admin' | 'visitor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  verified?: boolean;
  points?: number;
  grade?: string;
  avatarUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'permanent' | 'temporary';
  capacity: number;
  scheduleDate?: string; // ISO String
  durationMinutes?: number;
  joinCode: string;
  activeCallId?: string | null;
  description: string;
  subject: string;
  teacherName: string;
}

export interface Participant {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSharingScreen?: boolean;
  speechActivity?: number; // 0 to 100
}

export interface CallSession {
  id: string;
  roomId: string;
  startedAt: string;
  endedAt?: string;
  participants: Participant[];
  recordingUrl?: string;
  isRecording: boolean;
  isMutedAll: boolean;
  activeScreenShareBy?: string | null; // Participant ID
}

export interface Invitation {
  id: string;
  roomId: string;
  roomName: string;
  method: 'email' | 'link' | 'qr';
  recipients?: string[];
  code: string;
  expiration: string; // ISO String or 'Never'
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  studentId: string;
  studentName: string;
  points: number;
  category: 'participacao' | 'trabalho' | 'comportamento' | 'ajuda' | 'criatividade';
  reason: string;
  date: string;
  awardedBy: string;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  mediaType: 'image' | 'document' | 'video';
  mediaUrl: string;
  comments: {
    id: string;
    userName: string;
    role: UserRole;
    text: string;
    date: string;
  }[];
  date: string;
}

export interface PresenceLog {
  id: string;
  studentName: string;
  role: UserRole;
  joinedAt: string;
  leftAt?: string;
  roomName: string;
  status: 'present' | 'absent' | 'late';
}

export interface AuditLog {
  id: string;
  operatorName: string;
  operatorRole: UserRole;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}
