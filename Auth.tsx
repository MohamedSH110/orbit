import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';

export function Auth() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'رقم الهاتف أو كلمة المرور غير صحيحة');
      } else {
        login(data.token, data.user);
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-card">
      <Helmet>
        <title>أكاديمية جمعة عبد الشفيع | تسجيل الدخول</title>
        <meta name="description" content="تسجيل الدخول إلى أكاديمية جمعة عبد الشفيع للوصول إلى الدروس والامتحانات والمحتوى التعليمي الحصوي." />
      </Helmet>
      <div className="max-w-md w-full bg-bg p-8 rounded-2xl shadow-sm border border-border-main">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">
            تسجيل الدخول
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">رقم الهاتف</label>
            <input 
              name="phone"
              type="tel" 
              required 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              placeholder="01xxxxxxxxx"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">كلمة المرور</label>
            <input 
              name="password"
              type="password" 
              required 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              dir="ltr"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors mt-6 text-base disabled:opacity-70"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}


