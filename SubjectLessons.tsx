import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gradesAr, termsAr, subjectsAr } from '../data';
import { Subject } from '../types';
import { PlayCircle, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function SubjectLessons() {
  const { user, progress } = useAuth();
  const { grade, term, subject } = useParams<{ grade: string; term: string; subject: Subject }>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (grade && term && subject && user) {
      const token = localStorage.getItem('token');
      fetch(`/api/lessons?grade=${grade}&term=${term}&subject=${subject}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setLessons(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [grade, term, subject, user]);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (user.role !== 'teacher' && user.grade !== grade) {
    return <Navigate to="/dashboard" />;
  }

  if (!grade || !term || !subject) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Link to={`/subjects/${grade}/${term}`} className="w-10 h-10 bg-bg border border-border-main rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:border-slate-300 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-primary mb-1">{subjectsAr[subject]}</h1>
          <p className="text-base text-text-muted">
            {gradesAr[grade as keyof typeof gradesAr]} - {termsAr[term as keyof typeof termsAr]}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-text-muted font-bold">جاري تحميل الدروس...</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12 bg-bg rounded-2xl border border-border-main text-text-muted font-bold">
            لا توجد دروس متاحة حالياً.
          </div>
        ) : (
          lessons.map((lesson, idx) => {
            const isCompleted = progress?.completedLessons?.includes(lesson.id);
            return (
              <Link
                key={lesson.id}
                to={`/lesson/${lesson.id}`}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border bg-bg transition-all hover:shadow-sm group",
                  isCompleted ? "border-green-200" : "border-border-main hover:border-primary"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                  isCompleted ? "bg-green-50 text-green-600" : "bg-card text-slate-400 group-hover:bg-primary group-hover:text-white"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary">{lesson.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" /> {lesson.durationMinutes} دقيقة
                    </span>
                    {lesson.pdfUrl && lesson.pdfUrl !== '#' && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> ملخص PDF
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm font-semibold text-slate-400 group-hover:text-primary transition-colors">
                  الدرس {idx + 1}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
