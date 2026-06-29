import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { 
  Users, BookOpen, FileText, TrendingUp, AlertCircle, Plus, Edit2, Trash2, 
  Video, FileDown, Search, UploadCloud, Loader2, Paperclip, ChevronLeft, X,
  GraduationCap, Calendar, CheckCircle2, Bell, Send, Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { gradesAr } from '../data';
import { AdminExams } from '../components/AdminExams';
import { StudentProfileDetail } from '../components/StudentProfileDetail';

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

const getAuthenticatedUrl = (url: string) => {
  if (!url) return '';
  if (!url.startsWith('/uploads/')) return url;
  const token = localStorage.getItem('token');
  if (!token) return url;
  return `${url}?token=${encodeURIComponent(token)}`;
};

function FileUploader({
  label,
  accept,
  fileType,
  value,
  onChange,
  onProgressChange
}: {
  label: string;
  accept: string;
  fileType: 'video' | 'pdf';
  value: string;
  onChange: (url: string) => void;
  onProgressChange?: (progress: number | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    // Validation
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (fileType === 'video') {
      const allowed = ['mp4', 'mov', 'avi', 'webm'];
      if (!allowed.includes(fileExt)) {
        setError('صيغة الفيديو غير مدعومة. الصيغ المسموحة: MP4, MOV, AVI, WEBM');
        return;
      }
    } else {
      const allowed = ['pdf', 'docx', 'pptx'];
      if (!allowed.includes(fileExt)) {
        setError('صيغة المستند غير مدعومة. الصيغ المسموحة: PDF, DOCX, PPTX');
        return;
      }
    }

    setError('');
    setUploading(true);
    setProgress(0);
    if (onProgressChange) onProgressChange(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload');
    const token = localStorage.getItem('token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        setProgress(percentage);
        if (onProgressChange) onProgressChange(percentage);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      setProgress(null);
      if (onProgressChange) onProgressChange(null);
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          onChange(res.url);
        } catch (e) {
          setError('فشل في قراءة استجابة الخادم');
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          setError(res.error || 'فشل في رفع الملف');
        } catch (e) {
          setError('حدث خطأ أثناء رفع الملف');
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setProgress(null);
      if (onProgressChange) onProgressChange(null);
      setError('حدث خطأ في الاتصال بالشبكة');
    };

    xhr.send(formData);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDeleteFile = async () => {
    if (!confirm('هل تريد بالتأكيد حذف هذا الملف؟')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/upload/delete-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url: value })
      });
      if (res.ok) {
        onChange('');
      } else {
        onChange('');
      }
    } catch (err) {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-text-main mb-1">{label}</label>
      
      {value ? (
        <div className="bg-card p-4 rounded-2xl border border-border-main flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 ${fileType === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'} rounded-xl flex items-center justify-center shrink-0`}>
                {fileType === 'video' ? <Video className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
              </div>
              <div className="truncate text-sm font-bold text-text-main max-w-xs md:max-w-md" dir="ltr">
                {value.split('/').pop()}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={triggerSelect}
                className="px-3 py-1.5 text-xs bg-bg text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors font-semibold"
              >
                استبدال
              </button>
              <button
                type="button"
                onClick={handleDeleteFile}
                className="px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg transition-colors font-semibold"
              >
                حذف
              </button>
            </div>
          </div>

          {fileType === 'video' && (
            <div className="aspect-video bg-black rounded-xl overflow-hidden mt-1 shadow-inner relative">
              <video src={getAuthenticatedUrl(value)} controls className="w-full h-full object-contain" />
            </div>
          )}
          {fileType === 'pdf' && (
            <a
              href={getAuthenticatedUrl(value)}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1.5 bg-bg py-2 px-3 rounded-xl border border-border-main"
            >
              <Paperclip className="w-3.5 h-3.5" /> معاينة المستند المرفوع في علامة تبويب جديدة
            </a>
          )}
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={triggerSelect}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
            isDragging 
              ? 'border-gold bg-gold/5' 
              : uploading 
                ? 'border-slate-300 bg-card cursor-not-allowed' 
                : 'border-border-main hover:border-gold hover:bg-card'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleSelect}
            accept={accept}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <div className="space-y-3 w-full max-w-xs mx-auto">
              <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
              <div className="text-sm font-semibold text-text-muted">جاري رفع الملف... {progress}%</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gold h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-card group-hover:bg-card text-slate-400 group-hover:text-gold rounded-xl flex items-center justify-center transition-all shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-main">اسحب وأفلت الملف هنا أو انقر للاختيار</p>
                <p className="text-xs text-slate-400 mt-1">
                  {fileType === 'video' 
                    ? 'فيديو (MP4, MOV, AVI, WEBM)' 
                    : 'مستند (PDF, DOCX, PPTX)'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 flex items-center gap-1.5 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'content' | 'exams' | 'feedback' | 'settings'>('overview');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [studentError, setStudentError] = useState('');
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalStudents: 0, activeStudents: 0, totalLessons: 0, avgProgress: 0 });
  const [search, setSearch] = useState('');
  const [selectedStudentIdForProfile, setSelectedStudentIdForProfile] = useState<string | null>(null);

  // CMS states
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any | null>(null);
  const [contentSearch, setContentSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Feedback System States
  const [reportsSummary, setReportsSummary] = useState<any[]>([]);
  const [reportsAnalytics, setReportsAnalytics] = useState<any>({
    totalReports: 0,
    uniqueStudents: 0,
    difficultLessonsCount: 0,
    topLessons: []
  });
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReportLessonId, setSelectedReportLessonId] = useState<string | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Resolution controls
  const [additionalExplanation, setAdditionalExplanation] = useState('');
  const [reviewVideoUrl, setReviewVideoUrl] = useState('');
  const [notificationText, setNotificationText] = useState('');
  const [resolutionMessage, setResolutionMessage] = useState<string | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchFeedbackData = async () => {
    setLoadingReports(true);
    const token = localStorage.getItem('token');
    try {
      const [summaryRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/lessons/reports-summary', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/lessons/reports-analytics', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (summaryRes.ok && analyticsRes.ok) {
        const summaryData = await summaryRes.json();
        const analyticsData = await analyticsRes.json();
        setReportsSummary(summaryData);
        setReportsAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Error fetching feedback data:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchReportDetail = async (lessonId: string) => {
    setLoadingDetail(true);
    setSelectedReportLessonId(lessonId);
    setResolutionMessage(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/reports-detail`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedReportDetail(data);
        setAdditionalExplanation(data.lesson.additionalExplanation || '');
        setReviewVideoUrl(data.lesson.reviewVideoUrl || '');
        setNotificationText('');
      }
    } catch (err) {
      console.error('Error fetching report detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResolveReports = async (lessonId: string) => {
    setActionSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/reports-resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setResolutionMessage('تم تحديد الدرس كمكتمل المراجعة وحذف كافة بلاغات عدم الفهم بنجاح!');
        setSelectedReportDetail(null);
        setSelectedReportLessonId(null);
        fetchFeedbackData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleSaveResources = async (lessonId: string) => {
    setActionSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/reports-resources`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalExplanation, reviewVideoUrl })
      });
      if (res.ok) {
        setResolutionMessage('تم حفظ الشرح الإضافي وفيديو المراجعة بنجاح!');
        setSelectedReportDetail((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            lesson: {
              ...prev.lesson,
              additionalExplanation,
              reviewVideoUrl
            }
          };
        });
        fetchFeedbackData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleSendNotification = async (lessonId: string) => {
    setActionSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/reports-notify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notificationText })
      });
      if (res.ok) {
        setResolutionMessage('تم إرسال إشعار فوري وتنبيه لجميع طلاب هذا الصف بنجاح!');
        setNotificationText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionSubmitting(false);
    }
  };

  const [isClearing, setIsClearing] = useState(false);
  const handleClearSystem = async () => {
    if (!window.confirm('تحذير: سيتم حذف جميع بيانات الطلاب والمحتوى (الدروس والامتحانات) نهائياً. هل أنت متأكد؟')) {
      return;
    }

    setIsClearing(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/system/clear-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('تم مسح جميع البيانات بنجاح. سيتم إعادة توجيهك الآن.');
        window.location.reload();
      } else {
        alert('حدث خطأ أثناء مسح البيانات.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الاتصال بالسيرفر.');
    } finally {
      setIsClearing(false);
    }
  };

  const fetchLessons = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/lessons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'teacher') {
      const token = localStorage.getItem('token');
      
      fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setStats(data));

      fetch('/api/admin/students', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setStudents(data.students || []));
      
      fetchLessons();
      fetchFeedbackData();
    }
  }, [user, activeTab]);

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/auth" />;
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsAddingStudent(false);
        // Refresh students
        const stdRes = await fetch('/api/admin/students', { headers: { Authorization: `Bearer ${token}` } });
        const stdData = await stdRes.json();
        setStudents(stdData.students || []);
      } else {
        const error = await res.json();
        alert(error.error || 'حدث خطأ');
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف الطالب؟')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/admin/students/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editingStudent.name || !editingStudent.phone || !editingStudent.grade) {
      setStudentError('يرجى ملء الاسم ورقم الهاتف والصف الدراسي');
      return;
    }
    
    setIsUpdatingStudent(true);
    setStudentError('');
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingStudent.name,
          phone: editingStudent.phone,
          parentPhone: editingStudent.parentPhone,
          grade: editingStudent.grade,
          status: editingStudent.status || 'active',
          password: editingStudent.newPassword || undefined
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...data.student } : s));
        setEditingStudent(null);
      } else {
        setStudentError(data.error || 'حدث خطأ أثناء تعديل بيانات الطالب');
      }
    } catch (err) {
      setStudentError('فشل الاتصال بالخادم');
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson.title || !currentLesson.subject || !currentLesson.term || !currentLesson.grade) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    const token = localStorage.getItem('token');
    const isNew = currentLesson.id === 'new';
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/admin/lessons' : `/api/admin/lessons/${currentLesson.id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(currentLesson)
      });

      if (res.ok) {
        setCurrentLesson(null);
        await fetchLessons();
        // Update stats
        const statsRes = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        const error = await res.json();
        alert(error.error || 'حدث خطأ أثناء حفظ الدرس');
      }
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الدرس');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس نهائياً؟ سيتم مسح جميع الملفات المرفقة به.')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchLessons();
        fetchFeedbackData();
        // Update stats
        const statsRes = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        alert('حدث خطأ أثناء حذف الدرس');
      }
    } catch (err) {
      alert('حدث خطأ أثناء حذف الدرس');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(search) || s.phone.includes(search) || (s.id && s.id.includes(search))
  );

  if (selectedStudentIdForProfile) {
    return (
      <StudentProfileDetail 
        studentId={selectedStudentIdForProfile} 
        onClose={() => setSelectedStudentIdForProfile(null)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Helmet>
        <title>أكاديمية جمعة عبد الشفيع | لوحة تحكم المعلم</title>
        <meta name="description" content="لوحة تحكم المعلم في أكاديمية جمعة عبد الشفيع - إدارة المحتوى والطلاب وتحليل الأداء العام." />
      </Helmet>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary mb-2">لوحة تحكم المعلم</h1>
          <p className="text-base text-text-muted">إدارة المحتوى والطلاب وتحليل الأداء</p>
        </div>
        <div className="flex gap-2 bg-bg p-1 rounded-xl shadow-sm border border-border-main overflow-x-auto whitespace-nowrap no-scrollbar scroll-smooth">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs md:text-sm font-black rounded-lg transition-all shrink-0 ${activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary hover:bg-card'}`}
          >
            نظرة عامة
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 text-xs md:text-sm font-black rounded-lg transition-all shrink-0 ${activeTab === 'students' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary hover:bg-card'}`}
          >
            الطلاب
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2.5 text-xs md:text-sm font-black rounded-lg transition-all shrink-0 ${activeTab === 'content' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary hover:bg-card'}`}
          >
            المحتوى
          </button>
          <button 
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2.5 text-xs md:text-sm font-black rounded-lg transition-all shrink-0 ${activeTab === 'exams' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary hover:bg-card'}`}
          >
            الاختبارات والامتحانات
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2.5 text-xs md:text-sm font-black rounded-lg transition-all shrink-0 ${activeTab === 'feedback' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary hover:bg-card'}`}
          >
            إعادة شرح الدروس
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs md:text-sm font-black rounded-lg transition-all shrink-0 ${activeTab === 'settings' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary hover:bg-card'}`}
          >
            الإعدادات
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Users className="w-5 h-5" />
                <h3 className="font-bold">إجمالي الطلاب</h3>
              </div>
              <div className="text-3xl font-extrabold text-primary">{stats.totalStudents || 0}</div>
            </div>
            <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <Users className="w-5 h-5" />
                <h3 className="font-bold">نشط اليوم</h3>
              </div>
              <div className="text-3xl font-extrabold text-primary">{stats.activeStudents || 0}</div>
            </div>
            <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main">
              <div className="flex items-center gap-3 text-purple-600 mb-2">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold">إجمالي الدروس</h3>
              </div>
              <div className="text-3xl font-extrabold text-primary">{stats.totalLessons || 0}</div>
            </div>
            <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main">
              <div className="flex items-center gap-3 text-rose-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-bold">متوسط الإنجاز</h3>
              </div>
              <div className="text-3xl font-extrabold text-primary">{stats.avgProgress || 0}%</div>
            </div>
          </div>

          {/* Feedback & Understanding Summary Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            {/* Feedback Stats Mini Box */}
            <div className="lg:col-span-1 bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl p-6 border border-red-100 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-red-700 bg-red-100/50 px-2.5 py-1 rounded-full">تحليل الفهم</span>
                <h4 className="font-extrabold text-primary text-xl mt-3 mb-2">حالة فهم الدروس</h4>
                <p className="text-xs text-text-muted leading-relaxed">هناك دروس تم الإبلاغ عنها بأنها صعبة وتحتاج إلى توضيح إضافي ومتابعة من قبلكم.</p>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-xs text-text-muted bg-bg p-2.5 rounded-lg border border-border-main shadow-sm">
                  <span>طلاب بحاجة لإعادة شرح:</span>
                  <span className="font-black text-red-600">{reportsAnalytics.uniqueStudents || 0} طالب</span>
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted bg-bg p-2.5 rounded-lg border border-border-main shadow-sm">
                  <span>الدروس الأكثر صعوبة:</span>
                  <span className="font-black text-amber-600">{reportsAnalytics.difficultLessonsCount || 0} درس</span>
                </div>
                <div className="flex justify-between items-center text-xs text-text-muted bg-bg p-2.5 rounded-lg border border-border-main shadow-sm">
                  <span>إجمالي طلبات الفهم:</span>
                  <span className="font-black text-blue-600">{reportsAnalytics.totalReports || 0} طلب</span>
                </div>
              </div>
            </div>

            {/* Most Reported Lessons Mini List */}
            <div className="lg:col-span-2 bg-bg rounded-2xl p-6 border border-border-main flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-extrabold text-primary text-lg">أكثر الدروس صعوبة (طلبات إعادة الشرح)</h4>
                  <button 
                    onClick={() => setActiveTab('feedback')}
                    className="text-xs font-black text-gold hover:underline"
                  >
                    عرض الكل ←
                  </button>
                </div>
                
                {reportsAnalytics.topLessons && reportsAnalytics.topLessons.length > 0 ? (
                  <div className="space-y-2.5">
                    {reportsAnalytics.topLessons.slice(0, 3).map((lesson: any, idx: number) => (
                      <div key={lesson.lessonId} className="flex justify-between items-center p-3 bg-card rounded-xl border border-border-main hover:bg-card/50 transition-colors">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</span>
                          <span className="font-extrabold text-primary text-sm truncate">{lesson.lessonTitle}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-text-muted">{gradesAr[lesson.grade as keyof typeof gradesAr] || lesson.grade}</span>
                          <span className="font-bold text-red-600 bg-bg px-2 py-0.5 rounded border text-xs">{lesson.reportCount} طالب</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm py-8 text-center font-bold">رائع! لا يوجد أي دروس صعبة مبلّغ عنها حالياً.</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border-main flex justify-end">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className="px-4 py-2 bg-primary hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" /> مراجعة وإعادة شرح الدروس الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-primary text-xl">إدارة الطلاب</h3>
            <button 
              onClick={() => setIsAddingStudent(!isAddingStudent)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-5 h-5" /> إضافة طالب جديد
            </button>
          </div>

          {isAddingStudent && (
            <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main">
              <h4 className="font-bold text-primary mb-4 text-lg">بيانات الطالب الجديد</h4>
              <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">الاسم الرباعي</label>
                  <input name="name" type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">رقم الهاتف</label>
                  <input name="phone" type="tel" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold outline-none transition-all" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">رقم هاتف ولي الأمر</label>
                  <input name="parentPhone" type="tel" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold outline-none transition-all" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">كلمة المرور</label>
                  <input name="password" type="password" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold outline-none transition-all" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">الصف الدراسي</label>
                  <select name="grade" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold outline-none transition-all bg-bg">
                    <option value="first">الصف الأول الثانوي</option>
                    <option value="second">الصف الثاني الثانوي</option>
                    <option value="third">الصف الثالث الثانوي</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setIsAddingStudent(false)} className="px-6 py-2 bg-card text-text-main font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" className="px-6 py-2 bg-gold text-primary font-semibold rounded-lg hover:bg-gold-dark transition-colors">
                    إنشاء حساب
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-bg rounded-3xl shadow-sm border border-border-main overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border-main flex flex-col md:flex-row justify-between gap-4">
              <h4 className="font-black text-primary text-lg">قائمة الطلاب المسجلين</h4>
              <div className="relative w-full sm:w-80">
                <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم، الكود، أو رقم الهاتف..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-card border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm"
                />
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-text-muted font-black text-lg">
                  لا توجد نتائج بحث مطابقة
                </div>
              ) : (
                <table className="w-full text-right text-sm">
                  <thead className="bg-card text-text-muted">
                    <tr>
                      <th className="px-6 py-4 font-black">كود الطالب</th>
                      <th className="px-6 py-4 font-black">اسم الطالب</th>
                      <th className="px-6 py-4 font-black">الصف</th>
                      <th className="px-6 py-4 font-black">الهاتف</th>
                      <th className="px-6 py-4 font-black">ولي الأمر</th>
                      <th className="px-6 py-4 font-black">التقدم</th>
                      <th className="px-6 py-4 font-black">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-card/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">#{student.id.split('_').pop()}</td>
                        <td className="px-6 py-4 font-black text-primary cursor-pointer hover:text-gold transition-colors" onClick={() => setSelectedStudentIdForProfile(student.id)}>
                          <div className="flex items-center gap-2">
                            <span>{student.name}</span>
                            {student.status === 'disabled' && (
                              <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">معطل</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-muted">{gradesAr[student.grade as keyof typeof gradesAr]}</td>
                        <td className="px-6 py-4 text-text-muted" dir="ltr">{student.phone}</td>
                        <td className="px-6 py-4 text-text-muted" dir="ltr">{student.parentPhone}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-card h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gold h-full" style={{ width: `${student.progress || 0}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black text-text-muted">{student.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedStudentIdForProfile(student.id)} className="p-2 text-primary hover:bg-card rounded-lg transition-all"><TrendingUp className="w-4 h-4" /></button>
                            <button onClick={() => setEditingStudent(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-text-muted font-black">لا توجد نتائج</div>
              ) : (
                filteredStudents.map(student => (
                  <div key={student.id} className="bg-card/50 p-4 rounded-2xl border border-border-main space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-black text-primary text-base" onClick={() => setSelectedStudentIdForProfile(student.id)}>{student.name}</h5>
                        <span className="text-[10px] font-black text-slate-400">كود: #{student.id.split('_').pop()}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedStudentIdForProfile(student.id)} className="p-2 bg-bg text-primary rounded-lg border border-border-main"><TrendingUp className="w-4 h-4" /></button>
                        <button onClick={() => setEditingStudent(student)} className="p-2 bg-bg text-blue-600 rounded-lg border border-border-main"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(student.id)} className="p-2 bg-bg text-red-600 rounded-lg border border-border-main"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold text-text-muted">
                      <div className="bg-bg p-2 rounded-lg border border-border-main">
                        <span className="text-[10px] text-slate-400 block mb-1">الصف</span>
                        {gradesAr[student.grade as keyof typeof gradesAr]}
                      </div>
                      <div className="bg-bg p-2 rounded-lg border border-border-main">
                        <span className="text-[10px] text-slate-400 block mb-1">التقدم</span>
                        {student.progress || 0}%
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs font-bold bg-bg p-3 rounded-xl border border-border-main">
                       <span className="text-text-muted">رقم الهاتف:</span>
                       <span dir="ltr">{student.phone}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        {/* Edit Student Modal Overlay */}
        {editingStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-bg rounded-3xl shadow-2xl border border-border-main max-w-lg w-full p-6 md:p-8 space-y-6 relative text-right" dir="rtl">
              <div className="flex justify-between items-center pb-4 border-b border-border-main">
                <div>
                  <h3 className="font-extrabold text-primary text-xl">تعديل بيانات الطالب</h3>
                  <p className="text-xs text-slate-400 mt-1">تحديث الملف الشخصي وحالة الحساب والصف الدراسي</p>
                </div>
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentError('');
                  }}
                  className="p-2 text-slate-400 hover:text-text-muted hover:bg-card rounded-full transition-all cursor-pointer"
                  title="إلغاء والعودة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {studentError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl font-bold text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-text-main mb-1.5">الاسم الرباعي <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-main mb-1.5">رقم الهاتف <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={editingStudent.phone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-bold"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-main mb-1.5">رقم هاتف ولي الأمر <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={editingStudent.parentPhone}
                      onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-bold"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-main mb-1.5">الصف الدراسي <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={editingStudent.grade}
                      onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-bold bg-bg"
                    >
                      <option value="first">الصف الأول الثانوي</option>
                      <option value="second">الصف الثاني الثانوي</option>
                      <option value="third">الصف الثالث الثانوي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-text-main mb-1.5">حالة الحساب <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={editingStudent.status}
                      onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-bold bg-bg"
                    >
                      <option value="active">نشط 🟢</option>
                      <option value="disabled">معطل 🚫</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-main">
                  <label className="block text-xs font-black text-text-main mb-1">تغيير كلمة المرور</label>
                  <p className="text-[10px] text-slate-400 mb-2">اتركه فارغاً إذا كنت لا ترغب في تغيير كلمة المرور الحالية للطالب</p>
                  <input
                    type="password"
                    value={editingStudent.newPassword}
                    onChange={(e) => setEditingStudent({ ...editingStudent, newPassword: e.target.value })}
                    placeholder="كلمة مرور جديدة..."
                    className="w-full px-4 py-2.5 border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-bold placeholder:font-normal"
                    dir="ltr"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border-main">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStudent(null);
                      setStudentError('');
                    }}
                    className="px-6 py-2.5 bg-card text-text-main font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStudent}
                    className="px-6 py-2.5 bg-primary hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingStudent ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : 'حفظ التعديلات'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          {currentLesson ? (
            /* Add/Edit Lesson Form */
            <div className="bg-bg p-6 md:p-8 rounded-3xl shadow-sm border border-border-main space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border-main">
                <div>
                  <h3 className="font-bold text-primary text-xl">
                    {currentLesson.id === 'new' ? 'إضافة درس جديد للمنصة' : 'تعديل الدرس الحالي'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">يرجى ملء البيانات وإرفاق ملفات الشرح والملخصات</p>
                </div>
                <button
                  onClick={() => setCurrentLesson(null)}
                  className="p-2 text-slate-400 hover:text-text-muted hover:bg-card rounded-full transition-all"
                  title="إلغاء والعودة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">عنوان الدرس <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={currentLesson.title || ''}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                      placeholder="مثال: شرح درس الفاعل في النحو"
                      className="w-full px-4 py-3 border border-border-main rounded-2xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-bold placeholder:font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">مدة الدرس بالدقائق <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      value={currentLesson.durationMinutes || ''}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, durationMinutes: Number(e.target.value) || 0 })}
                      placeholder="مثال: 45"
                      className="w-full px-4 py-3 border border-border-main rounded-2xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-bold placeholder:font-normal"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">الصف الدراسي <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={currentLesson.grade || ''}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, grade: e.target.value })}
                      className="w-full px-4 py-3 border border-border-main rounded-2xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm bg-bg font-bold text-text-main"
                    >
                      <option value="">-- اختر الصف الدراسي --</option>
                      <option value="first">الصف الأول الثانوي</option>
                      <option value="second">الصف الثاني الثانوي</option>
                      <option value="third">الصف الثالث الثانوي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">الفصل الدراسي <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={currentLesson.term || ''}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, term: e.target.value })}
                      className="w-full px-4 py-3 border border-border-main rounded-2xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm bg-bg font-bold text-text-main"
                    >
                      <option value="">-- اختر الفصل الدراسي --</option>
                      <option value="first">الفصل الدراسي الأول</option>
                      <option value="second">الفصل الدراسي الثاني</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2">فرع المادة <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={currentLesson.subject || ''}
                      onChange={(e) => setCurrentLesson({ ...currentLesson, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-border-main rounded-2xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm bg-bg font-bold text-text-main"
                    >
                      <option value="">-- اختر فرع المادة --</option>
                      {Object.entries(subjectsAr).map(([key, val]) => (
                        <option key={key} value={key}>{val}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">وصف تفصيلي للدرس</label>
                  <textarea
                    rows={3}
                    value={currentLesson.description || ''}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                    placeholder="اكتب وصفاً أو تلميحات عما سيتعلمه الطالب في هذه الحلقة..."
                    className="w-full px-4 py-3 border border-border-main rounded-2xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border-main">
                  <FileUploader
                    label="فيديو الشرح للمحاضرة"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    fileType="video"
                    value={currentLesson.videoUrl || ''}
                    onChange={(url) => setCurrentLesson({ ...currentLesson, videoUrl: url })}
                  />

                  <FileUploader
                    label="ملخص الدرس المرفق (PDF / الملزمة)"
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    fileType="pdf"
                    value={currentLesson.pdfUrl || ''}
                    onChange={(url) => setCurrentLesson({ ...currentLesson, pdfUrl: url })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border-main">
                  <button
                    type="button"
                    onClick={() => setCurrentLesson(null)}
                    className="px-6 py-3 bg-card text-text-main font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gold text-primary font-bold rounded-xl hover:bg-gold-dark transition-all hover:-translate-y-0.5 text-sm shadow-md shadow-gold/10"
                  >
                    حفظ ونشر الدرس
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Lessons Directory List view */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-primary text-xl">لوحة إدارة الدروس والمحتوى</h3>
                  <p className="text-sm text-text-muted">قم بإضافة دروس ومحاضرات جديدة وإرفاق الملازم والفيديوهات للطلاب</p>
                </div>
                <button
                  onClick={() => setCurrentLesson({
                    id: 'new',
                    title: '',
                    description: '',
                    subject: '',
                    term: '',
                    grade: '',
                    durationMinutes: 0,
                    videoUrl: '',
                    pdfUrl: ''
                  })}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-5 h-5" /> إضافة درس جديد
                </button>
              </div>

              {/* Filters & Search box */}
              <div className="bg-bg p-6 rounded-3xl shadow-sm border border-border-main grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث باسم الدرس..."
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    className="w-full pr-11 pl-4 py-2.5 bg-card border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-semibold"
                  />
                </div>

                <div>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-card border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-semibold text-text-main bg-bg"
                  >
                    <option value="">جميع الصفوف الدراسية</option>
                    <option value="first">الصف الأول الثانوي</option>
                    <option value="second">الصف الثاني الثانوي</option>
                    <option value="third">الصف الثالث الثانوي</option>
                  </select>
                </div>

                <div>
                  <select
                    value={termFilter}
                    onChange={(e) => setTermFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-card border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-semibold text-text-main bg-bg"
                  >
                    <option value="">جميع الفصول الدراسية</option>
                    <option value="first">الفصل الدراسي الأول</option>
                    <option value="second">الفصل الدراسي الثاني</option>
                  </select>
                </div>

                <div>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-card border border-border-main rounded-xl focus:ring-2 focus:ring-gold outline-none transition-all text-sm font-semibold text-text-main bg-bg"
                  >
                    <option value="">جميع الفروع (المواد)</option>
                    {Object.entries(subjectsAr).map(([key, val]) => (
                      <option key={key} value={key}>{val}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lessons Display (Tables and Cards) */}
              {(() => {
                const filtered = lessons.filter(l => {
                  const matchesSearch = l.title.toLowerCase().includes(contentSearch.toLowerCase()) || 
                                        (l.description && l.description.toLowerCase().includes(contentSearch.toLowerCase()));
                  const matchesGrade = !gradeFilter || l.grade === gradeFilter;
                  const matchesTerm = !termFilter || l.term === termFilter;
                  const matchesSubject = !subjectFilter || l.subject === subjectFilter;
                  return matchesSearch && matchesGrade && matchesTerm && matchesSubject;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-bg p-12 rounded-3xl shadow-sm border border-border-main text-center space-y-3">
                      <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-text-main text-lg">لم يتم رفع محتوى لهذا الدرس بعد</h4>
                      <p className="text-sm text-slate-400 max-w-sm mx-auto">انقر على زر "إضافة درس جديد" لبدء رفع فيديوهات ومذكرات الشرح على المنصة</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((lesson) => (
                      <div key={lesson.id} className="bg-bg rounded-3xl border border-border-main overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                        <div className="h-3 bg-gradient-to-l from-primary to-gold"></div>
                        
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-1 bg-card text-text-muted text-[11px] font-bold rounded-lg flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5" /> {gradesAr[lesson.grade as keyof typeof gradesAr] || lesson.grade}
                              </span>
                              <span className="px-2.5 py-1 bg-gold/10 text-gold-dark text-[11px] font-bold rounded-lg flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {termsAr[lesson.term as keyof typeof termsAr] || lesson.term}
                              </span>
                              <span className="px-2.5 py-1 bg-card text-text-main text-[11px] font-bold rounded-lg">
                                {subjectsAr[lesson.subject as keyof typeof subjectsAr] || lesson.subject}
                              </span>
                            </div>

                            <h4 className="font-bold text-primary text-lg group-hover:text-gold transition-colors pt-2">
                              {lesson.title}
                            </h4>
                            
                            {lesson.description && (
                              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                                {lesson.description}
                              </p>
                            )}
                          </div>

                          <div className="bg-card p-3 rounded-2xl space-y-2 text-xs">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-text-muted flex items-center gap-1.5">
                                <Video className="w-4 h-4 text-blue-500" /> ملف الفيديو
                              </span>
                              {lesson.videoUrl ? (
                                <span className="text-green-600 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> متاح
                                </span>
                              ) : (
                                <span className="text-slate-400">غير متوفر</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-text-muted flex items-center gap-1.5">
                                <FileDown className="w-4 h-4 text-red-500" /> مذكرة الشرح (PDF)
                              </span>
                              {lesson.pdfUrl ? (
                                <span className="text-green-600 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> متاح
                                </span>
                              ) : (
                                <span className="text-slate-400">غير متوفر</span>
                              )}
                            </div>

                            {lesson.durationMinutes > 0 && (
                              <div className="flex items-center justify-between font-semibold pt-1 border-t border-border-main text-slate-400">
                                <span>مدة المحاضرة</span>
                                <span>{lesson.durationMinutes} دقيقة</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-4 border-t border-border-main">
                            <button
                              onClick={() => setCurrentLesson(lesson)}
                              className="flex-1 py-2.5 px-3 bg-card hover:bg-gold/10 text-text-main hover:text-gold-dark font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 border border-border-main hover:border-gold/30 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> تعديل واستبدال
                            </button>
                            
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="p-2.5 bg-card hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-border-main hover:border-red-100 cursor-pointer"
                              title="حذف الدرس نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {activeTab === 'exams' && (
        <AdminExams />
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-primary">الدروس التي تحتاج إلى إعادة شرح</h2>
              <p className="text-sm text-text-muted">متابعة الدروس الصعبة التي واجه الطلاب مشكلة في فهمها وإدارتها</p>
            </div>
            <button 
              onClick={fetchFeedbackData}
              disabled={loadingReports}
              className="px-4 py-2 bg-card hover:bg-slate-200 text-text-main font-bold rounded-lg transition-all text-sm flex items-center gap-2"
            >
              {loadingReports ? (
                <span className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></span>
              ) : 'تحديث البيانات 🔄'}
            </button>
          </div>

          {/* Feedback Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-text-muted">طلاب بحاجة إلى إعادة شرح</span>
                <h4 className="text-3xl font-extrabold text-primary mt-1">{reportsAnalytics.uniqueStudents || 0} طالباً</h4>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-text-muted">الدروس الأكثر صعوبة</span>
                <h4 className="text-3xl font-extrabold text-primary mt-1">{reportsAnalytics.difficultLessonsCount || 0} درساً</h4>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-text-muted">إجمالي طلبات إعادة الشرح</span>
                <h4 className="text-3xl font-extrabold text-primary mt-1">{reportsAnalytics.totalReports || 0} طلباً</h4>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Two-Column Explorer Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* List of Lessons */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main space-y-4">
                <h3 className="font-extrabold text-primary text-lg border-b border-border-main pb-3">قائمة الدروس المستلمة</h3>
                
                {loadingReports ? (
                  <div className="py-10 text-center text-slate-400 font-bold">جاري تحميل تقارير الطلاب...</div>
                ) : reportsSummary.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">كل شيء رائع! لا توجد دروس مبلّغ عنها حالياً.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {reportsSummary.map((item: any) => {
                      // Color code based on reports count
                      let badgeColor = "bg-green-50 text-green-700 border-green-200";
                      let severityText = "صعوبة خفيفة 🟢";
                      if (item.reportCount >= 15) {
                        badgeColor = "bg-red-50 text-red-700 border-red-200";
                        severityText = "صعوبة بالغة 🔴";
                      } else if (item.reportCount >= 5) {
                        badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                        severityText = "صعوبة متوسطة 🟡";
                      }

                      return (
                        <button
                          key={item.lessonId}
                          onClick={() => fetchReportDetail(item.lessonId)}
                          className={`w-full text-right p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                            selectedReportLessonId === item.lessonId
                              ? 'bg-card border-primary ring-2 ring-primary/20 shadow-sm'
                              : 'bg-bg border-border-main hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-start w-full gap-2">
                            <span className="font-extrabold text-primary text-base leading-snug line-clamp-2">{item.lessonTitle}</span>
                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border shrink-0 ${badgeColor}`}>
                              {severityText}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted w-full pt-2 border-t border-border-main">
                            <span>مادة {subjectsAr[item.subject as keyof typeof subjectsAr] || item.subject} • {gradesAr[item.grade as keyof typeof gradesAr] || item.grade}</span>
                            <span className="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg">{item.reportCount} طالب</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Lesson detail & Actions panel */}
            <div className="lg:col-span-3">
              {selectedReportLessonId ? (
                loadingDetail ? (
                  <div className="bg-bg p-12 rounded-2xl shadow-sm border border-border-main text-center font-bold text-slate-400">
                    جاري تحميل تفاصيل الدرس والطلاب...
                  </div>
                ) : selectedReportDetail ? (
                  <div className="space-y-6">
                    {/* Resolution message alert */}
                    {resolutionMessage && (
                      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl font-bold flex items-center gap-2 animate-slideDown">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <span>{resolutionMessage}</span>
                      </div>
                    )}

                    {/* Header card */}
                    <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                          <span className="text-xs font-black bg-card text-text-main px-3 py-1 rounded-full">تفاصيل الصعوبة</span>
                          <h3 className="font-black text-primary text-2xl mt-2 leading-relaxed">{selectedReportDetail.lesson.title}</h3>
                          <p className="text-sm text-text-muted mt-1">
                            مادة {subjectsAr[selectedReportDetail.lesson.subject as keyof typeof subjectsAr] || selectedReportDetail.lesson.subject} • {gradesAr[selectedReportDetail.lesson.grade as keyof typeof gradesAr] || selectedReportDetail.lesson.grade}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleResolveReports(selectedReportDetail.lesson.id)}
                          disabled={actionSubmitting}
                          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                        >
                          <CheckCircle2 className="w-4 h-4" /> تم حل المشكلة وإعادة الشرح
                        </button>
                      </div>

                      <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between text-sm">
                        <span className="font-bold text-text-main">عدد الطلاب الذين ميزوا هذا الدرس كـ "لم أفهم":</span>
                        <span className="font-black text-red-600 text-lg bg-bg px-3 py-1 rounded-lg border border-red-100 shadow-sm">{selectedReportDetail.reportCount} طالب</span>
                      </div>
                    </div>

                    {/* Resources addition card */}
                    <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main space-y-4">
                      <h4 className="font-extrabold text-primary text-base flex items-center gap-2">
                        <Save className="w-5 h-5 text-gold" />
                        رفع مصادر إضافية لتوضيح النقاط الصعبة
                      </h4>
                      <p className="text-xs text-text-muted">سيتم عرض هذه المصادر الإضافية فوراً للطلاب داخل صفحة هذا الدرس لتسهيل فهمه.</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-text-main mb-1">الشرح الإضافي المكتوب:</label>
                          <textarea
                            value={additionalExplanation}
                            onChange={(e) => setAdditionalExplanation(e.target.value)}
                            placeholder="اكتب هنا تبسيطاً إضافياً للنقاط الصعبة أو القواعد اللغوية التي تم الإبلاغ عنها..."
                            rows={4}
                            className="w-full text-sm p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-text-main mb-1">رابط فيديو إعادة الشرح (MP4 أو فيديو توضيحي):</label>
                          <input
                            type="text"
                            value={reviewVideoUrl}
                            onChange={(e) => setReviewVideoUrl(e.target.value)}
                            placeholder="مثال: /uploads/review-video.mp4 أو رابط خارجي"
                            className="w-full text-sm p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all"
                            dir="ltr"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleSaveResources(selectedReportDetail.lesson.id)}
                            disabled={actionSubmitting}
                            className="px-5 py-2 bg-primary hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <Save className="w-4 h-4" /> حفظ مصادر الشرح الإضافي
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Send notification card */}
                    <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main space-y-4">
                      <h4 className="font-extrabold text-primary text-base flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        إرسال إشعار فوري وتنبيه للطلاب
                      </h4>
                      <p className="text-xs text-text-muted">سيتم إرسال إشعار وتنبيه فوري لجميع الطلاب المقيدين في "{gradesAr[selectedReportDetail.lesson.grade as keyof typeof gradesAr] || selectedReportDetail.lesson.grade}" لتنبيههم برفع الشرح الإضافي.</p>

                      <div className="space-y-3">
                        <textarea
                          value={notificationText}
                          onChange={(e) => setNotificationText(e.target.value)}
                          placeholder={`مثال: تنبيه من الأستاذ: تم إضافة توضيح وشرح تفصيلي إضافي لدرس "${selectedReportDetail.lesson.title}". يرجى مراجعته الآن!`}
                          rows={2}
                          className="w-full text-sm p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSendNotification(selectedReportDetail.lesson.id)}
                            disabled={actionSubmitting || !notificationText.trim()}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" /> إرسال التنبيه الآن
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Student List detail */}
                    <div className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main space-y-4">
                      <h4 className="font-extrabold text-primary text-base flex items-center gap-2">
                        <Users className="w-5 h-5 text-rose-500" />
                        الطلاب الذين لم يفهموا الدرس
                      </h4>

                      <div className="overflow-x-auto border border-border-main rounded-xl">
                        <table className="w-full text-right text-sm">
                          <thead>
                            <tr className="bg-card border-b border-border-main text-text-muted">
                              <th className="p-3 font-bold">اسم الطالب</th>
                              <th className="p-3 font-bold">الصف الدراسي</th>
                              <th className="p-3 font-bold">تاريخ الإرسال</th>
                              <th className="p-3 font-bold">آخر نشاط</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReportDetail.students.map((student: any) => (
                              <tr key={student.id} className="border-b border-border-main hover:bg-card/50">
                                <td className="p-3 font-extrabold text-text-main">{student.userName}</td>
                                <td className="p-3 text-text-muted">{gradesAr[student.grade as keyof typeof gradesAr] || student.grade}</td>
                                <td className="p-3 text-text-muted text-xs">
                                  {student.submissionDate ? new Date(student.submissionDate).toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'غير معروف'}
                                </td>
                                <td className="p-3 text-text-muted text-xs">
                                  {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 'غير نشط مؤخراً'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null
              ) : (
                <div className="bg-bg p-12 rounded-2xl shadow-sm border border-border-main text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center">
                  <BookOpen className="w-16 h-16 opacity-30 text-primary mb-2" />
                  <p className="font-extrabold text-lg text-text-main">الرجاء اختيار درس من القائمة الجانبية</p>
                  <p className="text-sm text-slate-400">اختر أي درس لعرض تفاصيل بلاغات الطلاب والبدء في إعادة التوضيح والشرح لهم.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
          <div className="bg-bg p-8 rounded-3xl shadow-sm border border-border-main">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-primary">إعدادات النظام المتقدمة</h2>
                <p className="text-sm text-text-muted">إدارة قاعدة البيانات وتنظيف النظام</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
                <h3 className="text-lg font-bold text-red-800 mb-2">منطقة الخطر</h3>
                <p className="text-sm text-red-700 mb-6 leading-relaxed">
                  هذا الإجراء سيقوم بحذف جميع الطلاب المسجلين، جميع الدروس المرفوعة، جميع الامتحانات، وجميع تقارير الأداء.
                  هذا الإجراء نهائي ولا يمكن التراجع عنه.
                </p>
                <button
                  onClick={handleClearSystem}
                  disabled={isClearing}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-extrabold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isClearing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  {isClearing ? 'جاري مسح البيانات...' : 'مسح كافة بيانات الطلاب والمحتوى نهائياً'}
                </button>
              </div>
              
              <div className="bg-card p-6 rounded-2xl border border-border-main">
                <h3 className="text-lg font-bold text-primary mb-2">معلومات السيرفر</h3>
                <div className="space-y-2 text-sm text-text-muted">
                  <div className="flex justify-between border-b border-border-main pb-2">
                    <span>حالة النظام:</span>
                    <span className="font-bold text-green-600">يعمل بكفاءة ✅</span>
                  </div>
                  <div className="flex justify-between border-b border-border-main pb-2">
                    <span>الإصدار:</span>
                    <span className="font-mono">v2.1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
