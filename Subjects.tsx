import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { gradesAr, termsAr, subjectsAr } from '../data';
import { Subject } from '../types';
import { BookMarked, ChevronRight } from 'lucide-react';

export function Subjects() {
  const { user } = useAuth();
  const { grade, term } = useParams<{ grade: string; term: string }>();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (user.role !== 'teacher' && user.grade !== grade) {
    return <Navigate to="/dashboard" />;
  }

  if (!grade || !term) return null;

  const subjects = Object.entries(subjectsAr) as [Subject, string][];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Helmet>
        <title>أكاديمية جمعة عبد الشفيع | {gradesAr[grade as keyof typeof gradesAr]} - {termsAr[term as keyof typeof termsAr]}</title>
        <meta name="description" content={`أكاديمية جمعة عبد الشفيع - تصفح فروع المادة لـ ${gradesAr[grade as keyof typeof gradesAr]} - ${termsAr[term as keyof typeof termsAr]}.`} />
      </Helmet>
      <div className="mb-8 flex items-center gap-4">
        <Link to="/learning-platform" className="w-10 h-10 bg-bg border border-border-main rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:border-slate-300 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-primary mb-1">المواد الدراسية</h1>
          <p className="text-base text-text-muted">
            {gradesAr[grade as keyof typeof gradesAr]} - {termsAr[term as keyof typeof termsAr]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map(([key, name]) => (
          <Link 
            key={key}
            to={`/lessons/${grade}/${term}/${key}`}
            className="group bg-bg p-6 rounded-2xl shadow-sm border border-border-main hover:border-primary hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 bg-card group-hover:bg-primary text-primary group-hover:text-white rounded-xl flex items-center justify-center mb-4 transition-colors">
              <BookMarked className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">{name}</h3>
            {user.role !== 'teacher' && (
              <div className="w-full bg-card h-1.5 rounded-full overflow-hidden mt-4">
                <div className="bg-gold h-full w-0 transition-all duration-500"></div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
