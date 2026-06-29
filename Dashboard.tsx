import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { gradesAr, termsAr, subjectsAr } from '../data';
import { 
  BookOpen, CheckCircle, GraduationCap, PlayCircle, Clock, Calendar, 
  BookMarked, FileText, ChevronLeft, ChevronDown, Award, HelpCircle, 
  Lock, Video, AlertCircle, X, Check, Loader2, ArrowRight, Play, CheckCircle2
} from 'lucide-react';
import { CircularProgress } from '../components/CircularProgress';
import { motion, AnimatePresence } from 'motion/react';

const getAuthenticatedUrl = (url: string) => {
  if (!url) return '';
  if (!url.startsWith('/uploads/')) return url;
  const token = localStorage.getItem('token');
  if (!token) return url;
  return `${url}?token=${encodeURIComponent(token)}`;
};

const subjectsList = [
  { key: 'grammar', label: 'النحو', bg: 'bg-blue-50 text-blue-600 border-blue-100' },
  { key: 'rhetoric', label: 'البلاغة', bg: 'bg-purple-50 text-purple-600 border-purple-100' },
  { key: 'literature', label: 'الأدب', bg: 'bg-amber-50 text-amber-600 border-amber-100' },
  { key: 'texts', label: 'النصوص', bg: 'bg-teal-50 text-teal-600 border-teal-100' },
  { key: 'reading', label: 'القراءة', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { key: 'story', label: 'القصة', bg: 'bg-pink-50 text-pink-600 border-pink-100' },
  { key: 'reviews', label: 'المراجعات', bg: 'bg-rose-50 text-rose-600 border-rose-100' }
];

export function Dashboard() {
  const { user, progress } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Exam Taking & Review States
  const [viewState, setViewState] = useState<'content' | 'taking' | 'result'>('content');
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, number> | null>(null);
  const [loadingQuizDetails, setLoadingQuizDetails] = useState(false);

  const userGrade = user?.grade || 'first';

  // Master Fetch
  const loadData = async () => {
    if (!user || user.role === 'teacher') return;
    const token = localStorage.getItem('token');
    try {
      const [lessonsRes, examsRes, dashboardRes] = await Promise.all([
        fetch(`/api/lessons?grade=${userGrade}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/exams', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (lessonsRes.ok && examsRes.ok && dashboardRes.ok) {
        const lessonsData = await lessonsRes.json();
        const examsData = await examsRes.json();
        const dashboardData = await dashboardRes.json();
        setLessons(lessonsData);
        setExams(examsData);
        setDashboardData(dashboardData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, progress?.completedLessons?.length]);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (user.role === 'teacher') {
    return <Navigate to="/admin" />;
  }

  // Trigger Quiz Taking or Result View
  const handleQuizActionDirect = async (quiz: any) => {
    if (!quiz) return;
    setLoadingQuizDetails(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/exams/${quiz.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const fullQuiz = await res.json();
        setActiveExam(fullQuiz);
        if (fullQuiz.taken) {
          setExamResult(fullQuiz.userResult);
          // Map correct answers
          const correctAns: Record<string, number> = {};
          fullQuiz.questions.forEach((q: any) => {
            correctAns[q.id] = q.correctIndex;
          });
          setCorrectAnswers(correctAns);
          setViewState('result');
        } else {
          setCurrentQuestionIdx(0);
          setSelectedAnswers({});
          setViewState('taking');
        }
      }
    } catch (err) {
      console.error('Error opening quiz directly:', err);
    } finally {
      setLoadingQuizDetails(false);
    }
  };

  // Submit Exam
  const handleSubmitExam = async () => {
    if (!activeExam) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/exams/${activeExam.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: selectedAnswers })
      });

      if (res.ok) {
        const data = await res.json();
        setExamResult(data.userExam);
        setCorrectAnswers(data.correctAnswers);
        setViewState('result');
        // Refresh master dashboard metrics background
        loadData();
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div className="text-text-muted font-bold text-lg">جاري تحميل منهجك الدراسي...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>أكاديمية جمعة عبد الشفيع | لوحة تحكم الطالب</title>
        <meta name="description" content="لوحة تحكم الطالب في أكاديمية جمعة عبد الشفيع - تابع تقدمك الدراسي، نتائج الامتحانات، والدروس المكتملة." />
      </Helmet>
      
      {/* 1. QUIZ TAKING VIEW */}
      {viewState === 'taking' && activeExam && (
        <div className="bg-bg rounded-3xl shadow-md border border-border-main overflow-hidden max-w-4xl mx-auto">
          <div className="p-6 bg-primary text-white flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-1">الاختبار الإلكتروني الذكي</span>
              <h2 className="text-2xl font-extrabold">{activeExam.title}</h2>
            </div>
            <button 
              onClick={() => setViewState('content')}
              className="p-2 bg-bg/10 hover:bg-card/20 rounded-full transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Progress line */}
            <div className="flex items-center justify-between text-sm font-bold text-text-muted border-b border-border-main pb-4">
              <span>السؤال {currentQuestionIdx + 1} من {activeExam.questions.length}</span>
              <span className="text-primary bg-card px-3 py-1 rounded-full">
                {Math.round(((currentQuestionIdx + 1) / activeExam.questions.length) * 100)}% مكتمل
              </span>
            </div>

            {/* Question Card */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-primary leading-relaxed">
                {activeExam.questions[currentQuestionIdx]?.text}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeExam.questions[currentQuestionIdx]?.choices.map((choice: string, idx: number) => {
                  const isSelected = selectedAnswers[activeExam.questions[currentQuestionIdx].id] === idx;
                  const letterBadge = ['أ', 'ب', 'ج', 'د'][idx] || String.fromCharCode(65 + idx);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedAnswers(prev => ({
                        ...prev,
                        [activeExam.questions[currentQuestionIdx].id]: idx
                      }))}
                      className={`p-5 rounded-2xl border text-right transition-all flex items-center gap-4 cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-md font-bold text-primary' 
                          : 'border-border-main hover:border-slate-350 bg-bg hover:bg-card/50 text-text-main'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                        isSelected 
                          ? 'bg-primary text-white' 
                          : 'bg-card text-text-muted'
                      }`}>
                        {letterBadge}
                      </span>
                      <span className="text-base">{choice}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center border-t border-border-main pt-6">
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="px-5 py-2.5 bg-card hover:bg-slate-200 text-text-main font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer text-sm"
              >
                السابق
              </button>

              {currentQuestionIdx < activeExam.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                  className="px-6 py-2.5 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer text-sm"
                >
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> إرسال الإجابات...
                    </>
                  ) : (
                    'إنهاء وإرسال الاختبار'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. QUIZ RESULT DETAIL REVIEW VIEW */}
      {viewState === 'result' && activeExam && examResult && (
        <div className="bg-bg rounded-3xl shadow-md border border-border-main overflow-hidden max-w-4xl mx-auto space-y-8 pb-12">
          {/* Top banner */}
          <div className="p-8 bg-primary text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold via-primary to-primary"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-1">نتائج التقييم الإلكتروني</span>
                <h2 className="text-2xl font-black">{activeExam.title}</h2>
                <p className="text-slate-300 text-sm mt-1">تم تأدية الاختبار بنجاح</p>
              </div>
              <button 
                onClick={() => setViewState('content')}
                className="px-5 py-2 bg-bg text-primary font-bold rounded-xl hover:bg-card transition-colors shadow-sm text-sm cursor-pointer"
              >
                العودة للوحة الإحصائيات
              </button>
            </div>
          </div>

          <div className="px-8 space-y-8">
            {/* Main Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="bg-card rounded-2xl p-6 border border-border-main flex flex-col items-center text-center">
                <span className="text-sm font-bold text-text-muted mb-3">النسبة المئوية</span>
                <CircularProgress 
                  percentage={examResult.score} 
                  size={120} 
                  strokeWidth={8} 
                  colorClass={examResult.score >= 50 ? 'text-green-500' : 'text-amber-500'}
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-green-50/50 rounded-2xl p-5 border border-green-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-muted block">الإجابات الصحيحة</span>
                    <span className="text-2xl font-black text-green-700">{examResult.correctCount}</span>
                  </div>
                </div>

                <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <X className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-muted block">الإجابات الخاطئة</span>
                    <span className="text-2xl font-black text-red-700">{examResult.wrongCount}</span>
                  </div>
                </div>

                <div className="col-span-2 bg-blue-50/30 rounded-2xl p-4 border border-blue-100 text-center">
                  <span className="text-sm font-bold text-text-muted">
                    {examResult.score >= 80 ? '🎉 تفوق ممتاز! واصل مجهودك الرائع.' : 
                     examResult.score >= 50 ? '👍 أحسنت، لقد اجتزت الاختبار بنجاح.' : 
                     '💪 لا تقلق، راجع الدروس وحاول مرة أخرى لتحسين نتيجتك.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions Review Detail */}
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold text-primary flex items-center gap-2 border-b border-border-main pb-3">
                <BookMarked className="w-5 h-5 text-gold" />
                مراجعة وتصحيح الأسئلة التفصيلية
              </h3>

              <div className="space-y-6">
                {activeExam.questions.map((q: any, qIdx: number) => {
                  const studentAns = examResult.answers[q.id];
                  const correctAns = correctAnswers ? correctAnswers[q.id] : q.correctIndex;
                  const isCorrect = studentAns !== undefined && Number(studentAns) === Number(correctAns);

                  return (
                    <div key={q.id} className="p-6 rounded-2xl border border-border-main space-y-4">
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-1 ${
                          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {qIdx + 1}
                        </span>
                        <h4 className="font-bold text-primary text-base leading-relaxed">{q.text}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                        {q.choices.map((choice: string, idx: number) => {
                          const wasSelected = Number(studentAns) === idx;
                          const isRightChoice = Number(correctAns) === idx;

                          let choiceStyle = 'border-border-main bg-bg text-text-main';
                          if (wasSelected) {
                            choiceStyle = isCorrect 
                              ? 'border-green-300 bg-green-50 text-green-800 font-bold' 
                              : 'border-red-300 bg-red-50 text-red-800 font-bold';
                          } else if (isRightChoice) {
                            choiceStyle = 'border-green-300 bg-green-50/50 text-green-800 font-bold';
                          }

                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl border flex items-center gap-3 text-sm ${choiceStyle}`}
                            >
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                wasSelected 
                                  ? (isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white') 
                                  : (isRightChoice ? 'bg-green-600 text-white' : 'bg-card text-text-muted')
                              }`}>
                                {['أ', 'ب', 'ج', 'د'][idx] || String.fromCharCode(65 + idx)}
                              </span>
                              <span>{choice}</span>
                              {wasSelected && (
                                <span className="mr-auto text-xs font-black">إجابتك</span>
                              )}
                              {isRightChoice && !wasSelected && (
                                <span className="mr-auto text-xs text-green-600 font-black flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" /> الإجابة الصحيحة
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back button bottom */}
            <div className="flex justify-center border-t border-border-main pt-8">
              <button
                onClick={() => setViewState('content')}
                className="px-8 py-3 bg-primary hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
              >
                العودة للوحة الإحصائيات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT TREE */}
      {viewState === 'content' && (() => {
        const firstTermLessons = lessons.filter((l: any) => l.term === 'first');
        const firstTermCompleted = firstTermLessons.filter((l: any) => progress?.completedLessons?.includes(l.id));
        const firstTermProgress = firstTermLessons.length > 0 ? Math.round((firstTermCompleted.length / firstTermLessons.length) * 100) : 0;

        const secondTermLessons = lessons.filter((l: any) => l.term === 'second');
        const secondTermCompleted = secondTermLessons.filter((l: any) => progress?.completedLessons?.includes(l.id));
        const secondTermProgress = secondTermLessons.length > 0 ? Math.round((secondTermCompleted.length / secondTermLessons.length) * 100) : 0;

        const lastVisited = (() => {
          try {
            const stored = localStorage.getItem('last_visited_lesson');
            if (stored) {
              const parsed = JSON.parse(stored);
              const exists = lessons.find((l: any) => l.id === parsed.id);
              if (exists) return exists;
            }
          } catch (e) {
            console.error(e);
          }
          return null;
        })();

        const nextLessonToStudy = lastVisited || lessons.find((l: any) => !progress?.completedLessons?.includes(l.id)) || lessons[0];

        const availableReviews = lessons.filter((l: any) => l.subject === 'reviews' || l.title.includes('مراجعة'));

        const recentActivity = (() => {
          const activityList: any[] = [];
          
          lessons.forEach((l: any) => {
            if (progress?.completedLessons?.includes(l.id)) {
              activityList.push({
                type: 'lesson',
                id: l.id,
                title: l.title,
                text: `أكملت دراسة درس "${l.title}"`,
                badge: subjectsAr[l.subject as keyof typeof subjectsAr] || 'مادة',
                color: 'bg-blue-50 text-blue-700'
              });
            }
          });

          exams.forEach((e: any) => {
            if (e.taken) {
              activityList.push({
                type: 'exam',
                id: e.id,
                title: e.title,
                text: `حصلت على درجة ${e.userScore}% في اختبار "${e.title}"`,
                badge: 'تقييم إلكتروني',
                color: 'bg-green-50 text-green-700'
              });
            }
          });

          return activityList.slice(0, 5);
        })();

        const comprehensiveExams = exams.filter((e: any) => !e.lessonId || e.questions.length > 5 || e.title.includes('شامل') || e.title.includes('امتحان'));
        const lessonQuizzes = exams.filter((e: any) => e.lessonId && e.questions.length <= 5 && !e.title.includes('شامل'));

        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Welcoming Header & Profile Summary */}
            <div className="bg-gradient-to-br from-primary to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold via-primary to-primary"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                  <span className="text-xs font-black text-gold uppercase tracking-widest bg-bg/10 px-3 py-1.5 rounded-full">لوحة الطالب والإحصائيات</span>
                  <h1 className="text-4xl font-black">أهلاً بك، {user.name}</h1>
                  <p className="text-lg text-slate-300 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-gold" />
                    الصف الدراسي المسجل: <strong className="text-white">{gradesAr[userGrade]}</strong>
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="bg-bg/10 backdrop-blur-md rounded-2xl px-5 py-3.5 flex items-center gap-3">
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                      <div>
                        <div className="text-xs text-slate-300 font-bold">الدروس المكتملة</div>
                        <div className="text-3xl font-black">{dashboardData.completedCount || 0}</div>
                      </div>
                    </div>
                    <div className="bg-bg/10 backdrop-blur-md rounded-2xl px-5 py-3.5 flex items-center gap-3">
                      <BookOpen className="w-10 h-10 text-blue-400" />
                      <div>
                        <div className="text-xs text-slate-300 font-bold">الدروس المتبقية</div>
                        <div className="text-3xl font-black">{dashboardData.remainingCount || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-bg rounded-3xl p-6 text-primary flex flex-col items-center shadow-2xl shrink-0 border border-border-main">
                  <h3 className="text-sm font-black mb-4 text-text-main text-center">نسبة إنجاز المنهج الكلية</h3>
                  <CircularProgress 
                    percentage={dashboardData.overallPercentage || 0} 
                    size={145} 
                    strokeWidth={10} 
                    colorClass="text-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions & Navigation Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Last Visited Lesson Card */}
              <div className="bg-bg p-6 rounded-3xl border border-border-main shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-2">آخر درس قمت بزيارته</span>
                  {lastVisited ? (
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-primary leading-tight">{lastVisited.title}</h3>
                      <p className="text-sm text-text-muted">
                        {termsAr[lastVisited.term as keyof typeof termsAr]} • {subjectsAr[lastVisited.subject as keyof typeof subjectsAr]}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-400 leading-tight">لا يوجد دروس مستعرضة مؤخراً</h3>
                      <p className="text-sm text-text-muted">ابدأ أولى محاضراتك اليوم لتظهر هنا.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-4 border-t border-border-main">
                  {nextLessonToStudy && (
                    <Link
                      to={`/lesson/${nextLessonToStudy.id}`}
                      className="flex-1 py-3 px-4 bg-primary text-white text-center font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white text-white" />
                      متابعة آخر درس
                    </Link>
                  )}
                  <Link
                    to="/learning-platform"
                    className="flex-1 py-3 px-4 bg-card text-text-main text-center font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    الانتقال للمحتوى الدراسي
                  </Link>
                </div>
              </div>

              {/* Term Progress Statistics */}
              <div className="bg-bg p-6 rounded-3xl border border-border-main shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  تفصيل إنجاز الفصول الدراسية
                </h3>

                <div className="space-y-5">
                  {/* First Term Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-text-main">الفصل الدراسي الأول</span>
                      <span className="text-primary">{firstTermProgress}%</span>
                    </div>
                    <div className="w-full bg-card h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${firstTermProgress}%` }}></div>
                    </div>
                  </div>

                  {/* Second Term Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-text-main">الفصل الدراسي الثاني</span>
                      <span className="text-primary">{secondTermProgress}%</span>
                    </div>
                    <div className="w-full bg-card h-3 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${secondTermProgress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity List */}
              <div className="bg-bg p-6 rounded-3xl border border-border-main shadow-sm space-y-6 lg:col-span-1">
                <h3 className="text-xl font-bold text-primary border-b border-border-main pb-3">النشاط الأخير</h3>
                {recentActivity.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4 text-center">لا توجد أنشطة مسجلة بعد.</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((act, i) => (
                      <div key={i} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0"></div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-text-main leading-tight">{act.text}</p>
                          <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded ${act.color}`}>
                            {act.badge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comprehensive Exam & Quiz Results */}
              <div className="bg-bg p-6 rounded-3xl border border-border-main shadow-sm space-y-8 lg:col-span-2">
                <div>
                  <h3 className="text-xl font-bold text-primary border-b border-border-main pb-3 mb-4">نتائج الامتحانات الشاملة</h3>
                  {comprehensiveExams.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4 text-center">لا توجد امتحانات شاملة مقررة حالياً.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto font-sans">
                        <table className="w-full text-right text-sm">
                          <thead>
                            <tr className="text-slate-400 border-b border-border-main">
                              <th className="pb-3 font-bold text-right">اسم الامتحان</th>
                              <th className="pb-3 font-bold text-right">الترم</th>
                              <th className="pb-3 font-bold text-right">الدرجة</th>
                              <th className="pb-3 font-bold text-left">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {comprehensiveExams.map((exam) => (
                              <tr key={exam.id} className="hover:bg-card/50">
                                <td className="py-3.5 font-bold text-text-main text-right">{exam.title}</td>
                                <td className="py-3.5 text-text-muted text-right">{exam.term === 'first' ? 'الترم الأول' : 'الترم الثاني'}</td>
                                <td className="py-3.5 text-right">
                                  {exam.taken ? (
                                    <span className={`font-black ${exam.userScore >= 50 ? 'text-green-600' : 'text-amber-500'}`}>
                                      {exam.userScore}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">غير محلول</span>
                                  )}
                                </td>
                                <td className="py-3.5 text-left">
                                  <button
                                    onClick={() => handleQuizActionDirect(exam)}
                                    disabled={loadingQuizDetails}
                                    className="text-xs font-bold text-white bg-primary hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer btn-touch"
                                  >
                                    {exam.taken ? 'مراجعة الإجابات' : 'دخول الامتحان'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="grid grid-cols-1 gap-4 md:hidden">
                        {comprehensiveExams.map((exam) => (
                          <div key={exam.id} className="bg-card p-4 rounded-2xl border border-border-main space-y-4">
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <h4 className="font-black text-primary text-base">{exam.title}</h4>
                                <span className="text-xs text-text-muted">{exam.term === 'first' ? 'الترم الأول' : 'الترم الثاني'}</span>
                              </div>
                              <div className="text-left">
                                {exam.taken ? (
                                  <div className={`text-xl font-black ${exam.userScore >= 50 ? 'text-green-600' : 'text-amber-500'}`}>
                                    {exam.userScore}%
                                  </div>
                                ) : (
                                  <span className="text-xs font-bold text-slate-400 italic">لم يتم الحل</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleQuizActionDirect(exam)}
                              disabled={loadingQuizDetails}
                              className="w-full py-3 bg-primary text-white font-black text-sm rounded-xl active:scale-95 transition-transform"
                            >
                              {exam.taken ? 'مراجعة إجاباتك' : 'ابدأ الامتحان الآن'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-primary border-b border-border-main pb-3 mb-4">نتائج الاختبارات القصيرة (Quizzes)</h3>
                  {lessonQuizzes.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4 text-center">لا توجد كويزات أو اختبارات قصيرة مسجلة.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto font-sans">
                        <table className="w-full text-right text-sm">
                          <thead>
                            <tr className="text-slate-400 border-b border-border-main">
                              <th className="pb-3 font-bold text-right">الاختبار القصيرة</th>
                              <th className="pb-3 font-bold text-right">الدرجة</th>
                              <th className="pb-3 font-bold text-left">الإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {lessonQuizzes.map((quiz) => (
                              <tr key={quiz.id} className="hover:bg-card/50">
                                <td className="py-3.5 font-bold text-text-main text-right">{quiz.title}</td>
                                <td className="py-3.5 text-right">
                                  {quiz.taken ? (
                                    <span className={`font-black ${quiz.userScore >= 50 ? 'text-green-600' : 'text-amber-500'}`}>
                                      {quiz.userScore}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">غير محلول</span>
                                  )}
                                </td>
                                <td className="py-3.5 text-left">
                                  <button
                                    onClick={() => handleQuizActionDirect(quiz)}
                                    disabled={loadingQuizDetails}
                                    className="text-xs font-bold text-white bg-primary hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer btn-touch"
                                  >
                                    {quiz.taken ? 'مراجعة الإجابات' : 'دخول الاختبار'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="grid grid-cols-1 gap-4 md:hidden">
                        {lessonQuizzes.map((quiz) => (
                          <div key={quiz.id} className="bg-card p-4 rounded-2xl border border-border-main flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-black text-primary text-sm mb-1">{quiz.title}</h4>
                              {quiz.taken ? (
                                <span className={`text-xs font-black ${quiz.userScore >= 50 ? 'text-green-600' : 'text-amber-500'}`}>
                                  الدرجة: {quiz.userScore}%
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">لم يتم الحل بعد</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleQuizActionDirect(quiz)}
                              disabled={loadingQuizDetails}
                              className="px-4 py-2.5 bg-primary text-white text-xs font-black rounded-xl"
                            >
                              {quiz.taken ? 'مراجعة' : 'دخول'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            {dashboardData.achievements && dashboardData.achievements.length > 0 && (
              <div className="bg-bg p-6 rounded-3xl border border-border-main shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2 border-b border-border-main pb-3">
                  <Award className="w-5 h-5 text-gold" />
                  أوسمة الإنجاز
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {dashboardData.achievements.map((achievement: any) => {
                    let IconComponent = Award;
                    if (achievement.icon === 'flag') IconComponent = BookOpen;
                    if (achievement.icon === 'target') IconComponent = CheckCircle;
                    if (achievement.icon === 'award') IconComponent = Award;
                    if (achievement.icon === 'star') IconComponent = CheckCircle2;
                    if (achievement.icon === 'zap') IconComponent = PlayCircle;
                    if (achievement.icon === 'rocket') IconComponent = ArrowRight;

                    return (
                      <div key={achievement.id} className="bg-card p-4 rounded-2xl border border-border-main flex flex-col items-center text-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-text-main text-sm">{achievement.title}</h4>
                          <p className="text-xs text-text-muted mt-1">{achievement.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Reviews */}
            <div className="bg-bg p-6 rounded-3xl border border-border-main shadow-sm space-y-6">
              <h3 className="text-2xl font-black text-primary border-b border-border-main pb-3">المراجعات الشاملة المتوفرة</h3>
              {availableReviews.length === 0 ? (
                <p className="text-slate-400 text-center py-6 text-sm">لا توجد محاضرات مراجعة شاملة متوفرة حالياً لصفك.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableReviews.map((rev) => (
                    <Link
                      key={rev.id}
                      to={`/lesson/${rev.id}`}
                      className="p-5 rounded-2xl bg-card border border-border-main hover:border-gold hover:bg-gold/5 transition-all flex justify-between items-center group cursor-pointer"
                    >
                      <div>
                        <h4 className="font-extrabold text-primary group-hover:text-gold-dark transition-colors text-base">{rev.title}</h4>
                        <span className="text-xs text-slate-400 block mt-1">
                          {rev.term === 'first' ? 'الترم الأول' : 'الترم الثاني'} • مادة المراجعات
                        </span>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:translate-x-[-4px] transition-transform" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        );
      })()}

    </div>
  );
}
