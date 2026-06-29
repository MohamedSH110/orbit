import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { gradesAr } from '../data';
import { User, Phone, GraduationCap, Shield, LogOut } from 'lucide-react';

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">يجب تسجيل الدخول أولاً</h2>
        <button 
          onClick={() => navigate('/auth')} 
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-slate-800 transition-all"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-bg rounded-3xl shadow-sm border border-border-main overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary to-slate-800 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl"></div>
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-gold text-primary rounded-2xl flex items-center justify-center font-extrabold text-3xl shadow-lg">
              {user.name ? user.name[0] : 'U'}
            </div>
            <div className="text-center sm:text-right">
              <h1 className="text-3xl font-extrabold mb-1">{user.name}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg/10 rounded-full text-xs font-semibold backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-gold" />
                {user.role === 'teacher' ? 'مدرس / مدير' : 'طالب'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-primary border-b border-border-main pb-4 mb-4">بيانات الحساب</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-5 rounded-2xl border border-border-main flex items-center gap-4">
              <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                <User className="w-6 h-6 text-gold" />
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">الاسم الكامل</div>
                <div className="font-bold text-primary text-lg">{user.name}</div>
              </div>
            </div>

            <div className="bg-card p-5 rounded-2xl border border-border-main flex items-center gap-4">
              <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                <Phone className="w-6 h-6 text-gold" />
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">رقم الهاتف</div>
                <div className="font-bold text-primary text-lg" dir="ltr">{user.phone}</div>
              </div>
            </div>

            {user.role !== 'teacher' && (
              <>
                <div className="bg-card p-5 rounded-2xl border border-border-main flex items-center gap-4">
                  <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                    <GraduationCap className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted mb-1">الصف الدراسي</div>
                    <div className="font-bold text-primary text-lg">
                      {gradesAr[user.grade as keyof typeof gradesAr] || user.grade}
                    </div>
                  </div>
                </div>

                {user.parentPhone && (
                  <div className="bg-card p-5 rounded-2xl border border-border-main flex items-center gap-4">
                    <div className="w-12 h-12 bg-bg rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                      <Phone className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1">رقم هاتف ولي الأمر</div>
                      <div className="font-bold text-primary text-lg" dir="ltr">{user.parentPhone}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="pt-8 border-t border-border-main flex justify-end gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 transition-colors font-bold"
            >
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
