import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { gradesAr, termsAr } from '../data';
import { GraduationCap, BookOpen, ChevronLeft, Calendar } from 'lucide-react';

export function LearningPlatform() {
  const { user } = useAuth();
  const [selectedGradeForTeacher, setSelectedGradeForTeacher] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const allGrades = [
    { key: 'first', label: 'الصف الأول الثانوي', color: 'from-blue-500 to-indigo-600', hoverColor: 'group-hover:text-blue-500' },
    { key: 'second', label: 'الصف الثاني الثانوي', color: 'from-purple-500 to-pink-600', hoverColor: 'group-hover:text-purple-500' },
    { key: 'third', label: 'الصف الثالث الثانوي', color: 'from-amber-500 to-orange-600', hoverColor: 'group-hover:text-amber-500' },
  ];

  const subjectsList = [
    { key: 'grammar', label: 'النحو' },
    { key: 'rhetoric', label: 'البلاغة' },
    { key: 'literature', label: 'الأدب' },
    { key: 'texts', label: 'النصوص' },
    { key: 'reading', label: 'القراءة' },
    { key: 'story', label: 'القصة' },
    { key: 'reviews', label: 'المراجعات' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>أكاديمية جمعة عبد الشفيع | المحتوى الدراسي</title>
        <meta name="description" content="تصفح المحتوى الدراسي في أكاديمية جمعة عبد الشفيع - اختر صفك الدراسي والفصل الدراسي للبدء في التعلم." />
      </Helmet>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-primary mb-3">المحتوى الدراسي</h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          {user.role === 'teacher' 
            ? 'تصفح كافة الفصول والصفوف الدراسية ومتابعة المحتوى التعليمي كطالب.'
            : `أهلاً بك يا ${user.name}. ابدأ دراستك باختيار الفصل الدراسي لصفك الحالي.`}
        </p>
      </div>

      {user.role === 'teacher' ? (
        // Teacher View: Browse all grades and terms
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allGrades.map((g) => (
              <button
                key={g.key}
                onClick={() => setSelectedGradeForTeacher(selectedGradeForTeacher === g.key ? null : g.key)}
                className={`group text-right p-8 bg-bg rounded-3xl border transition-all relative overflow-hidden shadow-sm hover:shadow-md cursor-pointer ${
                  selectedGradeForTeacher === g.key 
                    ? 'border-primary ring-2 ring-primary/10 bg-card/50' 
                    : 'border-border-main hover:border-slate-300'
                }`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${g.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-slate-200`}>
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-primary mb-2">{g.label}</h3>
                <p className="text-text-muted text-sm mb-4">اضغط لتصفح الفصول الدراسية والمناهج المتاحة لهذا الصف.</p>
                <div className="flex items-center text-sm font-bold text-slate-400 group-hover:text-primary transition-colors">
                  عرض المنهج الدراسي <ChevronLeft className="w-4 h-4 mr-1" />
                </div>
              </button>
            ))}
          </div>

          {selectedGradeForTeacher && (
            <div className="bg-bg rounded-3xl border border-border-main p-8 shadow-sm space-y-8 animate-fadeIn">
              <div className="border-b border-border-main pb-4">
                <h3 className="text-2xl font-black text-primary">
                  مناهج {allGrades.find(g => g.key === selectedGradeForTeacher)?.label}
                </h3>
                <p className="text-text-muted text-sm">اختر الفصل الدراسي للبدء بالتصفح</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* First Term */}
                <div className="bg-card rounded-2xl p-6 border border-border-main space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-primary">الفصل الدراسي الأول</h4>
                  </div>
                  <p className="text-text-muted text-sm">يحتوي على فروع النحو، البلاغة، الأدب، النصوص وغيرها للفصل الدراسي الأول.</p>
                  <Link
                    to={`/subjects/${selectedGradeForTeacher}/first`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-bg border border-border-main hover:border-blue-500 text-primary font-bold text-sm rounded-xl hover:bg-blue-50/50 transition-all shadow-sm cursor-pointer"
                  >
                    تصفح فروع الترم الأول <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>

                {/* Second Term */}
                <div className="bg-card rounded-2xl p-6 border border-border-main space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-primary">الفصل الدراسي الثاني</h4>
                  </div>
                  <p className="text-text-muted text-sm">يحتوي على فروع النحو، البلاغة، الأدب، النصوص وغيرها للفصل الدراسي الثاني.</p>
                  <Link
                    to={`/subjects/${selectedGradeForTeacher}/second`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-bg border border-border-main hover:border-green-500 text-primary font-bold text-sm rounded-xl hover:bg-green-50/50 transition-all shadow-sm cursor-pointer"
                  >
                    تصفح فروع الترم الثاني <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Student View: Only assigned grade
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-gradient-to-br from-primary to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg mb-8">
            <BookOpen className="absolute -left-6 -top-6 w-32 h-32 text-white/10 transform -rotate-12" />
            <div className="relative z-10">
              <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-1">الصف الدراسي الحالي</span>
              <h3 className="text-3xl font-black">{gradesAr[user.grade as keyof typeof gradesAr]}</h3>
              <p className="text-slate-300 text-sm mt-2">لقد تم تعيينك لهذا الصف الدراسي من قبل إدارة المنصة.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Term Card */}
            <div className="bg-bg rounded-3xl border border-border-main p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">الفصل الدراسي الأول</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-6">
                  ابدأ تصفح فروع اللغة العربية المقررة عليك في الفصل الدراسي الأول، بما يشمل النحو، البلاغة، والأدب، والمراجعات.
                </p>
              </div>
              <Link
                to={`/subjects/${user.grade}/first`}
                className="w-full py-3.5 bg-primary text-white text-center font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors cursor-pointer block"
              >
                تصفح مناهج الترم الأول
              </Link>
            </div>

            {/* Second Term Card */}
            <div className="bg-bg rounded-3xl border border-border-main p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">الفصل الدراسي الثاني</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-6">
                  ابدأ تصفح فروع اللغة العربية المقررة عليك في الفصل الدراسي الثاني، مع تدريبات ومقاطع شرح مخصصة ومبسطة.
                </p>
              </div>
              <Link
                to={`/subjects/${user.grade}/second`}
                className="w-full py-3.5 bg-primary text-white text-center font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors cursor-pointer block"
              >
                تصفح مناهج الترم الثاني
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
