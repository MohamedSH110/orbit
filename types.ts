export type Role = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  phone: string;
  parentPhone?: string;
  role: Role;
  grade?: GradeLevel;
  progress?: number;
  status?: 'active' | 'disabled';
}

export type GradeLevel = 'first' | 'second' | 'third';
export type Term = 'first' | 'second';
export type Subject = 'grammar' | 'rhetoric' | 'literature' | 'texts' | 'reading' | 'story' | 'reviews';

export interface Lesson {
  id: string;
  title: string;
  subject: Subject;
  term: Term;
  grade: GradeLevel;
  videoUrl: string;
  pdfUrl: string;
  durationMinutes: number;
  description?: string;
}

export interface UserProgress {
  userId: string;
  completedLessons: string[]; // array of lesson IDs
}
