import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, LogOut, User as UserIcon, Bell, Menu, X, Home, Book, UserCheck, Info, Phone as PhoneIcon, Moon, Sun } from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from './Icons';
import { cn } from '../lib/utils';

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (user && user.role !== 'teacher') {
      const token = localStorage.getItem('token');
      fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data);
          }
        })
        .catch(err => console.error('Error fetching notifications:', err));
    }
  }, [user]);

  const handleToggleNotifications = () => {
    const nextShow = !showNotifications;
    setShowNotifications(nextShow);
    
    if (nextShow && unreadCount > 0) {
      const token = localStorage.getItem('token');
      fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          }
        })
        .catch(err => console.error('Error marking notifications as read:', err));
    }
  };

  const handleNotificationClick = (notif: any) => {
    setShowNotifications(false);
    const token = localStorage.getItem('token');
    
    if (!notif.read) {
      fetch(`/api/notifications/${notif.id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        })
        .catch(err => console.error(err));
    }
    
    navigate(`/lesson/${notif.lessonId}`);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/');
  };

  const WHATSAPP_NUMBER = "201153492498";
  const INSTAGRAM_URL = "https://www.instagram.com/gomaa_abdelshafea";
  const FACEBOOK_URL = "https://www.facebook.com/jmhbdalshfy";

  return (
    <div className="min-h-screen flex flex-col bg-card bg-bg relative transition-colors duration-200">
      <header className="bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse" onClick={closeMobileMenu}>
              <BookOpen className="h-8 w-8 text-gold" />
              <span className="text-xl font-bold font-sans">أكاديمية الأستاذ جمعة</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 space-x-reverse">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors ml-2"
                title={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5 text-gold" /> : <Moon className="h-5 w-5 text-gold" />}
              </button>

              <Link to="/" className="text-sm font-semibold hover:text-gold transition-colors ml-4">
                الرئيسية
              </Link>

              {user ? (
                <>
                  <Link to="/learning-platform" className="text-sm font-semibold hover:text-gold transition-colors ml-4">
                    المحتوى الدراسي
                  </Link>
                  {user.role === 'teacher' ? (
                    <Link to="/admin" className="text-sm font-semibold hover:text-gold transition-colors ml-4">
                      لوحة تحكم المدرس
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="text-sm font-semibold hover:text-gold transition-colors ml-4">
                      لوحة الطالب
                    </Link>
                  )}
                  <Link to="/profile" className="text-sm font-semibold hover:text-gold transition-colors ml-4">
                    حسابي
                  </Link>

                  {user.role !== 'teacher' && (
                    <div className="relative ml-4 shrink-0">
                      <button 
                        onClick={handleToggleNotifications}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
                        title="التنبيهات"
                      >
                        <Bell className="h-5 w-5 text-gold" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black border border-primary">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="absolute left-0 mt-2 w-80 bg-bg bg-card rounded-2xl shadow-xl border border-border-main border-border-main py-2 z-50 text-right text-text-main animate-fadeIn">
                          <div className="px-4 py-2 border-b border-border-main border-border-main flex justify-between items-center bg-card dark:bg-text-main/50 rounded-t-2xl">
                            <span className="font-extrabold text-primary text-sm">تنبيهات الأستاذ</span>
                            <span className="text-[11px] font-bold text-text-muted bg-bg bg-card px-2 py-0.5 rounded border dark:border-slate-600">
                              {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'كلها مقروءة'}
                            </span>
                          </div>
                          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                            {notifications.length === 0 ? (
                              <div className="px-4 py-6 text-center text-slate-400 text-xs font-bold">لا توجد تنبيهات جديدة حالياً.</div>
                            ) : (
                              notifications.map((notif: any) => (
                                <button
                                  key={notif.id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={cn(
                                    "w-full text-right px-4 py-3 hover:bg-card/50 transition-colors block text-xs relative",
                                    !notif.read && "bg-amber-50/40 dark:bg-amber-900/10 hover:bg-amber-50/80 dark:hover:bg-amber-900/20"
                                  )}
                                >
                                  <div className="flex items-start gap-1 justify-between">
                                    <p className={cn(
                                      "leading-normal pl-4",
                                      notif.read ? "font-medium text-text-muted" : "font-black text-text-main"
                                    )}>
                                      {notif.text}
                                    </p>
                                    {!notif.read && (
                                      <span className="w-2.5 h-2.5 rounded-full bg-gold shrink-0 mt-1"></span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-text-muted block mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString('ar-EG', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 space-x-reverse bg-slate-800 px-3 py-1.5 rounded-full ml-4">
                    <UserIcon className="h-4 w-4 text-gold" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-semibold cursor-pointer ml-4"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="h-4 w-4 text-gold" />
                    <span>تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/about" className="text-sm font-semibold hover:text-gold transition-colors ml-4">
                    عن الأستاذ
                  </Link>
                  <Link to="/auth" className="text-sm font-semibold bg-gold text-primary px-4 py-2 rounded-md hover:bg-gold-dark transition-colors">
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Header Icons & Menu Toggle */}
            <div className="lg:hidden flex items-center space-x-3 space-x-reverse">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                title={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
              >
                {theme === 'dark' ? <Sun className="h-6 w-6 text-gold" /> : <Moon className="h-6 w-6 text-gold" />}
              </button>
              
              {user && user.role !== 'teacher' && (
                <div className="relative">
                  <button 
                    onClick={handleToggleNotifications}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
                  >
                    <Bell className="h-6 w-6 text-gold" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black border-2 border-primary">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Mobile Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute left-0 mt-2 w-[calc(100vw-32px)] sm:w-80 bg-bg bg-card rounded-2xl shadow-2xl border border-border-main border-border-main py-2 z-[60] text-right text-text-main animate-fadeIn fixed-center-x">
                       <div className="px-4 py-3 border-b border-border-main border-border-main flex justify-between items-center bg-card dark:bg-text-main/50 rounded-t-2xl">
                        <span className="font-extrabold text-primary">التنبيهات</span>
                        <span className="text-xs font-bold text-text-muted bg-bg bg-card px-2 py-0.5 rounded border dark:border-slate-600">
                          {unreadCount > 0 ? `${unreadCount} غير مقروء` : 'كلها مقروءة'}
                        </span>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-slate-400 text-sm font-bold">لا توجد تنبيهات جديدة.</div>
                        ) : (
                          notifications.map((notif: any) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={cn(
                                "w-full text-right px-4 py-4 hover:bg-card/50 transition-colors block text-sm relative active:bg-card dark:active:bg-slate-700",
                                !notif.read && "bg-amber-50/40 dark:bg-amber-900/10"
                              )}
                            >
                              <div className="flex items-start gap-2 justify-between">
                                <p className={cn(
                                  "leading-relaxed flex-1",
                                  notif.read ? "font-medium text-text-muted" : "font-black text-text-main"
                                )}>
                                  {notif.text}
                                </p>
                                {!notif.read && <span className="w-2.5 h-2.5 rounded-full bg-gold shrink-0 mt-1.5"></span>}
                              </div>
                              <span className="text-[11px] text-text-muted block mt-2">
                                {new Date(notif.createdAt).toLocaleDateString('ar-EG', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-gold"
                aria-label="القائمة"
              >
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Side Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-[100]"
              />
              
              {/* Sliding Menu */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[280px] bg-bg z-[101] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 bg-primary text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-gold" />
                    <span className="font-bold">القائمة</span>
                  </div>
                  <button onClick={closeMobileMenu} className="p-1 hover:bg-slate-800 rounded-full">
                    <X className="h-6 w-6 text-gold" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto py-4">
                  {user && (
                    <div className="px-6 py-4 mb-4 bg-card/50 border-y border-border-main border-border-main flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted font-bold">أهلاً بك</p>
                        <p className="text-sm font-black text-primary">{user.name}</p>
                      </div>
                    </div>
                  )}
                  
                  <nav className="flex flex-col px-4 gap-1">
                    <MobileNavLink to="/" icon={<Home className="w-5 h-5" />} onClick={closeMobileMenu}>الرئيسية</MobileNavLink>
                    <MobileNavLink to="/learning-platform" icon={<Book className="w-5 h-5" />} onClick={closeMobileMenu}>المحتوى الدراسي</MobileNavLink>
                    
                    {user ? (
                      <>
                        {user.role === 'teacher' ? (
                          <MobileNavLink to="/admin" icon={<UserCheck className="w-5 h-5" />} onClick={closeMobileMenu}>لوحة تحكم المدرس</MobileNavLink>
                        ) : (
                          <MobileNavLink to="/dashboard" icon={<UserCheck className="w-5 h-5" />} onClick={closeMobileMenu}>لوحة الطالب</MobileNavLink>
                        )}
                        <MobileNavLink to="/profile" icon={<UserIcon className="w-5 h-5" />} onClick={closeMobileMenu}>حسابي</MobileNavLink>
                      </>
                    ) : (
                      <MobileNavLink to="/auth" icon={<UserCheck className="w-5 h-5" />} onClick={closeMobileMenu}>تسجيل الدخول</MobileNavLink>
                    )}
                    
                    <MobileNavLink to="/about" icon={<Info className="w-5 h-5" />} onClick={closeMobileMenu}>عن الأستاذ</MobileNavLink>
                    <a 
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-text-muted font-bold hover:bg-card hover:text-primary transition-all active:scale-[0.98]"
                      onClick={closeMobileMenu}
                    >
                      <PhoneIcon className="w-5 h-5 text-green-500" />
                      <span>تواصل معنا</span>
                    </a>
                  </nav>
                </div>
                
                {user && (
                  <div className="p-6 border-t border-border-main border-border-main">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-primary text-slate-300 py-10 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-right">
            <div>
              <h3 className="text-gold font-bold text-xl mb-4">أكاديمية جمعة عبد الشفيع</h3>
              <p className="mb-4 text-sm leading-relaxed">
                منصة تعليمية متكاملة لتدريس اللغة العربية للمرحلة الثانوية بأسلوب حديث ومبسط يضمن التفوق والنجاح.
              </p>
            </div>
            <div>
              <h3 className="text-gold font-bold text-xl mb-4">معلومات التواصل</h3>
              <p className="mb-2" dir="ltr">01153492498</p>
              <p className="mb-4" dir="ltr">01005275581</p>
            </div>
            <div>
              <h3 className="text-gold font-bold text-xl mb-4">تابعنا على</h3>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-slate-800 space-y-2">
            <p className="font-black text-xs md:text-sm text-slate-400">جميع الحقوق محفوظة © أكاديمية جمعة عبد الشفيع</p>
            <p className="font-bold text-[10px] md:text-xs text-text-muted opacity-80">تم تطوير المنصة بواسطة <a href="https://ms-portfollio.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">محمد صلاح</a></p>
            <p className="font-medium text-[9px] md:text-[10px] text-text-muted opacity-60">بالتعاون مع عمرو جمعة</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all cursor-pointer animate-bounce hover:animate-none"
        aria-label="تواصل معنا عبر واتساب"
      >
        <WhatsAppIcon className="w-8 h-8" />
      </a>
    </div>
  );
}

function MobileNavLink({ to, icon, children, onClick }: { to: string, icon: React.ReactNode, children: React.ReactNode, onClick: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]",
        isActive 
          ? "bg-gold text-primary shadow-lg shadow-gold/20" 
          : "text-text-muted hover:bg-card hover:text-primary"
      )}
    >
      <span className={cn("shrink-0", isActive ? "text-primary" : "text-gold")}>{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
