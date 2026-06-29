import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import multer from 'multer';
import { GoogleGenAI, Type } from "@google/genai";
import mammoth from 'mammoth';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

// Lazy-initialize Gemini client to prevent crash if key is missing on startup
let _ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    _ai = new GoogleGenAI({
      apiKey: key
    });
  }
  return _ai;
}

app.use(cors());
app.use(express.json());

// Set up uploads folder and static routing
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.get('/uploads/:filename', (req: any, res: any) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, filename);

  // Check if file physically exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>الملف غير موجود</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; color: #1e293b; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
          h1 { color: #0f172a; margin-bottom: 10px; font-size: 24px; }
          p { color: #64748b; margin-bottom: 20px; font-size: 16px; }
          .btn { display: inline-block; background-color: #1e293b; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ الملف غير موجود</h1>
          <p>الملف الذي تحاول الوصول إليه غير موجود على الخادم أو تم حذفه.</p>
          <a href="/dashboard" class="btn">العودة للوحة التحكم</a>
        </div>
      </body>
      </html>
    `);
  }

  // Get token from query or headers
  let token = req.query.token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>غير مصرح بالدخول</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; color: #1e293b; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
          h1 { color: #ea580c; margin-bottom: 10px; font-size: 24px; }
          p { color: #64748b; margin-bottom: 20px; font-size: 16px; }
          .btn { display: inline-block; background-color: #1e293b; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔒 عذراً، الوصول غير مصرح به</h1>
          <p>يجب تسجيل الدخول أولاً لتتمكن من تحميل أو عرض هذا الملف.</p>
          <a href="/auth" class="btn">تسجيل الدخول</a>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    
    // If teacher, allow full access
    if (payload.role === 'teacher') {
      return res.sendFile(filePath);
    }

    // If student, check if they are assigned to the lesson referencing this file
    const fileUrl = `/uploads/${filename}`;
    const lesson = dbData.lessons.find((l: any) => l.videoUrl === fileUrl || l.pdfUrl === fileUrl);

    if (lesson) {
      if (payload.grade === lesson.grade) {
        // Assigned to this lesson's grade! Allow access
        return res.sendFile(filePath);
      } else {
        return res.status(403).send(`
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>غير مسموح بالدخول</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; color: #1e293b; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
              h1 { color: #dc2626; margin-bottom: 10px; font-size: 24px; }
              p { color: #64748b; margin-bottom: 20px; font-size: 16px; }
              .btn { display: inline-block; background-color: #1e293b; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ عذراً، غير مسموح بالدخول</h1>
              <p>هذا الملف مخصص لصف دراسي آخر وليس متاحاً لصفك الدراسي الحالي.</p>
              <a href="/dashboard" class="btn">العودة للوحة التحكم</a>
            </div>
          </body>
          </html>
        `);
      }
    }

    // If file is not linked to any lesson, allow the authenticated user to view/download it
    return res.sendFile(filePath);

  } catch (err) {
    return res.status(401).send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>جلسة منتهية</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; color: #1e293b; }
          .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
          h1 { color: #ea580c; margin-bottom: 10px; font-size: 24px; }
          p { color: #64748b; margin-bottom: 20px; font-size: 16px; }
          .btn { display: inline-block; background-color: #1e293b; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔒 انتهت صلاحية الجلسة</h1>
          <p>يرجى إعادة تسجيل الدخول لتتمكن من الوصول لهذا الملف.</p>
          <a href="/auth" class="btn">تسجيل الدخول</a>
        </div>
      </body>
      </html>
    `);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for videos and docs
});

// Initialize JSON Database
const DB_FILE = path.join(process.cwd(), 'database.json');
let dbData: any = { users: [], lessons: [], user_lessons: [], exams: [], user_exams: [] };

if (fs.existsSync(DB_FILE)) {
  try {
    dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (!dbData.exams) dbData.exams = [];
    if (!dbData.user_exams) dbData.user_exams = [];
    if (!dbData.lesson_reports) dbData.lesson_reports = [];
    if (!dbData.notifications) dbData.notifications = [];
  } catch (e) {
    console.error('Error loading database', e);
  }
}

const saveDb = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
};

// Create initial admin account if not exists
(async () => {
  if (!dbData.users.find((u: any) => u.role === 'teacher')) {
    const hashedPassword = await bcrypt.hash('Ma_3052009', 10);
    dbData.users.push({
      id: 'teacher_1',
      name: 'جمعة عبد الشفيع',
      phone: '01153492498',
      role: 'teacher',
      password: hashedPassword,
      status: 'active'
    });
    console.log('Admin user created.');
    saveDb();
  }
})();

// Middleware for auth
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// API Routes
app.post('/api/admin/upload', authenticate, requireAdmin, upload.single('file'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    url: fileUrl, 
    filename: req.file.filename, 
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

app.post('/api/admin/upload/delete-file', authenticate, requireAdmin, (req: any, res: any) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'الرابط مطلوب' });
  }
  
  try {
    const filename = path.basename(url);
    const filePath = path.join(UPLOADS_DIR, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: 'تم حذف الملف بنجاح' });
    }
    return res.status(404).json({ error: 'الملف غير موجود على الخادم' });
  } catch (err) {
    console.error('Error deleting file:', err);
    return res.status(500).json({ error: 'حدث خطأ أثناء حذف الملف' });
  }
});

// Admin: Create Lesson
app.post('/api/admin/lessons', authenticate, requireAdmin, (req: any, res: any) => {
  const { title, description, subject, term, grade, durationMinutes, videoUrl, pdfUrl } = req.body;
  if (!title || !subject || !term || !grade) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول الإلزامية (العنوان، المادة، الفصل، والصف)' });
  }
  const newLesson = {
    id: 'lesson_' + Date.now(),
    title,
    description: description || '',
    subject,
    term,
    grade,
    durationMinutes: Number(durationMinutes) || 0,
    videoUrl: videoUrl || '',
    pdfUrl: pdfUrl || ''
  };
  dbData.lessons.push(newLesson);
  saveDb();
  res.json({ success: true, lesson: newLesson });
});

// Admin: Update Lesson
app.put('/api/admin/lessons/:id', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { title, description, subject, term, grade, durationMinutes, videoUrl, pdfUrl } = req.body;
  const lesson = dbData.lessons.find((l: any) => l.id === id);
  if (!lesson) {
    return res.status(404).json({ error: 'الدرس غير موجود' });
  }

  lesson.title = title !== undefined ? title : lesson.title;
  lesson.description = description !== undefined ? description : lesson.description;
  lesson.subject = subject !== undefined ? subject : lesson.subject;
  lesson.term = term !== undefined ? term : lesson.term;
  lesson.grade = grade !== undefined ? grade : lesson.grade;
  lesson.durationMinutes = durationMinutes !== undefined ? (Number(durationMinutes) || 0) : lesson.durationMinutes;
  lesson.videoUrl = videoUrl !== undefined ? videoUrl : lesson.videoUrl;
  lesson.pdfUrl = pdfUrl !== undefined ? pdfUrl : lesson.pdfUrl;

  saveDb();
  res.json({ success: true, lesson });
});

// Admin: Delete Lesson
app.delete('/api/admin/lessons/:id', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const lessonIndex = dbData.lessons.findIndex((l: any) => l.id === id);
  if (lessonIndex === -1) {
    return res.status(404).json({ error: 'الدرس غير موجود' });
  }
  
  const lesson = dbData.lessons[lessonIndex];
  
  // Try to delete physical files if they belong to our uploads directory
  try {
    if (lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/')) {
      const videoPath = path.join(UPLOADS_DIR, path.basename(lesson.videoUrl));
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    if (lesson.pdfUrl && lesson.pdfUrl.startsWith('/uploads/')) {
      const pdfPath = path.join(UPLOADS_DIR, path.basename(lesson.pdfUrl));
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }
  } catch (err) {
    console.error('Error deleting physical files associated with lesson:', err);
  }

  dbData.lessons.splice(lessonIndex, 1);
  dbData.user_lessons = (dbData.user_lessons || []).filter((ul: any) => ul.lessonId !== id);
  dbData.lesson_reports = (dbData.lesson_reports || []).filter((r: any) => r.lessonId !== id);
  dbData.notifications = (dbData.notifications || []).filter((n: any) => n.lessonId !== id);
  saveDb();
  res.json({ success: true });
});

app.get('/api/lessons', authenticate, (req: any, res: any) => {
  const { grade, term, subject } = req.query;
  let rows = dbData.lessons;
  if (grade) rows = rows.filter((r: any) => r.grade === grade);
  if (term) rows = rows.filter((r: any) => r.term === term);
  if (subject) rows = rows.filter((r: any) => r.subject === subject);
  res.json(rows);
});

app.get('/api/lessons/:id', authenticate, (req: any, res: any) => {
  const { id } = req.params;
  const row = dbData.lessons.find((r: any) => r.id === id);
  if (!row) return res.status(404).json({ error: 'Lesson not found' });
  res.json(row);
});

// User Progress
app.get('/api/user/progress', authenticate, (req: any, res: any) => {
  const rows = dbData.user_lessons.filter((ul: any) => ul.userId === req.user.id && ul.completed === 1);
  res.json({ completedLessons: rows.map((r: any) => r.lessonId) });
});

app.post('/api/user/progress', authenticate, (req: any, res: any) => {
  const { lessonId } = req.body;
  let ul = dbData.user_lessons.find((ul: any) => ul.userId === req.user.id && ul.lessonId === lessonId);
  if (ul) {
    ul.completed = 1;
  } else {
    dbData.user_lessons.push({ userId: req.user.id, lessonId, completed: 1 });
  }
  saveDb();
  res.json({ success: true });
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = dbData.users.find((u: any) => u.phone === phone);
  
  if (!user) return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
  
  if (user.status === 'disabled') {
     return res.status(403).json({ error: 'هذا الحساب معطل. يرجى مراجعة الإدارة.' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });

  // Update last activity
  const now = new Date().toISOString();
  user.lastActivity = now;
  saveDb();

  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, grade: user.grade }, JWT_SECRET, { expiresIn: '7d' });
  
  const { password: _, ...userData } = user;
  res.json({ token, user: userData });
});

// Get user profile
app.get('/api/auth/me', authenticate, (req: any, res: any) => {
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(401).json({ error: 'User not found' });
  const { password: _, ...userData } = user;
  res.json({ user: userData });
});

// Admin: Get all students
app.get('/api/admin/students', authenticate, requireAdmin, (req: any, res: any) => {
  const students = dbData.users
    .filter((u: any) => u.role === 'student')
    .map((u: any) => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
  res.json({ students });
});

// Admin: Create student
app.post('/api/admin/students', authenticate, requireAdmin, async (req: any, res: any) => {
  const { name, phone, parentPhone, password, grade } = req.body;
  
  if (dbData.users.find((u: any) => u.phone === phone)) {
    return res.status(400).json({ error: 'رقم الهاتف مستخدم بالفعل' });
  }

  const id = 'student_' + Date.now();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  dbData.users.push({
    id,
    name,
    phone,
    parentPhone,
    role: 'student',
    grade,
    password: hashedPassword,
    status: 'active',
    progress: 0,
    lastActivity: new Date().toISOString()
  });
  saveDb();
  
  res.json({ success: true, studentId: id });
});

// Admin: Delete student
app.delete('/api/admin/students/:id', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  dbData.users = dbData.users.filter((u: any) => u.id !== id);
  dbData.user_lessons = (dbData.user_lessons || []).filter((ul: any) => ul.userId !== id);
  dbData.user_exams = (dbData.user_exams || []).filter((ue: any) => ue.userId !== id);
  dbData.lesson_reports = (dbData.lesson_reports || []).filter((r: any) => r.userId !== id);
  saveDb();
  res.json({ success: true });
});

// Admin: Toggle student status
app.patch('/api/admin/students/:id/status', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = dbData.users.find((u: any) => u.id === id);
  if (user) {
    user.status = status;
    saveDb();
  }
  res.json({ success: true });
});

// Admin: Update student grade
app.patch('/api/admin/students/:id/grade', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { grade } = req.body;
  const user = dbData.users.find((u: any) => u.id === id);
  if (user) {
    user.grade = grade;
    saveDb();
  }
  res.json({ success: true });
});

// Admin: Update student fully (Name, Phone, Parent Phone, Grade, Status, Password)
app.put('/api/admin/students/:id', authenticate, requireAdmin, async (req: any, res: any) => {
  const { id } = req.params;
  const { name, phone, parentPhone, grade, status, password } = req.body;
  const user = dbData.users.find((u: any) => u.id === id);
  if (!user) return res.status(404).json({ error: 'الطالب غير موجود' });

  // If phone changes, ensure it is unique
  if (phone && phone !== user.phone) {
    const existing = dbData.users.find((u: any) => u.phone === phone);
    if (existing) {
      return res.status(400).json({ error: 'رقم الهاتف مستخدم بالفعل من قبل مستخدم آخر' });
    }
    user.phone = phone;
  }

  if (name) user.name = name;
  if (parentPhone !== undefined) user.parentPhone = parentPhone;
  if (grade) user.grade = grade;
  if (status) user.status = status;
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  saveDb();
  res.json({ success: true, student: user });
});

// Admin: Get Detailed Student Profile & Analytics
app.get('/api/admin/students/:id/profile', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const student = dbData.users.find((u: any) => u.id === id && u.role === 'student');
  if (!student) {
    return res.status(404).json({ error: 'الطالب غير موجود' });
  }

  // Get all lessons for the student's grade
  const gradeLessons = dbData.lessons.filter((l: any) => l.grade === student.grade);
  
  // Get all completed lesson IDs for this student
  const completedLessonRecords = (dbData.user_lessons || []).filter((ul: any) => ul.userId === student.id && ul.completed === 1);
  const completedLessonIds = completedLessonRecords.map((ul: any) => ul.lessonId);
  
  // 1. Progress Calculations
  const completedCount = completedLessonIds.length;
  const totalLessons = gradeLessons.length;
  const remainingCount = Math.max(0, totalLessons - completedCount);
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  
  const term1Lessons = gradeLessons.filter((l: any) => l.term === 'first');
  const term2Lessons = gradeLessons.filter((l: any) => l.term === 'second');
  
  const term1Completed = term1Lessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
  const term2Completed = term2Lessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
  
  const term1Progress = term1Lessons.length > 0 ? Math.round((term1Completed / term1Lessons.length) * 100) : 0;
  const term2Progress = term2Lessons.length > 0 ? Math.round((term2Completed / term2Lessons.length) * 100) : 0;
  
  // Estimate study time (sum of lesson minutes + some active platform time, e.g. 45m per completed lesson if duration is missing)
  let totalMinutes = 0;
  gradeLessons.forEach((l: any) => {
    if (completedLessonIds.includes(l.id)) {
      totalMinutes += Number(l.durationMinutes) || 45;
    }
  });
  
  // 2. Learning Progress by Subject (Grammar, Rhetoric, Literature, Texts, Reading, Story)
  const subjectKeys = ['grammar', 'rhetoric', 'literature', 'texts', 'reading', 'story'];
  const subjectNamesAr: any = {
    grammar: 'النحو',
    rhetoric: 'البلاغة',
    literature: 'الأدب',
    texts: 'النصوص',
    reading: 'القراءة',
    story: 'القصة'
  };
  
  const subjectProgress = subjectKeys.map((subKey) => {
    const subLessons = gradeLessons.filter((l: any) => l.subject === subKey);
    const subCompleted = subLessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
    const subTotal = subLessons.length;
    const subRemaining = Math.max(0, subTotal - subCompleted);
    const subPercentage = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;
    
    return {
      key: subKey,
      name: subjectNamesAr[subKey] || subKey,
      percentage: subPercentage,
      completed: subCompleted,
      total: subTotal,
      remaining: subRemaining
    };
  });
  
  // 3. Completed Lessons List with date
  const completedLessonsList = gradeLessons
    .filter((l: any) => completedLessonIds.includes(l.id))
    .map((l: any) => {
      const record = completedLessonRecords.find((ul: any) => ul.lessonId === l.id);
      return {
        id: l.id,
        title: l.title,
        subject: subjectNamesAr[l.subject] || l.subject,
        term: l.term === 'first' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني',
        completedAt: record?.completedAt || student.lastActivity || new Date().toISOString()
      };
    })
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    
  // 4. Current Position (آخر درس وصل إليه الطالب)
  let currentPosition: any = null;
  if (completedLessonsList.length > 0) {
    const lastCompleted = completedLessonsList[0];
    const lesson = gradeLessons.find((l: any) => l.id === lastCompleted.id);
    if (lesson) {
      currentPosition = {
        grade: student.grade === 'first' ? 'الأول الثانوي' : student.grade === 'second' ? 'الثاني الثانوي' : 'الثالث الثانوي',
        term: lesson.term === 'first' ? 'الفصل الأول' : 'الفصل الثاني',
        subject: subjectNamesAr[lesson.subject] || lesson.subject,
        title: lesson.title,
        lessonId: lesson.id,
        lastAccess: lastCompleted.completedAt
      };
    }
  } else if (gradeLessons.length > 0) {
    const firstLesson = gradeLessons[0];
    currentPosition = {
      grade: student.grade === 'first' ? 'الأول الثانوي' : student.grade === 'second' ? 'الثاني الثانوي' : 'الثالث الثانوي',
      term: firstLesson.term === 'first' ? 'الفصل الأول' : 'الفصل الثاني',
      subject: subjectNamesAr[firstLesson.subject] || firstLesson.subject,
      title: firstLesson.title,
      lessonId: firstLesson.id,
      lastAccess: student.lastActivity || student.registrationDate || new Date().toISOString()
    };
  }
  
  // 5. Lessons Not Understood
  const notUnderstoodLessons = (dbData.lesson_reports || [])
    .filter((r: any) => r.userId === student.id)
    .map((r: any) => ({
      id: r.id,
      lessonId: r.lessonId,
      lessonTitle: r.lessonTitle,
      subject: subjectNamesAr[r.subject] || r.subject,
      reportedAt: r.createdAt || new Date().toISOString()
    }))
    .sort((a: any, b: any) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
    
  // 6. Exam Results
  const allExamResults = (dbData.user_exams || [])
    .filter((ue: any) => ue.userId === student.id)
    .map((ue: any) => {
      const exam = dbData.exams.find((e: any) => e.id === ue.examId);
      return {
        id: ue.id,
        examId: ue.examId,
        examTitle: ue.examTitle || exam?.title || 'امتحان عام',
        subject: exam ? (subjectNamesAr[exam.subject] || exam.subject) : 'غير محدد',
        grade: exam?.grade === 'first' ? 'الأول الثانوي' : exam?.grade === 'second' ? 'الثاني الثانوي' : 'الثالث الثانوي',
        score: ue.correctCount || 0,
        totalQuestions: ue.totalQuestions || 0,
        percentage: ue.score || 0,
        takenAt: ue.takenAt || new Date().toISOString()
      };
    })
    .sort((a: any, b: any) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
    
  const examResults = allExamResults.filter((r: any) => r.totalQuestions > 5);
  const quizResults = allExamResults.filter((r: any) => r.totalQuestions <= 5);
  
  // 7. Performance Analytics
  const examScores = examResults.map((r: any) => r.percentage);
  const quizScores = quizResults.map((r: any) => r.percentage);
  const avgExamScore = examScores.length > 0 ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length) : 0;
  const avgQuizScore = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
  
  let strongestSubject = 'غير محدد';
  let weakestSubject = 'غير محدد';
  let maxPct = -1;
  let minPct = 101;
  
  subjectProgress.forEach((sp) => {
    if (sp.total > 0) {
      if (sp.percentage > maxPct) {
        maxPct = sp.percentage;
        strongestSubject = sp.name;
      }
      if (sp.percentage < minPct) {
        minPct = sp.percentage;
        weakestSubject = sp.name;
      }
    }
  });
  
  if (maxPct === -1) strongestSubject = 'لا توجد بيانات كافية';
  if (minPct === 101) weakestSubject = 'لا توجد بيانات كافية';
  
  const teacherNotes = student.teacherNotes || [];

  // Calculate Achievements
  const achievements = [];
  const userExams = allExamResults; // Already fetched
  
  if (completedCount > 0) {
    achievements.push({
      id: 'first_step',
      title: 'البداية',
      description: 'أتمم أول درس',
      icon: 'flag',
      color: 'bg-blue-100 text-blue-600'
    });
  }
  
  if (overallProgress >= 50) {
    achievements.push({
      id: 'halfway',
      title: 'في منتصف الطريق',
      description: 'أتمم 50% من المنهج',
      icon: 'target',
      color: 'bg-amber-100 text-amber-600'
    });
  }
  
  if (overallProgress === 100 && totalLessons > 0) {
    achievements.push({
      id: 'master',
      title: 'بطل المنهج',
      description: 'أتمم 100% من المنهج',
      icon: 'award',
      color: 'bg-purple-100 text-purple-600'
    });
  }
  
  if (userExams.some((ue: any) => ue.percentage === 100)) {
    achievements.push({
      id: 'perfect_score',
      title: 'العلامة الكاملة',
      description: 'حصل على 100% في اختبار',
      icon: 'star',
      color: 'bg-yellow-100 text-yellow-600'
    });
  }
  
  if (userExams.length >= 3) {
    achievements.push({
      id: 'quiz_enthusiast',
      title: 'محب الاختبارات',
      description: 'أتمم 3 اختبارات أو أكثر',
      icon: 'zap',
      color: 'bg-orange-100 text-orange-600'
    });
  }
  
  if (completedCount >= 5) {
     achievements.push({
      id: 'fast_learner',
      title: 'متعلم سريع',
      description: 'أتمم 5 دروس',
      icon: 'rocket',
      color: 'bg-green-100 text-green-600'
    });
  }

  res.json({
    student: {
      id: student.id,
      name: student.name,
      phone: student.phone,
      parentPhone: student.parentPhone || '',
      grade: student.grade,
      status: student.status || 'active',
      registrationDate: student.registrationDate || student.createdAt || '2026-01-01T12:00:00.000Z',
      lastLogin: student.lastLogin || student.lastActivity || new Date().toISOString(),
      teacherNotes,
      achievements
    },
    analytics: {
      overallProgress,
      term1Progress,
      term2Progress,
      completedLessonsCount: completedCount,
      remainingLessonsCount: remainingCount,
      totalStudyTime: totalMinutes,
      subjectProgress,
      completedLessonsList,
      currentPosition,
      notUnderstoodLessons,
      examResults,
      quizResults,
      performance: {
        avgExamScore,
        avgQuizScore,
        strongestSubject,
        weakestSubject,
        totalLearningTime: totalMinutes
      }
    }
  });
});

// Admin: Add Teacher Note for Student
app.post('/api/admin/students/:id/notes', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'محتوى الملاحظة مطلوب' });

  const student = dbData.users.find((u: any) => u.id === id && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'الطالب غير موجود' });

  if (!student.teacherNotes) student.teacherNotes = [];
  const newNote = {
    id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    text: text.trim(),
    createdAt: new Date().toISOString()
  };
  student.teacherNotes.push(newNote);
  saveDb();

  res.json({ success: true, note: newNote });
});

// Admin: Edit Teacher Note for Student
app.put('/api/admin/students/:id/notes/:noteId', authenticate, requireAdmin, (req: any, res: any) => {
  const { id, noteId } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'محتوى الملاحظة مطلوب' });

  const student = dbData.users.find((u: any) => u.id === id && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'الطالب غير موجود' });

  if (!student.teacherNotes) student.teacherNotes = [];
  const note = student.teacherNotes.find((n: any) => n.id === noteId);
  if (!note) return res.status(404).json({ error: 'الملاحظة غير موجودة' });

  note.text = text.trim();
  note.updatedAt = new Date().toISOString();
  saveDb();

  res.json({ success: true, note });
});

// Admin: Delete Teacher Note for Student
app.delete('/api/admin/students/:id/notes/:noteId', authenticate, requireAdmin, (req: any, res: any) => {
  const { id, noteId } = req.params;

  const student = dbData.users.find((u: any) => u.id === id && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'الطالب غير موجود' });

  if (!student.teacherNotes) student.teacherNotes = [];
  student.teacherNotes = student.teacherNotes.filter((n: any) => n.id !== noteId);
  saveDb();

  res.json({ success: true });
});

// Admin: Dashboard stats
app.get('/api/admin/dashboard', authenticate, requireAdmin, (req: any, res: any) => {
  const students = dbData.users.filter((u: any) => u.role === 'student');
  const activeStudents = students.filter((u: any) => u.status === 'active').length;
  const totalLessons = dbData.lessons.length;
  const avgProgress = students.length > 0 
    ? students.reduce((sum: number, u: any) => sum + (u.progress || 0), 0) / students.length 
    : 0;

  res.json({
    totalStudents: students.length,
    activeStudents,
    totalLessons,
    avgProgress: Math.round(avgProgress)
  });
});

// Student: Dashboard stats
app.get('/api/student/dashboard', authenticate, (req: any, res: any) => {
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(500).json({ error: 'User not found' });
  
  const total = dbData.lessons.filter((l: any) => l.grade === user.grade).length;
  const completed = dbData.user_lessons.filter((ul: any) => ul.userId === user.id && ul.completed === 1).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  user.progress = progress;
  saveDb();

  const gradeLessons = dbData.lessons.filter((l: any) => l.grade === user.grade);
  const recentLessons = gradeLessons.reverse().slice(0, 5).map((l: any) => {
    const ul = dbData.user_lessons.find((ul: any) => ul.lessonId === l.id && ul.userId === user.id);
    return { ...l, completed: ul ? ul.completed : 0 };
  });

  // Calculate Achievements
  const achievements = [];
  const userExams = dbData.user_exams.filter((ue: any) => ue.userId === user.id);
  
  if (completed > 0) {
    achievements.push({
      id: 'first_step',
      title: 'البداية',
      description: 'أتممت أول درس لك',
      icon: 'flag',
      color: 'bg-blue-100 text-blue-600'
    });
  }
  
  if (progress >= 50) {
    achievements.push({
      id: 'halfway',
      title: 'في منتصف الطريق',
      description: 'أتممت 50% من المنهج',
      icon: 'target',
      color: 'bg-amber-100 text-amber-600'
    });
  }
  
  if (progress === 100 && total > 0) {
    achievements.push({
      id: 'master',
      title: 'بطل المنهج',
      description: 'أتممت 100% من المنهج',
      icon: 'award',
      color: 'bg-purple-100 text-purple-600'
    });
  }
  
  if (userExams.some((ue: any) => ue.score === 100)) {
    achievements.push({
      id: 'perfect_score',
      title: 'العلامة الكاملة',
      description: 'حصلت على 100% في أحد الاختبارات',
      icon: 'star',
      color: 'bg-yellow-100 text-yellow-600'
    });
  }
  
  if (userExams.length >= 3) {
    achievements.push({
      id: 'quiz_enthusiast',
      title: 'محب الاختبارات',
      description: 'أتممت 3 اختبارات أو أكثر',
      icon: 'zap',
      color: 'bg-orange-100 text-orange-600'
    });
  }
  
  if (completed >= 5) {
     achievements.push({
      id: 'fast_learner',
      title: 'متعلم سريع',
      description: 'أتممت 5 دروس',
      icon: 'rocket',
      color: 'bg-green-100 text-green-600'
    });
  }

  res.json({
    overallPercentage: progress,
    completedCount: completed,
    remainingCount: total - completed,
    recentLessons,
    nextLesson: recentLessons.find((l: any) => !l.completed) || null,
    achievements
  });
});

// --- LESSON UNDERSTANDING FEEDBACK API ROUTES ---

// 1. Submit lesson feedback (Student)
app.post('/api/lessons/:id/report-understanding', authenticate, (req: any, res: any) => {
  const { id } = req.params;
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const lesson = dbData.lessons.find((l: any) => l.id === id);
  if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' });

  // Prevent duplicates
  const existingReport = dbData.lesson_reports.find(
    (r: any) => r.userId === user.id && r.lessonId === lesson.id
  );
  if (existingReport) {
    return res.status(400).json({ error: 'لقد تم تسجيل هذه الملاحظة مسبقاً', alreadySubmitted: true });
  }

  const newReport = {
    id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    userId: user.id,
    userName: user.name,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    subject: lesson.subject,
    grade: lesson.grade,
    createdAt: new Date().toISOString()
  };

  dbData.lesson_reports.push(newReport);
  saveDb();

  res.json({ success: true, message: 'تم إرسال ملاحظتك إلى الأستاذ' });
});

// 2. Check if student already submitted report for a lesson
app.get('/api/lessons/:id/report-status', authenticate, (req: any, res: any) => {
  const { id } = req.params;
  const reported = dbData.lesson_reports.some(
    (r: any) => r.userId === req.user.id && r.lessonId === id
  );
  res.json({ reported });
});

// 3. Get all notifications for the student's grade with read status
app.get('/api/notifications', authenticate, (req: any, res: any) => {
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const list = (dbData.notifications || [])
    .filter((n: any) => n.grade === user.grade)
    .map((n: any) => ({
      ...n,
      read: Array.isArray(n.readBy) ? n.readBy.includes(user.id) : false
    }));
  res.json(list);
});

// 3.1 Mark a specific notification as read
app.post('/api/notifications/:notifId/read', authenticate, (req: any, res: any) => {
  const { notifId } = req.params;
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const notif = (dbData.notifications || []).find((n: any) => n.id === notifId);
  if (notif) {
    if (!notif.readBy) notif.readBy = [];
    if (!notif.readBy.includes(user.id)) {
      notif.readBy.push(user.id);
      saveDb();
    }
  }
  res.json({ success: true });
});

// 3.2 Mark all notifications for the student's grade as read
app.post('/api/notifications/read-all', authenticate, (req: any, res: any) => {
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  let changed = false;
  (dbData.notifications || []).forEach((n: any) => {
    if (n.grade === user.grade) {
      if (!n.readBy) n.readBy = [];
      if (!n.readBy.includes(user.id)) {
        n.readBy.push(user.id);
        changed = true;
      }
    }
  });

  if (changed) {
    saveDb();
  }
  res.json({ success: true });
});

// Clear all student data and content
app.post('/api/admin/system/clear-all', authenticate, requireAdmin, (req: any, res: any) => {
  dbData.users = dbData.users.filter((u: any) => u.role === 'teacher');
  dbData.lessons = [];
  dbData.user_lessons = [];
  dbData.exams = [];
  dbData.user_exams = [];
  dbData.lesson_reports = [];
  dbData.notifications = [];
  saveDb();
  res.json({ success: true, message: 'تم مسح جميع البيانات بنجاح' });
});

// 4. Get teacher reports summary sorted by reportCount descending (Teacher)
app.get('/api/admin/lessons/reports-summary', authenticate, requireAdmin, (req: any, res: any) => {
  const reports = dbData.lesson_reports || [];

  // Group by lessonId
  const groups: Record<string, any> = {};
  reports.forEach((r: any) => {
    if (!groups[r.lessonId]) {
      groups[r.lessonId] = {
        lessonId: r.lessonId,
        lessonTitle: r.lessonTitle,
        subject: r.subject,
        grade: r.grade,
        reportCount: 0,
        reports: []
      };
    }
    groups[r.lessonId].reportCount++;
    groups[r.lessonId].reports.push(r);
  });

  const summary = Object.values(groups).sort((a: any, b: any) => b.reportCount - a.reportCount);
  res.json(summary);
});

// 5. Get analytics cards metrics for teacher dashboard (Teacher)
app.get('/api/admin/lessons/reports-analytics', authenticate, requireAdmin, (req: any, res: any) => {
  const reports = dbData.lesson_reports || [];
  
  // Total reports
  const totalReports = reports.length;

  // Unique students needing re-explanation
  const uniqueStudents = new Set(reports.map((r: any) => r.userId)).size;

  // Unique lessons with reports (difficult lessons count)
  const difficultLessons = new Set(reports.map((r: any) => r.lessonId)).size;

  // Most reported lessons (grouped and sorted top 5)
  const groups: Record<string, any> = {};
  reports.forEach((r: any) => {
    if (!groups[r.lessonId]) {
      groups[r.lessonId] = {
        lessonId: r.lessonId,
        lessonTitle: r.lessonTitle,
        subject: r.subject,
        grade: r.grade,
        reportCount: 0
      };
    }
    groups[r.lessonId].reportCount++;
  });

  const topLessons = Object.values(groups)
    .sort((a: any, b: any) => b.reportCount - a.reportCount)
    .slice(0, 5);

  res.json({
    totalReports,
    uniqueStudents,
    difficultLessonsCount: difficultLessons,
    topLessons
  });
});

// 6. Get report details for a specific lesson (Teacher)
app.get('/api/admin/lessons/:id/reports-detail', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const lesson = dbData.lessons.find((l: any) => l.id === id);
  if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' });

  const reports = (dbData.lesson_reports || []).filter((r: any) => r.lessonId === id);
  
  const studentReports = reports.map((r: any) => {
    const studentUser = dbData.users.find((u: any) => u.id === r.userId);
    return {
      id: r.id,
      userId: r.userId,
      userName: r.userName || (studentUser ? studentUser.name : 'طالب غير معروف'),
      grade: r.grade,
      submissionDate: r.createdAt,
      lastActivity: studentUser ? studentUser.lastActivity : null
    };
  });

  res.json({
    lesson,
    reportCount: reports.length,
    students: studentReports
  });
});

// 7. Resolve / Mark as Reviewed (Teacher)
app.post('/api/admin/lessons/:id/reports-resolve', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  
  // Remove reports for this lesson
  dbData.lesson_reports = (dbData.lesson_reports || []).filter((r: any) => r.lessonId !== id);
  saveDb();

  res.json({ success: true, message: 'تم وضع علامة "تمت المراجعة" وحذف الملاحظات بنجاح' });
});

// 8. Upload additional explanation text and/or video (Teacher)
app.post('/api/admin/lessons/:id/reports-resources', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { additionalExplanation, reviewVideoUrl } = req.body;

  const lesson = dbData.lessons.find((l: any) => l.id === id);
  if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' });

  lesson.additionalExplanation = additionalExplanation || '';
  lesson.reviewVideoUrl = reviewVideoUrl || '';
  saveDb();

  res.json({ success: true, lesson, message: 'تم تحديث المصادر الإضافية بنجاح' });
});

// 9. Send notification to students (Teacher)
app.post('/api/admin/lessons/:id/reports-notify', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { text } = req.body;

  const lesson = dbData.lessons.find((l: any) => l.id === id);
  if (!lesson) return res.status(404).json({ error: 'الدرس غير موجود' });

  const newNotification = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    grade: lesson.grade,
    text: text || `تنبيه من الأستاذ: تم إضافة توضيح/شرح إضافي لدرس "${lesson.title}" لمعالجة النقاط غير المفهومة. يرجى مراجعته الآن!`,
    lessonId: lesson.id,
    createdAt: new Date().toISOString()
  };

  if (!dbData.notifications) dbData.notifications = [];
  dbData.notifications.push(newNotification);
  saveDb();

  res.json({ success: true, notification: newNotification, message: 'تم إرسال التنبيه لجميع طلاب هذا الصف بنجاح' });
});

// --- EXAM & INTERACTIVE SMART GENERATOR SYSTEM API ROUTES ---

// 1. Import Exam File (PDF, DOCX, TXT) and Extract via Gemini
app.post('/api/admin/exams/import', authenticate, requireAdmin, upload.single('file'), async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    let textToAnalyze = '';
    let fileBuffer: Buffer | null = null;

    if (ext === '.txt') {
      textToAnalyze = fs.readFileSync(filePath, 'utf-8');
    } else if (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      textToAnalyze = result.value;
    } else if (ext === '.pdf' || mimeType === 'application/pdf') {
      fileBuffer = fs.readFileSync(filePath);
    } else {
      try { fs.unlinkSync(filePath); } catch (_) {}
      return res.status(400).json({ error: 'صيغة الملف غير مدعومة. يدعم النظام فقط ملفات PDF, DOCX, TXT' });
    }

    const gemini = getGeminiClient();

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        success: { type: Type.BOOLEAN },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              choices: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.INTEGER }
            },
            required: ["text", "choices", "correctIndex"]
          }
        }
      },
      required: ["success", "questions"]
    };

    const systemInstruction = "أنت خبير متمكن في مادة اللغة العربية للمرحلة الثانوية العامة بمصر. مهمتك هي قراءة الملف المرفق واستخراج الأسئلة واختيارات الإجابة والإجابة الصحيحة بشكل منظم ودقيق للغاية كـ JSON.\n\n" +
      "تعليمات التنسيق والتحويل:\n" +
      "1. استخرج نص السؤال بدقة.\n" +
      "2. استخرج خيارات الإجابة المتاحة (عادة ما تكون 4 خيارات). احرص على إزالة أي ترميز زائد مثل أ)، ب)، ج)، د) أو A), B), C), D) من نصوص الخيارات نفسها، واجعلها مجرد نصوص نظيفة.\n" +
      "3. طابق الإجابة الصحيحة المحددة في الملف (سواء كانت مكتوبة كـ 'الإجابة الصحيحة: ب' أو 'مفتاح الحل: ب' أو 'B' أو تحتها خط أو بلون مختلف) وحدد المؤشر المقابل لها (correctIndex) حيث 0 يعني الخيار الأول، 1 يعني الثاني، 2 الثالث، و 3 الرابع.\n" +
      "4. إذا لم تتمكن من استخراج الأسئلة أو كان الملف فارغاً أو تالفاً أو لا يحتوي على أسئلة متعددة الاختيارات، اضبط قيمة success إلى false.";

    let geminiResponse;
    if (fileBuffer) {
      const base64Data = fileBuffer.toString('base64');
      geminiResponse = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data
            }
          },
          {
            text: "يرجى قراءة هذا الامتحان واستخراج جميع أسئلة الاختيار من متعدد مع الخيارات وتحديد الإجابة الصحيحة لكل سؤال وفقاً للقواعد والتعليمات المحددة."
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema
        }
      });
    } else {
      geminiResponse = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `يرجى قراءة النص التالي واستخراج جميع أسئلة الاختيار من متعدد مع الخيارات وتحديد الإجابة الصحيحة لكل سؤال وفقاً للقواعد والتعليمات المحددة.\n\nالنص المستخرج:\n\n${textToAnalyze}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema
        }
      });
    }

    try { fs.unlinkSync(filePath); } catch (_) {}

    const responseText = geminiResponse.text?.trim() || '';
    const result = JSON.parse(responseText);

    if (result.success && result.questions && result.questions.length > 0) {
      return res.json({
        success: true,
        message: 'تم إنشاء الاختبار الإلكتروني بنجاح',
        questions: result.questions.map((q: any, idx: number) => ({
          id: 'q_' + Date.now() + '_' + idx + '_' + Math.round(Math.random() * 1000),
          text: q.text,
          choices: q.choices,
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
        }))
      });
    } else {
      return res.status(422).json({ error: 'تعذر استخراج الأسئلة من الملف' });
    }

  } catch (err: any) {
    console.error('Error in exam import:', err);
    try { if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); } } catch (_) {}
    return res.status(500).json({ error: 'تعذر استخراج الأسئلة من الملف' });
  }
});

// 2. Save / Create Exam manually
app.post('/api/admin/exams', authenticate, requireAdmin, (req: any, res: any) => {
  const { title, description, grade, term, subject, questions } = req.body;
  if (!title || !grade || !term || !subject || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول الإلزامية ورفع أسئلة الامتحان' });
  }

  const newExam = {
    id: 'exam_' + Date.now(),
    title,
    description: description || '',
    grade,
    term,
    subject,
    questions: questions.map((q: any, idx: number) => ({
      id: q.id || 'q_' + Date.now() + '_' + idx + '_' + Math.round(Math.random() * 1000),
      text: q.text,
      choices: q.choices || [],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
    })),
    createdAt: new Date().toISOString()
  };

  dbData.exams.push(newExam);
  saveDb();
  res.json({ success: true, exam: newExam });
});

// 3. Update Exam
app.put('/api/admin/exams/:id', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { title, description, grade, term, subject, questions } = req.body;
  
  const examIndex = dbData.exams.findIndex((e: any) => e.id === id);
  if (examIndex === -1) {
    return res.status(404).json({ error: 'الامتحان غير موجود' });
  }

  dbData.exams[examIndex] = {
    ...dbData.exams[examIndex],
    title: title || dbData.exams[examIndex].title,
    description: description !== undefined ? description : dbData.exams[examIndex].description,
    grade: grade || dbData.exams[examIndex].grade,
    term: term || dbData.exams[examIndex].term,
    subject: subject || dbData.exams[examIndex].subject,
    questions: questions ? questions.map((q: any, idx: number) => ({
      id: q.id || 'q_' + Date.now() + '_' + idx + '_' + Math.round(Math.random() * 1000),
      text: q.text,
      choices: q.choices || [],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0
    })) : dbData.exams[examIndex].questions,
    updatedAt: new Date().toISOString()
  };

  saveDb();
  res.json({ success: true, exam: dbData.exams[examIndex] });
});

// 4. Delete Exam
app.delete('/api/admin/exams/:id', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const examIndex = dbData.exams.findIndex((e: any) => e.id === id);
  if (examIndex === -1) {
    return res.status(404).json({ error: 'الامتحان غير موجود' });
  }

  dbData.exams.splice(examIndex, 1);
  dbData.user_exams = dbData.user_exams.filter((ue: any) => ue.examId !== id);
  
  saveDb();
  res.json({ success: true });
});

// 5. Get List of Exams (filtered by grade if student, returns all if teacher)
app.get('/api/exams', authenticate, (req: any, res: any) => {
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  let examsList = dbData.exams || [];

  if (user.role === 'student') {
    examsList = examsList.filter((e: any) => e.grade === user.grade);
    examsList = examsList.map((e: any) => {
      const taken = dbData.user_exams.find((ue: any) => ue.userId === user.id && ue.examId === e.id);
      return {
        ...e,
        questions: e.questions.map((q: any) => {
          const { correctIndex, ...qWithoutCorrect } = q;
          return taken ? q : qWithoutCorrect;
        }),
        taken: !!taken,
        userScore: taken ? taken.score : null,
        userResult: taken ? {
          score: taken.score,
          totalQuestions: taken.totalQuestions,
          correctCount: taken.correctCount,
          wrongCount: taken.wrongCount,
          answers: taken.answers,
          takenAt: taken.takenAt
        } : null
      };
    });
  } else {
    examsList = examsList.map((e: any) => {
      const takes = dbData.user_exams.filter((ue: any) => ue.examId === e.id);
      return {
        ...e,
        takesCount: takes.length
      };
    });
  }

  res.json(examsList);
});

// 6. Get Exam Details
app.get('/api/exams/:id', authenticate, (req: any, res: any) => {
  const { id } = req.params;
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const exam = dbData.exams.find((e: any) => e.id === id);
  if (!exam) return res.status(404).json({ error: 'الامتحان غير موجود' });

  if (user.role === 'student' && exam.grade !== user.grade) {
    return res.status(403).json({ error: 'هذا الامتحان ليس مخصصاً لصفك الدراسي' });
  }

  const taken = dbData.user_exams.find((ue: any) => ue.userId === user.id && ue.examId === id);

  let responseExam = { ...exam };
  if (user.role === 'student' && !taken) {
    responseExam.questions = exam.questions.map((q: any) => {
      const { correctIndex, ...qWithoutCorrect } = q;
      return qWithoutCorrect;
    });
  }

  res.json({
    ...responseExam,
    taken: !!taken,
    userResult: taken ? {
      score: taken.score,
      totalQuestions: taken.totalQuestions,
      correctCount: taken.correctCount,
      wrongCount: taken.wrongCount,
      answers: taken.answers,
      takenAt: taken.takenAt
    } : null
  });
});

// 7. Submit Exam Answers
app.post('/api/exams/:id/submit', authenticate, (req: any, res: any) => {
  const { id } = req.params;
  const { answers } = req.body; 
  
  const user = dbData.users.find((u: any) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

  const exam = dbData.exams.find((e: any) => e.id === id);
  if (!exam) return res.status(404).json({ error: 'الامتحان غير موجود' });

  if (user.role === 'student' && exam.grade !== user.grade) {
    return res.status(403).json({ error: 'هذا الامتحان ليس مخصصاً لصفك الدراسي' });
  }

  const existingTake = dbData.user_exams.find((ue: any) => ue.userId === user.id && ue.examId === id);
  if (existingTake) {
    return res.status(400).json({ error: 'لقد قمت بتأدية هذا الامتحان بالفعل' });
  }

  let correctCount = 0;
  let wrongCount = 0;
  const totalQuestions = exam.questions.length;

  exam.questions.forEach((q: any) => {
    const studentAnswer = answers[q.id];
    if (studentAnswer !== undefined && Number(studentAnswer) === Number(q.correctIndex)) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const userExam = {
    id: 'take_' + Date.now(),
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    examId: exam.id,
    examTitle: exam.title,
    score,
    totalQuestions,
    correctCount,
    wrongCount,
    answers,
    takenAt: new Date().toISOString()
  };

  dbData.user_exams.push(userExam);
  saveDb();

  const correctAnswers: any = {};
  exam.questions.forEach((q: any) => {
    correctAnswers[q.id] = q.correctIndex;
  });

  res.json({
    success: true,
    userExam,
    correctAnswers
  });
});

// 8. Get Exam Analytics & Students List (Admin)
app.get('/api/admin/exams/:id/analytics', authenticate, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const exam = dbData.exams.find((e: any) => e.id === id);
  if (!exam) return res.status(404).json({ error: 'الامتحان غير موجود' });

  const takes = dbData.user_exams.filter((ue: any) => ue.examId === id);

  let averageScore = 0;
  let highestScore = 0;
  let lowestScore = takes.length > 0 ? 100 : 0;
  let successCount = 0;

  takes.forEach((t: any) => {
    averageScore += t.score;
    if (t.score > highestScore) highestScore = t.score;
    if (t.score < lowestScore) lowestScore = t.score;
    if (t.score >= 50) successCount++;
  });

  if (takes.length > 0) {
    averageScore = Math.round(averageScore / takes.length);
  }

  const successRate = takes.length > 0 ? Math.round((successCount / takes.length) * 100) : 0;

  res.json({
    exam,
    analytics: {
      takesCount: takes.length,
      averageScore,
      highestScore,
      lowestScore: takes.length > 0 ? lowestScore : 0,
      successRate
    },
    students: takes.map((t: any) => ({
      userId: t.userId,
      userName: t.userName || 'طالب',
      userPhone: t.userPhone || '',
      score: t.score,
      correctCount: t.correctCount,
      wrongCount: t.wrongCount,
      takenAt: t.takenAt
    }))
  });
});

// Serve the app
async function startServer() {
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
  
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log('Using Vite development middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, server.cjs is located inside the dist folder
    // So __dirname will be the path to the dist folder
    const distPath = __dirname;
    console.log(`Serving static files from: ${distPath}`);
    
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      console.error(`ERROR: index.html not found in ${distPath}`);
      // Fallback to process.cwd()/dist if __dirname doesn't work as expected
      const fallbackPath = path.join(process.cwd(), 'dist');
      console.log(`Trying fallback path: ${fallbackPath}`);
      if (fs.existsSync(path.join(fallbackPath, 'index.html'))) {
        app.use(express.static(fallbackPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(fallbackPath, 'index.html'));
        });
        return;
      }
    }

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
