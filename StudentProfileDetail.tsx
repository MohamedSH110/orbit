import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, Calendar, TrendingUp, CheckCircle2, Clock, BookOpen, 
  Award, MessageSquare, Plus, Trash2, Edit2, ArrowRight, BookOpenCheck, 
  AlertTriangle, BrainCircuit, Activity, Sparkles, MessageCircle, PhoneCall,
  ChevronLeft, ClipboardList, ListTodo, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentProfileDetailProps {
  studentId: string;
  onClose: () => void;
}

export function StudentProfileDetail({ studentId, onClose }: StudentProfileDetailProps) {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Teacher Notes Local States
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [updatingNote, setUpdatingNote] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/students/${studentId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setNotes(data.student.teacherNotes || []);
      } else {
        const data = await res.json();
        setError(data.error || 'فشل تحميل بيانات الطالب');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // Add a note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setAddingNote(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/students/${studentId}/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: newNoteText })
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [...prev, data.note]);
        setNewNoteText('');
      } else {
        alert('فشل حفظ الملاحظة');
      }
    } catch (err) {
      alert('خطأ في الشبكة');
    } finally {
      setAddingNote(false);
    }
  };

  // Update a note
  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteText.trim()) return;
    setUpdatingNote(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/students/${studentId}/notes/${noteId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: editingNoteText })
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => prev.map(n => n.id === noteId ? data.note : n));
        setEditingNoteId(null);
        setEditingNoteText('');
      } else {
        alert('فشل تعديل الملاحظة');
      }
    } catch (err) {
      alert('خطأ في الشبكة');
    } finally {
      setUpdatingNote(false);
    }
  };

  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/students/${studentId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      } else {
        alert('فشل حذف الملاحظة');
      }
    } catch (err) {
      alert('خطأ في الشبكة');
    }
  };

  const formatArabicDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getGradeLabel = (grade: string) => {
    const grades: any = {
      first: 'الصف الأول الثانوي',
      second: 'الصف الثاني الثانوي',
      third: 'الصف الثالث الثانوي'
    };
    return grades[grade] || grade;
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} دقيقة`;
    if (mins === 0) return `${hours} ساعة`;
    return `${hours} ساعة و ${mins} دقيقة`;
  };

  if (loading) {
    return (
      <div className="bg-card min-h-screen p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-primary text-lg animate-pulse">جاري تحميل لوحة تحليلات الطالب...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="bg-card min-h-screen p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h3 className="font-extrabold text-primary text-xl">حدث خطأ أثناء تحميل البيانات</h3>
        <p className="text-text-muted max-w-md">{error || 'لم يتم العثور على ملف الطالب'}</p>
        <button 
          onClick={onClose}
          className="px-6 py-2.5 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-5 h-5" /> العودة للطلاب
        </button>
      </div>
    );
  }

  const { student, analytics } = profileData;

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16 text-right animate-fadeIn" dir="rtl">
      {/* Top sticky navigation */}
      <div className="sticky top-0 bg-bg/80 backdrop-blur-md border-b border-border-main z-10 px-4 py-4 md:px-8 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-text-muted hover:text-primary font-bold transition-all text-sm cursor-pointer hover:-translate-x-1"
        >
          <ArrowRight className="w-5 h-5" /> العودة إلى قائمة الطلاب
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">كود الطالب: #{student.id.replace('student_', '')}</span>
          <div className="h-4 w-px bg-slate-200"></div>
          {student.status === 'disabled' ? (
            <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-black">معطل 🚫</span>
          ) : (
            <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xs font-black">نشط 🟢</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* SECTION 1: HEADER CARD */}
        <div className="bg-bg rounded-3xl p-6 md:p-8 border border-border-main shadow-sm relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -z-1"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/20 rounded-full blur-3xl -z-1"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-1">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 text-primary border border-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <User className="w-8 h-8 md:w-10 md:h-10 text-gold-dark" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight leading-tight">{student.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-text-muted text-sm font-semibold">
                  <span className="bg-card text-text-main px-2.5 py-1 rounded-lg text-xs font-black">
                    {getGradeLabel(student.grade)}
                  </span>
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-slate-400" /> {student.phone}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid inside Header */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:min-w-[450px]">
              <div className="bg-card p-3.5 rounded-2xl border border-border-main">
                <span className="text-[10px] font-black text-slate-400 block mb-1">التقدم العام</span>
                <span className="text-xl font-black text-primary">{analytics.overallProgress}%</span>
              </div>
              <div className="bg-card p-3.5 rounded-2xl border border-border-main">
                <span className="text-[10px] font-black text-slate-400 block mb-1">تاريخ التسجيل</span>
                <span className="text-xs font-black text-text-main">{formatArabicDate(student.registrationDate)}</span>
              </div>
              <div className="bg-card p-3.5 rounded-2xl border border-border-main col-span-2 sm:col-span-1">
                <span className="text-[10px] font-black text-slate-400 block mb-1">آخر تسجيل دخول</span>
                <span className="text-xs font-black text-text-main">{formatArabicDate(student.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS SECTION */}
        {student.achievements && student.achievements.length > 0 && (
          <div className="bg-bg rounded-3xl p-6 md:p-8 border border-border-main shadow-sm">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6 border-b border-border-main pb-3">
              <Award className="w-6 h-6 text-gold" />
              أوسمة الإنجاز التي حصل عليها الطالب
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {student.achievements.map((achievement: any) => {
                let IconComponent = Award;
                if (achievement.icon === 'flag') IconComponent = BookOpen;
                if (achievement.icon === 'target') IconComponent = CheckCircle2;
                if (achievement.icon === 'award') IconComponent = Award;
                if (achievement.icon === 'star') IconComponent = Sparkles;
                if (achievement.icon === 'zap') IconComponent = Activity;
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

        {/* SECTION 2: PROGRESS OVERVIEW & PARENT CALL CARD (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Overview */}
          <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-extrabold text-primary text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold-dark" /> نظرة عامة على التقدم الدراسي
              </h3>
              <span className="text-xs font-bold text-slate-400">إحصائيات متكاملة للترمين</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Radial or Big percentage card */}
              <div className="bg-card rounded-2xl p-6 flex flex-col items-center justify-center text-center relative border border-border-main overflow-hidden">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* SVG Circle Progress */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-gold"
                      strokeDasharray={`${analytics.overallProgress}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-primary block">{analytics.overallProgress}%</span>
                    <span className="text-[9px] font-black text-slate-400 block -mt-1">إنجاز كلي</span>
                  </div>
                </div>
              </div>

              {/* Term progress bars */}
              <div className="space-y-4 md:col-span-2 flex flex-col justify-center">
                <div>
                  <div className="flex justify-between items-center text-sm font-bold text-text-main mb-1.5">
                    <span>تقدم الفصل الدراسي الأول (الترم الأول)</span>
                    <span className="text-gold-dark">{analytics.term1Progress}%</span>
                  </div>
                  <div className="w-full bg-card h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gold h-full rounded-full transition-all duration-500" 
                      style={{ width: `${analytics.term1Progress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm font-bold text-text-main mb-1.5">
                    <span>تقدم الفصل الدراسي الثاني (الترم الثاني)</span>
                    <span className="text-gold-dark">{analytics.term2Progress}%</span>
                  </div>
                  <div className="w-full bg-card h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gold h-full rounded-full transition-all duration-500" 
                      style={{ width: `${analytics.term2Progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Numeric Stats block */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
              <div className="bg-card/50 p-4 rounded-xl border border-border-main text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-400 block mb-0.5">الدروس المكتملة</span>
                <span className="text-lg font-black text-primary">{analytics.completedLessonsCount} درس</span>
              </div>
              <div className="bg-card/50 p-4 rounded-xl border border-border-main text-center">
                <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-400 block mb-0.5">الدروس المتبقية</span>
                <span className="text-lg font-black text-primary">{analytics.remainingLessonsCount} درس</span>
              </div>
              <div className="bg-card/50 p-4 rounded-xl border border-border-main text-center">
                <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-400 block mb-0.5">وقت الدراسة المقدر</span>
                <span className="text-sm font-black text-primary">{formatStudyTime(analytics.totalStudyTime)}</span>
              </div>
              <div className="bg-card/50 p-4 rounded-xl border border-border-main text-center">
                <Award className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-400 block mb-0.5">معدل الدرجات</span>
                <span className="text-lg font-black text-primary">{analytics.performance.avgExamScore}%</span>
              </div>
            </div>
          </div>

          {/* Parent Info & Quick Contact */}
          <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-sm">معلومات ولي الأمر</h3>
                  <p className="text-[10px] text-slate-400">التواصل الفوري مع ولي أمر الطالب</p>
                </div>
              </div>

              <div className="bg-card p-4 rounded-2xl border border-border-main space-y-2 text-center">
                <span className="text-xs font-bold text-slate-400 block">رقم هاتف ولي الأمر</span>
                <span className="text-lg font-mono font-black text-primary block" dir="ltr">
                  {student.parentPhone || 'غير متوفر'}
                </span>
              </div>
            </div>

            {student.parentPhone ? (
              <div className="space-y-3 mt-6">
                <a 
                  href={`tel:${student.parentPhone}`}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10"
                >
                  <PhoneCall className="w-4 h-4" /> اتصال بولي الأمر
                </a>
                
                <a 
                  href={`https://wa.me/${student.parentPhone.startsWith('0') ? '2' + student.parentPhone : student.parentPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-green-500/10"
                >
                  <MessageCircle className="w-4 h-4" /> مراسلة على واتساب
                </a>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 text-xs mt-6 font-bold">
                لا يوجد هاتف مسجل لولي الأمر حالياً
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: PERFORMANCE ANALYTICS PANEL */}
        <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border-main pb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-primary text-lg">تحليلات الأداء والمستويات الدراسية</h3>
              <p className="text-xs text-slate-400">تحليل فوري لمواطن القوة والضعف ومعدل الدرجات</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-card p-5 rounded-2xl border border-border-main text-center relative overflow-hidden">
              <span className="text-xs font-black text-text-muted block mb-1">متوسط درجات الامتحانات</span>
              <h4 className="text-3xl font-black text-primary">{analytics.performance.avgExamScore}%</h4>
              <div className="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="bg-card p-5 rounded-2xl border border-border-main text-center relative overflow-hidden">
              <span className="text-xs font-black text-text-muted block mb-1">متوسط الاختبارات القصيرة</span>
              <h4 className="text-3xl font-black text-primary">{analytics.performance.avgQuizScore}%</h4>
              <div className="w-12 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 text-center relative overflow-hidden">
              <span className="text-xs font-black text-emerald-800 block mb-1">أقوى مادة دراسية 🎯</span>
              <h4 className="text-xl font-black text-emerald-950 mt-1">{analytics.performance.strongestSubject}</h4>
              <span className="text-[9px] font-black text-emerald-600 block mt-2">الأعلى في نسبة الإنجاز</span>
            </div>

            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 text-center relative overflow-hidden">
              <span className="text-xs font-black text-rose-800 block mb-1">بحاجة إلى دعم ⚠️</span>
              <h4 className="text-xl font-black text-rose-950 mt-1">{analytics.performance.weakestSubject}</h4>
              <span className="text-[9px] font-black text-rose-600 block mt-2">الأقل في نسبة الإنجاز</span>
            </div>

            <div className="bg-card p-5 rounded-2xl border border-border-main text-center relative overflow-hidden col-span-1 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-black text-text-muted block mb-1">إجمالي ساعات التعلم</span>
              <h4 className="text-2xl font-black text-primary">{Math.round((analytics.totalStudyTime / 60) * 10) / 10} ساعة</h4>
              <span className="text-[9px] font-black text-slate-400 block mt-2">من خلال استكمال الدروس</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: SUBJECT COMPLETION MATRIX (Learning Progress) */}
        <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border-main pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-primary text-lg">مصفوفة تقدم فروع المادة</h3>
                <p className="text-xs text-slate-400">تغطية الدروس واستكمالها حسب كل فرع لغة عربية</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.subjectProgress.map((sub: any) => (
              <div 
                key={sub.key} 
                className="bg-card hover:bg-card hover:shadow-md transition-all p-5 rounded-2xl border border-border-main space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="font-black text-primary text-base">{sub.name}</span>
                  <span className="text-xs font-bold bg-bg text-gold-dark border border-border-main px-2.5 py-1 rounded-lg">
                    {sub.percentage}% مكتمل
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold h-full rounded-full transition-all duration-300" 
                    style={{ width: `${sub.percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs font-bold text-text-muted">
                  <span>تم إنجاز: <strong className="text-primary font-black">{sub.completed}</strong> من {sub.total} دروس</span>
                  <span>المتبقي: <strong className="text-amber-600 font-black">{sub.remaining}</strong> دروس</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: CURRENT POSITION (آخر درس وصل إليه) & LESSONS NOT UNDERSTOOD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Current Position */}
          <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-sm">آخر درس وصل إليه الطالب</h3>
                  <p className="text-[10px] text-slate-400">آخر درس مسجل مكتملاً أو متصفحاً من قبل الطالب</p>
                </div>
              </div>

              {analytics.currentPosition ? (
                <div className="bg-gradient-to-br from-primary to-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-lg shadow-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl"></div>
                  
                  <div>
                    <span className="text-xs font-bold text-gold block mb-1">
                      {analytics.currentPosition.grade} / {analytics.currentPosition.term}
                    </span>
                    <h4 className="text-xl font-black mb-1">{analytics.currentPosition.title}</h4>
                    <span className="inline-block bg-bg/10 text-white border border-white/10 px-2.5 py-1 rounded-lg text-xs font-bold mt-2">
                      فرع: {analytics.currentPosition.subject}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-300">
                    <span>آخر وصول:</span>
                    <span className="font-bold text-white">{formatArabicDate(analytics.currentPosition.lastAccess)}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-8 text-center text-slate-400 text-xs font-bold border border-border-main">
                  لم يقم الطالب بدراسة أي درس حتى الآن
                </div>
              )}
            </div>

            {analytics.currentPosition && (
              <a 
                href={`/lesson/${analytics.currentPosition.lessonId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-gold hover:bg-gold-dark text-primary font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-gold/10 text-sm mt-6"
              >
                <Compass className="w-4 h-4" /> فتح الدرس ومعاينته ↗
              </a>
            )}
          </div>

          {/* Lessons Not Understood */}
          <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-primary text-sm">الدروس التي لم يفهمها الطالب</h3>
                <p className="text-[10px] text-slate-400">الدروس التي أرسل الطالب حولها بلاغ عدم فهم</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {analytics.notUnderstoodLessons.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold bg-card rounded-2xl border border-border-main">
                  ممتاز! لم يسجل الطالب أي صعوبة في فهم الدروس حتى الآن 🎉
                </div>
              ) : (
                analytics.notUnderstoodLessons.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center bg-red-50/50 border border-red-100/80 p-3.5 rounded-xl transition-all hover:bg-red-50"
                  >
                    <div>
                      <h4 className="font-black text-red-950 text-xs">{item.lessonTitle}</h4>
                      <span className="text-[10px] font-bold text-slate-400 block mt-1">المادة الفرعية: {item.subject}</span>
                    </div>
                    <span className="text-[10px] bg-bg text-red-700 px-2 py-1 rounded-lg border border-red-100 font-bold">
                      أبلغ في {formatArabicDate(item.reportedAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6: EXAM AND QUIZ RESULTS LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exam Results */}
          <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-sm">نتائج الامتحانات</h3>
                  <p className="text-[10px] text-slate-400">الدرجات الحاصل عليها في الامتحانات الشاملة</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {analytics.examResults.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold bg-card rounded-2xl border border-border-main">
                  لم يؤد الطالب أي امتحانات شاملة بعد
                </div>
              ) : (
                analytics.examResults.map((result: any) => (
                  <div 
                    key={result.id} 
                    className="flex items-center justify-between bg-card hover:bg-card/80 p-3.5 rounded-xl border border-border-main transition-all"
                  >
                    <div>
                      <h4 className="font-black text-primary text-xs">{result.examTitle}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                        <span>المادة: {result.subject}</span>
                        <span>•</span>
                        <span>{formatArabicDate(result.takenAt)}</span>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <span className={`text-sm font-black block ${result.percentage >= 80 ? 'text-emerald-600' : result.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {result.percentage}%
                      </span>
                      <span className="text-[10px] font-bold text-text-muted block mt-0.5">
                        {result.score} من {result.totalQuestions} أسئلة
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quiz Results */}
          <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-sm">نتائج الاختبارات القصيرة والواجبات</h3>
                  <p className="text-[10px] text-slate-400">تقييم سريع للتحصيل المستمر للدروس</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {analytics.quizResults.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold bg-card rounded-2xl border border-border-main">
                  لا توجد نتائج اختبارات قصيرة مسجلة
                </div>
              ) : (
                analytics.quizResults.map((result: any) => (
                  <div 
                    key={result.id} 
                    className="flex items-center justify-between bg-card hover:bg-card/80 p-3.5 rounded-xl border border-border-main transition-all"
                  >
                    <div>
                      <h4 className="font-black text-primary text-xs">{result.examTitle}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                        <span>المادة: {result.subject}</span>
                        <span>•</span>
                        <span>{formatArabicDate(result.takenAt)}</span>
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <span className={`text-sm font-black block ${result.percentage >= 80 ? 'text-emerald-600' : result.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {result.percentage}%
                      </span>
                      <span className="text-[10px] font-bold text-text-muted block mt-0.5">
                        {result.score} من {result.totalQuestions} أسئلة
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SECTION 7: COMPLETED LESSONS TIMELINE */}
        <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-primary text-lg">سجل الدروس المكتملة</h3>
              <p className="text-xs text-slate-400">الدروس التي تم دراستها واجتيازها بنجاح</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-1">
            {analytics.completedLessonsList.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs font-bold bg-card rounded-2xl border border-border-main">
                لم يكتمل دراسة أي دروس بعد
              </div>
            ) : (
              analytics.completedLessonsList.map((lesson: any) => (
                <div 
                  key={lesson.id} 
                  className="bg-emerald-50/20 hover:bg-emerald-50 transition-colors border border-emerald-100/50 p-4 rounded-2xl flex items-start gap-3 text-right"
                >
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-primary text-xs leading-snug">{lesson.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">فرع: {lesson.subject}</span>
                    <span className="text-[9px] font-bold text-emerald-700 mt-1 block">
                      اكتمل في: {formatArabicDate(lesson.completedAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 8: PRIVATE TEACHER NOTES SECTION */}
        <div className="bg-bg rounded-3xl p-6 border border-border-main shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border-main pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-card text-primary rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-primary text-lg">ملاحظات المعلم الخاصة 🔒</h3>
                <p className="text-xs text-slate-400">هذه الملاحظات سرية للغاية ولا تظهر للطالب أو لولي الأمر</p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-card text-text-muted px-2.5 py-1 rounded-md">خاص بالمعلم فقط</span>
          </div>

          {/* Add note Form */}
          <form onSubmit={handleAddNote} className="flex gap-2.5">
            <input 
              type="text" 
              required
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="اكتب ملاحظة جديدة عن الطالب مثل: (يحتاج تدريب مكثف على الإعراب)..."
              className="flex-1 px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-semibold"
            />
            <button 
              type="submit" 
              disabled={addingNote || !newNoteText.trim()}
              className="bg-primary hover:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {addingNote ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> إضافة ملاحظة
                </>
              )}
            </button>
          </form>

          {/* Notes List */}
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-bold bg-card rounded-2xl border border-border-main">
                لا توجد ملاحظات مكتوبة حالياً. اكتب ملاحظة لمتابعة أداء الطالب الفردي.
              </div>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.id} 
                  className="p-4 bg-card border border-border-main rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  {editingNoteId === note.id ? (
                    <div className="w-full flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text"
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-gold"
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => handleUpdateNote(note.id)}
                          disabled={updatingNote || !editingNoteText.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          {updatingNote ? 'حفظ...' : 'حفظ'}
                        </button>
                        <button 
                          onClick={() => setEditingNoteId(null)}
                          className="px-4 py-2 bg-slate-200 text-text-main text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-text-main text-sm font-bold leading-relaxed">{note.text}</p>
                        <span className="text-[9px] text-slate-400 font-bold block">
                          كتب في {formatArabicDate(note.createdAt)} {note.updatedAt && '• تم التحديث'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button 
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingNoteText(note.text);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل الملاحظة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف الملاحظة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
