import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, UploadCloud, CheckCircle2, AlertCircle, X, Check, 
  Search, Sparkles, Eye, TrendingUp, GraduationCap, Award, FileText, ChevronLeft, Loader2
} from 'lucide-react';
import { gradesAr } from '../data';

const subjectsAr = {
  grammar: 'النحو',
  rhetoric: 'البلاغة',
  literature: 'الأدب',
  texts: 'النصوص',
  reading: 'القراءة',
  story: 'القصة',
  reviews: 'المراجعات النهائية'
};

const termsAr = {
  first: 'الفصل الدراسي الأول',
  second: 'الفصل الدراسي الثاني'
};

export function AdminExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'form' | 'analytics'>('list');
  
  // Analytics State
  const [analyticsExamId, setAnalyticsExamId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Form State
  const [editExamId, setEditExamId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState<'first' | 'second' | 'third'>('first');
  const [term, setTerm] = useState<'first' | 'second'>('first');
  const [subject, setSubject] = useState<string>('grammar');
  const [questions, setQuestions] = useState<any[]>([]);

  // Import State
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

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

  const handleFetchAnalytics = async (id: string) => {
    setLoadingAnalytics(true);
    setAnalyticsExamId(id);
    setActiveView('analytics');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/exams/${id}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'txt'];
    if (!fileExt || !allowed.includes(fileExt)) {
      setImportError('صيغة الملف غير مدعومة. يدعم النظام فقط ملفات PDF, DOCX, TXT');
      setImportSuccess('');
      return;
    }

    setImportError('');
    setImportSuccess('');
    setImporting(true);

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/exams/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQuestions(data.questions);
        setImportSuccess('تم إنشاء الاختبار الإلكتروني بنجاح');
        setImportError('');
      } else {
        setImportError(data.error || 'تعذر استخراج الأسئلة من الملف');
        setImportSuccess('');
      }
    } catch (err) {
      setImportError('تعذر استخراج الأسئلة من الملف');
      setImportSuccess('');
    } finally {
      setImporting(false);
      // reset file input
      e.target.value = '';
    }
  };

  const handleAddQuestion = () => {
    const newQ = {
      id: 'q_manual_' + Date.now() + '_' + Math.round(Math.random() * 1000),
      text: '',
      choices: ['', '', '', ''],
      correctIndex: 0
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    const updated = [...questions];
    updated.splice(idx, 1);
    setQuestions(updated);
  };

  const handleQuestionTextChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx].text = val;
    setQuestions(updated);
  };

  const handleChoiceChange = (qIdx: number, cIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].choices[cIdx] = val;
    setQuestions(updated);
  };

  const handleCorrectIndexChange = (qIdx: number, cIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctIndex = cIdx;
    setQuestions(updated);
  };

  const handleSaveExam = async () => {
    if (!title.trim()) {
      alert('يرجى إدخال عنوان الامتحان أولاً');
      return;
    }
    if (questions.length === 0) {
      alert('يجب أن يحتوي الامتحان على سؤال واحد على الأقل');
      return;
    }

    // Basic validation of questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`يرجى كتابة نص السؤال رقم ${i + 1}`);
        return;
      }
      for (let j = 0; j < q.choices.length; j++) {
        if (!q.choices[j] || !q.choices[j].trim()) {
          alert(`يرجى كتابة نص الخيار ${j + 1} للسؤال رقم ${i + 1}`);
          return;
        }
      }
    }

    const payload = {
      title,
      description,
      grade,
      term,
      subject,
      questions
    };

    const token = localStorage.getItem('token');
    const url = editExamId ? `/api/admin/exams/${editExamId}` : '/api/admin/exams';
    const method = editExamId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editExamId ? 'تم تعديل الاختبار بنجاح' : 'تم نشر الاختبار بنجاح');
        handleResetForm();
        fetchExams();
      } else {
        const errData = await res.json();
        alert(errData.error || 'حدث خطأ أثناء حفظ الاختبار');
      }
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الاختبار');
    }
  };

  const handleEditExamClick = (exam: any) => {
    setEditExamId(exam.id);
    setTitle(exam.title);
    setDescription(exam.description);
    setGrade(exam.grade);
    setTerm(exam.term);
    setSubject(exam.subject);
    setQuestions(exam.questions);
    setImportError('');
    setImportSuccess('');
    setActiveView('form');
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الامتحان نهائياً؟ سيتم أيضاً حذف نتائج الطلاب المرتبطة به.')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchExams();
      } else {
        alert('فشل في حذف الامتحان');
      }
    } catch (err) {
      alert('حدث خطأ أثناء حذف الامتحان');
    }
  };

  const handleResetForm = () => {
    setEditExamId(null);
    setTitle('');
    setDescription('');
    setGrade('first');
    setTerm('first');
    setSubject('grammar');
    setQuestions([]);
    setImportError('');
    setImportSuccess('');
    setActiveView('list');
  };

  return (
    <div className="space-y-6">
      {/* Top action header when in list view */}
      {activeView === 'list' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg p-6 rounded-2xl border border-border-main shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-primary mb-1">الامتحانات والاختبارات الإلكترونية</h2>
            <p className="text-sm text-text-muted">قم بإنشاء اختبارات تفاعلية، استورد أسئلة تلقائياً، وتابع أداء الطلاب.</p>
          </div>
          <button
            onClick={() => {
              handleResetForm();
              setActiveView('form');
            }}
            className="px-5 py-2.5 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> إضافة اختبار جديد
          </button>
        </div>
      )}

      {/* 1. LIST VIEW */}
      {activeView === 'list' && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-semibold text-sm">جاري تحميل الاختبارات...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-bg p-12 rounded-2xl text-center border border-border-main shadow-sm space-y-4">
              <div className="w-16 h-16 bg-card text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-primary mb-1">لا توجد امتحانات منشورة حالياً</h3>
                <p className="text-text-muted text-sm mb-4">انقر فوق زر "إضافة اختبار جديد" لإنشاء أول اختبار إلكتروني للطلاب يدوياً أو باستيراد الأسئلة تلقائياً.</p>
                <button
                  onClick={() => setActiveView('form')}
                  className="px-4 py-2 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-sm"
                >
                  إنشاء اختبار جديد
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-bg rounded-2xl border border-border-main shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 bg-gold/10 text-gold-dark rounded-full">
                        {gradesAr[exam.grade as keyof typeof gradesAr] || exam.grade}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {subjectsAr[exam.subject as keyof typeof subjectsAr] || exam.subject}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-primary line-clamp-1 group-hover:text-gold transition-colors">{exam.title}</h3>
                    <p className="text-xs text-text-muted line-clamp-2 h-8">{exam.description || 'لا يوجد وصف للاختبار.'}</p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="bg-card p-2.5 rounded-xl text-center">
                        <div className="text-slate-400 mb-0.5">الأسئلة</div>
                        <div className="font-extrabold text-primary text-base">{exam.questions?.length || 0} أسئلة</div>
                      </div>
                      <div className="bg-card p-2.5 rounded-xl text-center">
                        <div className="text-slate-400 mb-0.5">الطلاب الحاضرين</div>
                        <div className="font-extrabold text-primary text-base">{exam.takesCount || 0} طالب</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border-main text-xs">
                    <button
                      onClick={() => handleFetchAnalytics(exam.id)}
                      className="flex-1 py-2 px-3 bg-card hover:bg-primary hover:text-white text-text-main font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-border-main cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> عرض النتائج
                    </button>
                    <button
                      onClick={() => handleEditExamClick(exam)}
                      className="p-2 bg-card hover:bg-gold/10 text-slate-400 hover:text-gold-dark rounded-xl transition-all border border-border-main cursor-pointer"
                      title="تعديل الأسئلة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-2 bg-card hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-border-main cursor-pointer"
                      title="حذف الامتحان"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 2. FORM VIEW (MANUAL OR AUTO IMPORT) */}
      {activeView === 'form' && (
        <div className="bg-bg rounded-3xl border border-border-main shadow-sm p-6 space-y-8 max-w-4xl mx-auto">
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-border-main pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-primary">
                {editExamId ? 'تعديل الاختبار الحالي' : 'إنشاء واختبار إلكتروني جديد'}
              </h2>
              <p className="text-xs text-text-muted mt-1">املاً حقول بيانات الامتحان، أو ارفع ملف لملء الأسئلة تلقائياً.</p>
            </div>
            <button
              onClick={handleResetForm}
              className="p-2 hover:bg-card text-slate-400 hover:text-primary rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Auto Import Area (Only when creating new exam) */}
          {!editExamId && (
            <div className="bg-gradient-to-br from-gold/5 via-white to-primary/5 rounded-2xl p-5 border border-gold/20 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gold/15 text-gold-dark rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-primary text-base">استيراد الأسئلة تلقائياً</h3>
                  <p className="text-xs text-text-muted">ارفع ملف الامتحان (PDF, DOCX, TXT) وسيقوم النظام باستخراج الأسئلة واختيارات الإجابات وتحديد الإجابة الصحيحة تلقائياً.</p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="exam-file-import"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={importing}
                />
                <label
                  htmlFor="exam-file-import"
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer text-center gap-2 bg-bg ${
                    importing 
                      ? 'border-slate-300 opacity-60 cursor-not-allowed' 
                      : 'border-border-main hover:border-gold hover:bg-gold/5'
                  }`}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-8 h-8 text-gold animate-spin" />
                      <p className="text-sm font-bold text-primary">جاري استخراج الأسئلة تلقائياً...</p>
                      <p className="text-xs text-slate-400">يرجى الانتظار، قد يستغرق هذا بضع ثوانٍ</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400" />
                      <p className="text-sm font-bold text-text-main">اسحب وأفلت ملف الأسئلة هنا أو انقر للاختيار</p>
                      <p className="text-xs text-slate-400">يدعم تنسيقات PDF, DOCX, TXT</p>
                    </>
                  )}
                </label>
              </div>

              {/* Status Alert Messages */}
              {importError && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl border border-red-100 flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccess && (
                <div className="bg-green-50 text-green-700 p-3.5 rounded-xl border border-green-100 flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{importSuccess} ({questions.length} سؤال تم استخراجها بنجاح)</span>
                </div>
              )}
            </div>
          )}

          {/* Core Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-text-main">عنوان الاختبار</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: امتحان شامل على الوحدة الأولى (النحو)"
                className="w-full px-4 py-2.5 rounded-xl border border-border-main focus:border-primary focus:outline-none text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-text-main">الوصف / ملاحظات للطلاب</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصفاً للاختبار أو أي تعليمات تود توجيهها للطلاب..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-border-main focus:border-primary focus:outline-none text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-main">الصف الدراسي</label>
              <select
                value={grade}
                onChange={(e: any) => setGrade(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-main focus:border-primary focus:outline-none text-sm font-bold text-primary"
              >
                <option value="first">الصف الأول الثانوي</option>
                <option value="second">الصف الثاني الثانوي</option>
                <option value="third">الصف الثالث الثانوي</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-main">الفصل الدراسي</label>
              <select
                value={term}
                onChange={(e: any) => setTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-main focus:border-primary focus:outline-none text-sm font-bold text-primary"
              >
                <option value="first">الفصل الدراسي الأول</option>
                <option value="second">الفصل الدراسي الثاني</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-text-main">الفرع الدراسي</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-main focus:border-primary focus:outline-none text-sm font-bold text-primary"
              >
                {Object.entries(subjectsAr).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Questions Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-main pb-2">
              <h3 className="text-lg font-bold text-primary flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-gold" />
                أسئلة الاختبار ({questions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-1.5 bg-card hover:bg-gold/10 text-primary hover:text-gold-dark font-bold rounded-xl transition-all text-xs flex items-center gap-1.5 border border-border-main cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة سؤال يدوي
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center p-8 bg-card rounded-2xl border border-border-main text-slate-400 font-semibold text-sm">
                لا توجد أسئلة مضافة حتى الآن. ارفع ملف للاستيراد تلقائياً أو أضف سؤال يدوي.
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="p-5 bg-card/50 rounded-2xl border border-border-main space-y-4 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="absolute top-4 left-4 p-1.5 bg-bg hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors border border-border-main cursor-pointer"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-extrabold shrink-0">
                        {qIdx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">السؤال الأساسي</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-muted">نص السؤال</label>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        placeholder="اكتب هنا نص السؤال التفاعلي..."
                        className="w-full px-4 py-2 rounded-xl bg-bg border border-border-main focus:border-primary focus:outline-none text-sm font-semibold"
                      />
                    </div>

                    {/* Choices Builder */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted">الخيارات الأربعة والإجابة الصحيحة</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.choices.map((choice: string, cIdx: number) => {
                          const isCorrect = q.correctIndex === cIdx;
                          return (
                            <div 
                              key={cIdx} 
                              className={`flex items-center gap-2 p-2.5 rounded-xl border bg-bg transition-all ${
                                isCorrect 
                                  ? 'border-green-500 shadow-sm shadow-green-500/5 ring-1 ring-green-500' 
                                  : 'border-border-main'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleCorrectIndexChange(qIdx, cIdx)}
                                className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                                  isCorrect 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-slate-300 hover:border-primary'
                                }`}
                              >
                                {isCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>
                              <span className="text-xs font-extrabold text-slate-400 w-4">
                                {String.fromCharCode(65 + cIdx)})
                              </span>
                              <input
                                type="text"
                                value={choice}
                                onChange={(e) => handleChoiceChange(qIdx, cIdx, e.target.value)}
                                placeholder={`الخيار ${cIdx + 1}`}
                                className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-semibold text-text-main"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-6 border-t border-border-main justify-end">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-5 py-2.5 bg-card hover:bg-card text-text-main font-bold rounded-xl transition-colors text-sm border border-border-main cursor-pointer"
            >
              إلغاء التغييرات
            </button>
            <button
              type="button"
              onClick={handleSaveExam}
              className="px-6 py-2.5 bg-primary hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-sm shadow-md cursor-pointer"
            >
              {editExamId ? 'حفظ التعديلات الحالية' : 'نشر الاختبار للطلاب'}
            </button>
          </div>
        </div>
      )}

      {/* 3. ANALYTICS VIEW */}
      {activeView === 'analytics' && (
        <div className="bg-bg rounded-3xl border border-border-main shadow-sm p-6 space-y-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-main pb-4">
            <button
              onClick={() => setActiveView('list')}
              className="flex items-center gap-1.5 text-text-muted hover:text-primary font-bold text-sm bg-card px-3.5 py-1.5 rounded-xl border border-border-main transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" /> العودة للقائمة
            </button>
            <div className="text-left font-bold text-slate-400 text-xs">
              تحليلات ونتائج الطلاب
            </div>
          </div>

          {loadingAnalytics || !analyticsData ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-semibold text-sm">جاري تحميل تقارير الأداء وتحليل النتائج...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {/* Exam Title & Meta */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-primary/10 text-primary rounded-full">
                    {gradesAr[analyticsData.exam.grade as keyof typeof gradesAr] || analyticsData.exam.grade}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {subjectsAr[analyticsData.exam.subject as keyof typeof subjectsAr] || analyticsData.exam.subject}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-primary">{analyticsData.exam.title}</h2>
                <p className="text-sm text-text-muted mt-1">{analyticsData.exam.description || 'لا يوجد وصف مضاف للاختبار.'}</p>
              </div>

              {/* Analytics Summary Row */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-card/70 p-4 rounded-2xl border border-border-main text-center">
                  <div className="text-xs text-text-muted font-bold mb-1">الطلاب الذين امتحنوا</div>
                  <div className="text-2xl font-black text-primary">{analyticsData.analytics.takesCount}</div>
                </div>
                <div className="bg-card/70 p-4 rounded-2xl border border-border-main text-center">
                  <div className="text-xs text-text-muted font-bold mb-1">متوسط الدرجات</div>
                  <div className="text-2xl font-black text-primary">{analyticsData.analytics.averageScore}%</div>
                </div>
                <div className="bg-card/70 p-4 rounded-2xl border border-border-main text-center">
                  <div className="text-xs text-text-muted font-bold mb-1">أعلى درجة</div>
                  <div className="text-2xl font-black text-green-600">{analyticsData.analytics.highestScore}%</div>
                </div>
                <div className="bg-card/70 p-4 rounded-2xl border border-border-main text-center">
                  <div className="text-xs text-text-muted font-bold mb-1">أقل درجة</div>
                  <div className="text-2xl font-black text-red-500">{analyticsData.analytics.lowestScore}%</div>
                </div>
                <div className="bg-card/70 p-4 rounded-2xl border border-border-main text-center col-span-2 lg:col-span-1">
                  <div className="text-xs text-text-muted font-bold mb-1">نسبة النجاح (50%+)</div>
                  <div className="text-2xl font-black text-gold-dark">{analyticsData.analytics.successRate}%</div>
                </div>
              </div>

              {/* Students performance detailed table */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary flex items-center gap-1.5">
                  <GraduationCap className="w-5 h-5 text-gold" />
                  قائمة نتائج أداء الطلاب التفصيلية
                </h3>

                {analyticsData.students.length === 0 ? (
                  <div className="text-center p-8 bg-card rounded-2xl border border-border-main text-slate-400 font-semibold text-sm">
                    لم يقم أي طالب بتأدية هذا الامتحان حتى الآن.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-border-main">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-card text-text-main font-bold border-b border-border-main">
                        <tr>
                          <th className="p-4">اسم الطالب</th>
                          <th className="p-4">رقم الهاتف</th>
                          <th className="p-4">النتيجة والدرجة</th>
                          <th className="p-4">إجابات صحيحة</th>
                          <th className="p-4">تاريخ ووقت التقديم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-text-main">
                        {analyticsData.students.map((st: any, idx: number) => {
                          const isPassed = st.score >= 50;
                          return (
                            <tr key={idx} className="hover:bg-card/50 transition-colors">
                              <td className="p-4 font-bold text-primary">{st.userName}</td>
                              <td className="p-4 font-mono text-xs">{st.userPhone || '—'}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                  isPassed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                                }`}>
                                  {st.score}% {isPassed ? '🏆 ناجح' : '⚠️ راسب'}
                                </span>
                              </td>
                              <td className="p-4 text-xs font-bold text-text-muted">
                                {st.correctCount} صحيحة / {st.wrongCount} خاطئة
                              </td>
                              <td className="p-4 text-xs text-slate-400">
                                {new Date(st.takenAt).toLocaleString('ar-EG')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
