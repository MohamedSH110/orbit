import React, { useState, useEffect } from 'react';
import { 
  FileText, Play, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, 
  Award, RefreshCw, Eye, BookOpen, Clock, Loader2, ArrowLeft, ArrowRight, HelpCircle
} from 'lucide-react';
import { subjectsAr } from '../data';

export function StudentExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Game/Take States
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Completed Result States
  const [examResult, setExamResult] = useState<any | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, number> | null>(null);
  const [viewState, setViewState] = useState<'list' | 'taking' | 'result'>('list');

  const fetchExams = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/exams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleStartExam = (exam: any) => {
    setActiveExam(exam);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setExamResult(null);
    setCorrectAnswers(null);
    setViewState('taking');
  };

  const handleSelectChoice = (questionId: string, choiceIdx: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: choiceIdx
    });
  };

  const handleNextQuestion = () => {
    if (activeExam && currentQuestionIdx < activeExam.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;

    // Check if they answered all questions
    const unansweredCount = activeExam.questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      if (!confirm(`متبقي ${unansweredCount} سؤال لم تجب عليها. هل تريد تسليم الامتحان الآن على أي حال؟`)) {
        return;
      }
    } else {
      if (!confirm('هل أنت متأكد من تسليم الإجابات وإنهاء الاختبار الإلكتروني؟')) {
        return;
      }
    }

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
        fetchExams(); // Refresh exam lists to mark it completed
      } else {
        const errData = await res.json();
        alert(errData.error || 'حدث خطأ أثناء تسليم الإجابات');
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('حدث خطأ في الشبكة، يرجى إعادة المحاولة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResultDetails = (exam: any) => {
    setActiveExam(exam);
    setExamResult(exam.userResult);
    
    // Construct correct answers dictionary from exam questions (since we have them when review/taken is true)
    const answersDict: Record<string, number> = {};
    exam.questions.forEach((q: any) => {
      answersDict[q.id] = q.correctIndex;
    });
    setCorrectAnswers(answersDict);
    
    // Build user selections from userResult.answers
    setSelectedAnswers(exam.userResult.answers || {});
    setViewState('result');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. LIST OF EXAMS */}
      {viewState === 'list' && (
        <div className="space-y-6">
          <div className="bg-bg p-6 rounded-2xl border border-border-main shadow-sm">
            <h2 className="text-xl font-extrabold text-primary mb-1">قسم الاختبارات والامتحانات</h2>
            <p className="text-sm text-text-muted">قم بحل الاختبارات المتاحة لمادتك الدراسية للوقوف على مستواك الحقيقي والحصول على تقييم فوري بالدرجات.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-semibold text-sm">جاري تحميل قائمة الامتحانات الخاصة بك...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-bg p-12 rounded-2xl text-center border border-border-main shadow-sm space-y-4">
              <div className="w-16 h-16 bg-card text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <HelpCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-1">لا توجد اختبارات متاحة لصفك الدراسي حالياً</h3>
                <p className="text-text-muted text-sm">سيقوم المعلم بنشر اختبارات جديدة قريباً، يرجى مراجعة هذه الصفحة لاحقاً.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => {
                const isTaken = exam.taken;
                const score = exam.userScore;
                
                return (
                  <div 
                    key={exam.id} 
                    className={`bg-bg rounded-2xl border p-5 flex flex-col justify-between transition-all group shadow-sm ${
                      isTaken 
                        ? 'border-green-150 bg-green-50/5 hover:shadow-md' 
                        : 'border-border-main hover:border-gold hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold">
                          {subjectsAr[exam.subject as keyof typeof subjectsAr] || exam.subject}
                        </span>
                        {isTaken ? (
                          <span className="text-xs font-extrabold px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> تم الاجتياز
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 bg-gold/15 text-gold-dark rounded-full">
                            متاح للبدء
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-primary line-clamp-1 group-hover:text-gold transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-text-muted line-clamp-2 h-8">
                        {exam.description || 'لا توجد ملاحظات إضافية لهذا الامتحان.'}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-bold text-text-muted bg-card p-2.5 rounded-xl">
                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-slate-400" /> {exam.questions?.length || 0} أسئلة</span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> تصحيح تلقائي فورى</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border-main flex items-center justify-between">
                      {isTaken ? (
                        <>
                          <div className="text-right">
                            <span className="text-slate-400 text-xs font-semibold block">درجتك</span>
                            <span className="text-lg font-black text-green-600 font-mono">{score}%</span>
                          </div>
                          <button
                            onClick={() => handleViewResultDetails(exam)}
                            className="py-2 px-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl transition-all text-xs flex items-center gap-1 border border-green-200 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" /> مراجعة الأخطاء
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartExam(exam)}
                          className="w-full py-2.5 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" /> ابدأ الامتحان الآن
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. TAKING EXAM PLAYER */}
      {viewState === 'taking' && activeExam && (
        <div className="max-w-3xl mx-auto bg-bg rounded-3xl border border-border-main shadow-md overflow-hidden animate-fade-in">
          {/* Header Status Bar */}
          <div className="bg-primary p-5 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-gold block mb-1">خوض اختبار تفاعلي مباشر</span>
              <h3 className="text-lg font-bold line-clamp-1">{activeExam.title}</h3>
            </div>
            <button
              onClick={() => {
                if (confirm('هل تريد إلغاء الاختبار والعودة؟ لن يتم حفظ إجاباتك الحالية.')) {
                  setViewState('list');
                  setActiveExam(null);
                }
              }}
              className="text-white/80 hover:text-white bg-bg/10 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              إلغاء وخروج
            </button>
          </div>

          {/* Question Navigator Tracker */}
          <div className="px-6 py-4 bg-card border-b border-border-main flex items-center justify-between text-xs font-bold text-text-muted">
            <span>السؤال {currentQuestionIdx + 1} من {activeExam.questions.length}</span>
            <div className="flex gap-1">
              {activeExam.questions.map((_: any, idx: number) => {
                const isCurrent = idx === currentQuestionIdx;
                const isAnswered = selectedAnswers[activeExam.questions[idx].id] !== undefined;
                return (
                  <div 
                    key={idx} 
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isCurrent 
                        ? 'bg-gold ring-4 ring-gold/20' 
                        : isAnswered 
                          ? 'bg-primary' 
                          : 'bg-slate-200'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Active Question Body */}
          <div className="p-6 md:p-8 space-y-6">
            {(() => {
              const activeQ = activeExam.questions[currentQuestionIdx];
              const userAnswer = selectedAnswers[activeQ.id];
              
              return (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">نص السؤال الحالي</span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-primary leading-relaxed">{activeQ.text}</h2>
                  </div>

                  {/* Choice List Cards */}
                  <div className="grid grid-cols-1 gap-3.5">
                    {activeQ.choices.map((choice: string, cIdx: number) => {
                      const isSelected = userAnswer === cIdx;
                      return (
                        <button
                          key={cIdx}
                          onClick={() => handleSelectChoice(activeQ.id, cIdx)}
                          className={`w-full text-right p-4 rounded-2xl border-2 transition-all flex items-center justify-between font-bold group cursor-pointer ${
                            isSelected 
                              ? 'border-gold bg-gold/5 shadow-md shadow-gold/5' 
                              : 'border-border-main hover:border-border-main hover:bg-card'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs transition-all ${
                              isSelected 
                                ? 'bg-gold border-gold text-primary font-black' 
                                : 'border-slate-300 text-slate-400 group-hover:border-primary'
                            }`}>
                              {String.fromCharCode(65 + cIdx)}
                            </div>
                            <span className={`text-sm md:text-base ${isSelected ? 'text-primary' : 'text-text-main'}`}>{choice}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected 
                              ? 'border-gold bg-gold text-primary' 
                              : 'border-border-main group-hover:border-slate-300'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="p-5 bg-card border-t border-border-main flex items-center justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIdx === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                currentQuestionIdx === 0 
                  ? 'bg-card text-slate-450 border-border-main cursor-not-allowed opacity-50' 
                  : 'bg-bg text-text-main hover:bg-card border-slate-300 cursor-pointer'
              }`}
            >
              <ChevronRight className="w-4 h-4" /> السؤال السابق
            </button>

            {currentQuestionIdx < activeExam.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs flex items-center gap-1 cursor-pointer"
              >
                السؤال التالي <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري الإرسال والتصحيح...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> تسليم الامتحان ورؤية النتيجة
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. SHOW EXAM RESULTS SCREEN */}
      {viewState === 'result' && examResult && activeExam && (
        <div className="max-w-3xl mx-auto bg-bg rounded-3xl border border-border-main shadow-md overflow-hidden animate-fade-in">
          {/* Top Hero Result */}
          <div className="bg-gradient-to-br from-primary to-slate-900 p-8 text-center text-white space-y-4">
            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto border border-gold/30">
              <Award className="w-12 h-12 text-gold animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-gold/85 block uppercase tracking-wider">تم تصحيح امتحانك بنجاح!</span>
              <h2 className="text-xl md:text-2xl font-black">{activeExam.title}</h2>
            </div>

            <div className="flex justify-center items-end gap-1.5 font-mono">
              <span className="text-5xl font-black text-gold">{examResult.score}</span>
              <span className="text-xl text-slate-400 font-bold">/ 100%</span>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              أحسنت صنعاً! تابع المذاكرة ومراجعة المحاضرات التعليمية بانتظام لتحقيق أعلى الدرجات في الامتحانات الوزارية القادمة.
            </p>
          </div>

          {/* Stat Cards Breakdown */}
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 bg-card border-b border-border-main text-center py-4">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">إجمالي الأسئلة</div>
              <div className="text-lg font-black text-primary font-mono">{examResult.totalQuestions}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">الإجابات الصحيحة</div>
              <div className="text-lg font-black text-green-600 font-mono">{examResult.correctCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">الأخطاء والمتبقي</div>
              <div className="text-lg font-black text-red-500 font-mono">{examResult.wrongCount}</div>
            </div>
          </div>

          {/* Questions Answers Details Review list */}
          <div className="p-6 md:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-primary border-b border-border-main pb-2">
              مراجعة وتدقيق إجاباتك بالتفصيل:
            </h3>

            <div className="space-y-6">
              {activeExam.questions.map((q: any, qIdx: number) => {
                const userSelectedIdx = selectedAnswers[q.id];
                const correctIdx = correctAnswers?.[q.id];
                const isCorrect = userSelectedIdx === correctIdx;

                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-card/50 border border-border-main space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-black">
                          {qIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-400">السؤال</span>
                      </div>

                      {isCorrect ? (
                        <span className="text-xs font-extrabold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> إجابة صحيحة
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold text-red-500 bg-red-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> إجابة خاطئة
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-primary text-base md:text-lg leading-relaxed">{q.text}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-bold">
                      {q.choices.map((choice: string, cIdx: number) => {
                        const isUserChoice = userSelectedIdx === cIdx;
                        const isCorrectChoice = correctIdx === cIdx;

                        let styleClass = 'bg-bg border-border-main text-text-main';
                        if (isCorrectChoice) {
                          styleClass = 'bg-green-500/10 border-green-500 text-green-800 ring-1 ring-green-500';
                        } else if (isUserChoice && !isCorrect) {
                          styleClass = 'bg-red-500/10 border-red-500 text-red-800 ring-1 ring-red-500';
                        }

                        return (
                          <div 
                            key={cIdx} 
                            className={`p-3 rounded-xl border flex items-center justify-between ${styleClass}`}
                          >
                            <span className="line-clamp-1">{choice}</span>
                            {isCorrectChoice && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-lg">الإجابة الصحيحة</span>}
                            {isUserChoice && !isCorrect && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-lg">إجابتك الخاطئة</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-5 bg-card border-t border-border-main flex justify-center">
            <button
              onClick={() => {
                setViewState('list');
                setActiveExam(null);
                setExamResult(null);
                setCorrectAnswers(null);
              }}
              className="px-6 py-2.5 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-sm shadow-md cursor-pointer"
            >
              العودة لقائمة الاختبارات
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
