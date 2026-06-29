import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { subjectsAr } from '../data';
import { ChevronRight, Download, HelpCircle, CheckCircle2, ChevronLeft, ArrowRight, Award, FileText, PlayCircle, Printer } from 'lucide-react';
import { cn } from '../lib/utils';
import html2pdf from 'html2pdf.js';


const getAuthenticatedUrl = (url: string) => {
  if (!url) return '';
  if (!url.startsWith('/uploads/')) return url;
  const token = localStorage.getItem('token');
  if (!token) return url;
  return `${url}?token=${encodeURIComponent(token)}`;
};

export function LessonView() {
  const { user, progress, markLessonComplete } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<any>(null);
  const [subjectLessons, setSubjectLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reported, setReported] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [isSuccessReport, setIsSuccessReport] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    if (user && id) {
      const token = localStorage.getItem('token');
      setReportMessage(null);
      
      // Fetch the current lesson
      fetch(`/api/lessons/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (!res.ok) throw new Error('Lesson not found');
          return res.json();
        })
        .then(data => {
          setLesson(data);
          
          // Save last visited lesson
          localStorage.setItem('last_visited_lesson', JSON.stringify({
            id: data.id,
            title: data.title,
            grade: data.grade,
            term: data.term,
            subject: data.subject
          }));

          // Fetch report status
          fetch(`/api/lessons/${data.id}/report-status`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(statusData => {
              setReported(statusData.reported);
            })
            .catch(err => console.error(err));
          
          // Fetch all lessons for this subject to determine next/prev
          return fetch(`/api/lessons?grade=${data.grade}&term=${data.term}&subject=${data.subject}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        })
        .then(res => res.json())
        .then(lessonsData => {
          setSubjectLessons(lessonsData);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, user]);

  if (!user) return <Navigate to="/auth" />;

  if (loading) return <div className="p-10 text-center font-bold text-text-muted">جاري تحميل الدرس...</div>;
  if (!lesson) return <div className="p-10 text-center font-bold text-text-muted">الدرس غير موجود</div>;

  if (user.role !== 'teacher' && user.grade !== lesson.grade) {
    return <Navigate to="/dashboard" />;
  }

  const isCompleted = progress?.completedLessons?.includes(lesson.id);

  const currentIndexInSubject = subjectLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIndexInSubject > 0 ? subjectLessons[currentIndexInSubject - 1] : null;
  const nextLesson = currentIndexInSubject < subjectLessons.length - 1 ? subjectLessons[currentIndexInSubject + 1] : null;

  const handleComplete = () => {
    markLessonComplete(lesson.id);
  };

  const handleReportUnderstanding = async () => {
    if (submittingReport) return;
    setSubmittingReport(true);
    setReportMessage(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/report-understanding`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setReported(true);
        setIsSuccessReport(true);
        setReportMessage('تم إرسال ملاحظتك إلى الأستاذ');
      } else {
        setIsSuccessReport(false);
        setReportMessage(data.error || 'حدث خطأ ما أثناء إرسال الملاحظة');
        if (data.alreadySubmitted) {
          setReported(true);
        }
      }
    } catch (err) {
      console.error(err);
      setIsSuccessReport(false);
      setReportMessage('فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const exportNotesToPDF = () => {
    const element = document.getElementById('lesson-notes-content');
    if (!element) return;
    
    // Create a clone to manipulate for PDF export
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Find hidden elements in the clone and make them visible for the PDF
    const hiddenElements = clone.querySelectorAll('.hidden');
    hiddenElements.forEach(el => {
      el.classList.remove('hidden');
      el.classList.add('block');
    });

    // Make the text color black for better PDF reading
    const textElements = clone.querySelectorAll('.text-slate-300, .text-text-muted, .dark\\:text-slate-300');
    textElements.forEach(el => {
      el.classList.remove('text-slate-300', 'text-text-muted', 'text-text-muted');
      el.classList.add('text-black');
    });
    
    const opt = {
      margin:       0.5,
      filename:     `ملخص_${lesson.title.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(clone).save();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>أكاديمية جمعة عبد الشفيع | {lesson.title}</title>
        <meta name="description" content={`أكاديمية جمعة عبد الشفيع - عرض الدرس: ${lesson.title} في مادة ${subjectsAr[lesson.subject as keyof typeof subjectsAr] || 'اللغة العربية'}.`} />
      </Helmet>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/learning-platform" className="hover:text-primary">المحتوى الدراسي</Link>
        <ChevronLeft className="w-4 h-4" />
        <Link to={`/lessons/${lesson.grade}/${lesson.term}/${lesson.subject}`} className="hover:text-primary">{subjectsAr[lesson.subject as keyof typeof subjectsAr] || 'مادة'}</Link>
        <ChevronLeft className="w-4 h-4" />
        <span className="text-primary font-semibold truncate">{lesson.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* 1. Video Player Area */}
          {lesson.videoUrl && lesson.videoUrl !== '#' ? (
            <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-lg relative flex items-center justify-center order-1">
              <video 
                key={lesson.videoUrl}
                controls 
                className="w-full h-full object-contain"
              >
                <source src={getAuthenticatedUrl(lesson.videoUrl)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            (!lesson.pdfUrl || lesson.pdfUrl === '#') && (
              <div className="bg-amber-50 border border-amber-100 p-8 rounded-2xl text-center space-y-3 order-1">
                <div className="text-amber-500 text-3xl">⚠️</div>
                <h3 className="font-bold text-text-main text-lg">لم يتم رفع محتوى لهذا الدرس بعد</h3>
                <p className="text-sm text-text-muted">سيقوم المعلم برفع فيديو الشرح وملخص المحاضرة قريباً جداً، يرجى المتابعة لاحقاً.</p>
              </div>
            )
          )}

          {/* 2. PDF Download Section - High priority for mobile */}
          {lesson.pdfUrl && lesson.pdfUrl !== '#' && (
            <div className="order-2 lg:hidden">
              <a 
                href={getAuthenticatedUrl(lesson.pdfUrl)} 
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gold text-primary rounded-2xl shadow-lg shadow-gold/20 font-black text-lg transition-all active:scale-95 border-2 border-white/20"
                target="_blank" rel="noreferrer"
              >
                <Download className="w-6 h-6" /> تحميل ملخص PDF للمحاضرة
              </a>
            </div>
          )}

          {/* 3. Lesson Info & Actions */}
          <div className="bg-bg p-6 md:p-8 rounded-3xl shadow-sm border border-border-main order-3">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
              <div>
                <h1 className="text-mobile-h1 md:text-4xl font-black text-primary mb-2">{lesson.title}</h1>
                <p className="text-text-muted text-sm font-bold">مادة {subjectsAr[lesson.subject as keyof typeof subjectsAr] || 'مادة'} • {lesson.durationMinutes} دقيقة</p>
              </div>
              <button 
                onClick={handleComplete}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black transition-all shrink-0 text-mobile-btn md:text-base btn-touch",
                  isCompleted 
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : "bg-primary text-white hover:bg-slate-800 shadow-lg shadow-primary/10"
                )}
              >
                {isCompleted ? (
                  <><CheckCircle2 className="w-5 h-5" /> مكتمل</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5 opacity-50" /> تحديد كمكتمل</>
                )}
              </button>
            </div>

            {lesson.description && (
              <div className="mb-8 p-5 bg-card rounded-2xl border border-border-main text-mobile-body md:text-base text-text-muted leading-relaxed">
                <h4 className="font-black text-text-main mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> وصف الدرس:
                </h4>
                <p>{lesson.description}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6 border-t border-border-main">
              {/* Desktop PDF Link */}
              {lesson.pdfUrl && lesson.pdfUrl !== '#' && (
                <a 
                  href={getAuthenticatedUrl(lesson.pdfUrl)} 
                  className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-card text-primary rounded-xl hover:bg-card border border-border-main transition-colors text-sm font-black"
                  target="_blank" rel="noreferrer"
                >
                  <Download className="w-5 h-5" /> تحميل الملخص PDF
                </a>
              )}

              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
                <button 
                  onClick={handleReportUnderstanding}
                  disabled={submittingReport}
                  className={cn(
                    "flex items-center justify-center gap-2 px-6 py-3.5 sm:py-2.5 rounded-xl transition-all text-sm font-black cursor-pointer btn-touch sm:min-h-0",
                    reported
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-sm"
                  )}
                >
                  {submittingReport ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                      جاري الإرسال...
                    </span>
                  ) : reported ? (
                    <>
                      <HelpCircle className="w-4 h-4" /> لم أفهم (تم التسجيل)
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4" /> لم أفهم هذا الدرس
                    </>
                  )}
                </button>
                
                {reportMessage && (
                  <div className={cn(
                    "text-xs font-black px-4 py-2.5 rounded-xl border text-center",
                    isSuccessReport
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  )}>
                    {reportMessage}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Additional resources */}
          {(lesson.additionalExplanation || (lesson.reviewVideoUrl && lesson.reviewVideoUrl !== '#')) && (
            <div className="bg-gradient-to-br from-gold/5 to-amber-500/5 border-2 border-gold/20 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm order-4">
              <div className="flex items-center gap-3 text-amber-800">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-gold stroke-[2.5]" />
                </div>
                <h3 className="font-black text-mobile-h2 md:text-xl text-primary">شرح إضافي وتوضيح</h3>
              </div>
              
              {lesson.reviewVideoUrl && lesson.reviewVideoUrl !== '#' && (
                <div className="space-y-3">
                  <h4 className="font-black text-text-main text-sm flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" /> فيديو الشرح التفصيلي الإضافي:
                  </h4>
                  <div className="rounded-2xl overflow-hidden aspect-video shadow-md bg-black">
                    <video controls className="w-full h-full object-contain">
                      <source src={getAuthenticatedUrl(lesson.reviewVideoUrl)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {lesson.additionalExplanation && (
                <div className="space-y-2 bg-bg p-5 rounded-2xl border border-border-main shadow-sm relative">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-text-main flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gold"></div>
                      ملاحظات المعلم المكتوبة:
                    </h4>
                    <button 
                      onClick={exportNotesToPDF}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-card text-text-muted rounded-lg hover:bg-gold hover:text-primary transition-colors text-xs font-bold"
                      title="تصدير الملخص كملف PDF"
                    >
                      <Printer className="w-3.5 h-3.5" /> طباعة/تصدير
                    </button>
                  </div>
                  <div id="lesson-notes-content" className="p-4 bg-bg rounded-xl" dir="rtl">
                    <h2 className="hidden text-xl font-black mb-4 border-b pb-2 text-center text-primary">{lesson.title} - ملخص الدرس</h2>
                    <p className="font-medium text-text-muted text-sm leading-relaxed whitespace-pre-wrap">{lesson.additionalExplanation}</p>
                    <div className="hidden mt-8 pt-4 border-t text-xs text-center text-slate-400">
                      تم تصدير هذا الملخص من أكاديمية جمعة عبد الشفيع
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6 order-5 lg:order-last">
          {/* Progress Card */}
          <div className="bg-bg p-6 rounded-3xl shadow-sm border border-border-main">
            <h3 className="font-black text-primary mb-5 text-xl flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gold rounded-full"></div>
              تقدمك الدراسي
            </h3>
            <div className="w-full bg-card h-3 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-gold h-full transition-all duration-700"
                style={{ width: `${(progress?.completedLessons?.length || 0) / Math.max(subjectLessons.length, 1) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-text-muted text-center font-bold">
              أكملت {progress?.completedLessons?.filter((id: string) => subjectLessons.some(l => l.id === id)).length || 0} من {subjectLessons.length} دروس
            </p>
          </div>

          {/* Navigation Card */}
          <div className="bg-bg p-6 rounded-3xl shadow-sm border border-border-main space-y-4">
            <h3 className="font-black text-primary mb-3 text-xl flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              التنقل السريع
            </h3>
            
            {nextLesson ? (
              <Link 
                to={`/lesson/${nextLesson.id}`}
                className="flex items-center justify-between p-4 bg-card rounded-2xl hover:bg-card border border-border-main transition-all group btn-touch"
              >
                <div className="overflow-hidden">
                  <div className="text-[10px] text-slate-400 font-black mb-1">الدرس التالي</div>
                  <div className="font-black text-primary text-sm truncate group-hover:text-gold transition-colors">{nextLesson.title}</div>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ) : (
              <div className="p-4 bg-card rounded-2xl border border-border-main text-slate-400 text-sm text-center font-bold">
                هذا هو الدرس الأخير في الوحدة
              </div>
            )}

            {prevLesson && (
              <Link 
                to={`/lesson/${prevLesson.id}`}
                className="flex items-center justify-between p-4 bg-bg rounded-2xl hover:bg-card border border-border-main transition-all group btn-touch"
              >
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                <div className="overflow-hidden text-left" dir="ltr">
                  <div className="text-[10px] text-slate-400 font-black mb-1" dir="rtl">الدرس السابق</div>
                  <div className="font-black text-primary text-sm truncate group-hover:text-gold transition-colors" dir="rtl">{prevLesson.title}</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
