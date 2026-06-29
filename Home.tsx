import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Users, Star, Award, ChevronLeft, User, MapPin, Phone, CheckCircle2, PlayCircle, FileText, BarChart, GraduationCap } from 'lucide-react';
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user } = useAuth();
  const WHATSAPP_NUMBER = "201153492498";
  const INSTAGRAM_URL = "https://www.instagram.com/gomaa_abdelshafea";
  const FACEBOOK_URL = "https://www.facebook.com/jmhbdalshfy";

  const locations = [
    'المطرية',
    'مصر الجديدة',
    'مدينة نصر',
    'التجمع الخامس',
    'المعادي',
    'جسر السويس',
    'الزاوية الحمراء',
    'الخصوص'
  ];

  const features = [
    { title: 'شرح فيديو احترافي', icon: PlayCircle },
    { title: 'ملخصات PDF', icon: FileText },
    { title: 'مراجعات لكل ترم', icon: BookOpen },
    { title: 'تتبع نسبة الإنجاز', icon: BarChart },
    { title: 'متابعة تقدم الطالب', icon: Users },
    { title: 'تنظيم المحتوى حسب الصف الدراسي', icon: GraduationCap },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-card">
      <Helmet>
        <title>أكاديمية جمعة عبد الشفيع | الصفحة الرئيسية</title>
        <meta name="description" content="أكاديمية جمعة عبد الشفيع - منصة تعليمية متخصصة في تدريس اللغة العربية للمراحل الثانوية مع الأستاذ جمعة عبد الشفيع، خبرة تزيد عن 30 عاماً." />
      </Helmet>
      {/* Hero Section */}
      <section className="bg-primary text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold via-primary to-primary"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Mobile Image (Top) */}
            <div className="lg:hidden relative">
              <div className="absolute inset-0 bg-gold/20 rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative bg-slate-800 rounded-3xl overflow-hidden aspect-square border-4 border-white/10 shadow-2xl">
                <img 
                  src="/gomaa-abdelshafea.webp" 
                  alt="الأستاذ جمعة عبد الشفيع" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg/10 rounded-full border border-white/20 mb-6 lg:mb-8 backdrop-blur-sm">
                <Star className="w-5 h-5 text-gold fill-gold" />
                <span className="font-bold text-sm md:text-base">خبرة أكثر من 30 عاماً</span>
              </div>
              
              <h1 className="text-mobile-h1 md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-tight">
                الأستاذ جمعة عبد الشفيع
              </h1>
              <h2 className="text-mobile-h2 md:text-3xl lg:text-4xl text-gold mb-6 md:mb-8 font-black">
                مدرس اللغة العربية للمراحل الثانوية
              </h2>
              
              <p className="text-mobile-body md:text-lg text-slate-300 mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                خبرة تزيد عن 30 عاماً في تدريس اللغة العربية للمراحل الثانوية، مع شرح مبسط ومنهجية تعليمية تساعد الطلاب على التفوق وتحقيق أفضل النتائج.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                <Link 
                  to={user ? "/learning-platform" : "/auth"} 
                  className="w-full sm:w-auto px-8 py-4 bg-gold text-primary font-black rounded-xl hover:bg-gold-dark transition-all hover:-translate-y-1 text-mobile-btn md:text-base flex items-center justify-center gap-2 shadow-lg shadow-gold/20 btn-touch"
                >
                  ابدأ التعلم الآن
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                {!user && (
                  <Link 
                    to="/auth" 
                    className="w-full sm:w-auto px-8 py-4 bg-bg/10 text-white font-black rounded-xl border border-white/20 hover:bg-card/20 transition-all hover:-translate-y-1 text-mobile-btn md:text-base flex items-center justify-center gap-2 backdrop-blur-sm btn-touch"
                  >
                    تسجيل الدخول
                  </Link>
                )}
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold to-blue-600 rounded-3xl transform rotate-3 opacity-20 blur-lg"></div>
              <div className="bg-slate-800 rounded-3xl overflow-hidden aspect-[4/5] border-4 border-white/10 relative shadow-2xl group transition-transform duration-500 hover:scale-[1.02]">
                <img 
                  src="/gomaa-abdelshafea.webp" 
                  alt="الأستاذ جمعة عبد الشفيع" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-6 right-6 left-6 text-right">
                  <div className="inline-block px-3 py-1 bg-gold text-primary text-xs font-black rounded-lg mb-2">خبير مادة اللغة العربية</div>
                  <h3 className="text-2xl font-black text-white">جمعة عبد الشفيع</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-bg rounded-3xl shadow-xl border border-border-main p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {[
                { label: 'سنة خبرة', value: '+30', icon: Star },
                { label: 'أولى ثانوي', value: 'الصف', icon: BookOpen },
                { label: 'ثانية ثانوي', value: 'الصف', icon: BookOpen },
                { label: 'ثالثة ثانوي', value: 'الصف', icon: BookOpen },
                { label: 'مراجعات شاملة', value: '✓', icon: FileText },
                { label: 'متابعة تقدم الطلاب', value: '✓', icon: BarChart },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="w-12 h-12 bg-card text-gold rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-black text-primary">{stat.value}</div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Grades Section */}
      <section className="py-20 bg-card overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-mobile-h2 md:text-4xl font-black text-primary mb-4">المراحل الدراسية</h2>
            <p className="text-mobile-body md:text-lg text-text-muted max-w-2xl mx-auto">
              تغطية شاملة لمنهج اللغة العربية لجميع صفوف المرحلة الثانوية
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-8">
            {(() => {
              const allGrades = [
                { grade: 'أولى ثانوي', color: 'from-blue-500 to-blue-700', key: 'first' },
                { grade: 'ثانية ثانوي', color: 'from-purple-500 to-purple-700', key: 'second' },
                { grade: 'ثالثة ثانوي', color: 'from-gold to-gold-dark', key: 'third' },
              ];

              const filteredGrades = user && user.role === 'student' 
                ? allGrades.filter(g => g.key === user.grade)
                : allGrades;

              const subjectsList = [
                { key: 'grammar', label: 'النحو' },
                { key: 'rhetoric', label: 'البلاغة' },
                { key: 'literature', label: 'الأدب' },
                { key: 'texts', label: 'النصوص' },
                { key: 'reading', label: 'القراءة' },
                { key: 'story', label: 'القصة' },
                { key: 'reviews', label: 'المراجعات' }
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center w-full">
                  {filteredGrades.map((item) => {
                    const isStudent = user && user.role === 'student';
                    const targetLink = user ? '/learning-platform' : '/auth';

                    if (isStudent) {
                      return (
                        <div 
                          key={item.key} 
                          className="md:col-span-2 lg:col-span-3 bg-bg rounded-3xl shadow-md border border-border-main p-5 md:p-8 max-w-4xl mx-auto w-full space-y-6"
                        >
                          <div className={`rounded-2xl bg-gradient-to-br ${item.color} p-5 md:p-6 text-white relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4`}>
                            <BookOpen className="absolute -left-4 -top-4 w-28 h-28 text-white/10 transform -rotate-12" />
                            <div className="relative z-10 text-center sm:text-right">
                              <span className="text-[10px] md:text-xs font-black text-gold/90 uppercase tracking-widest block mb-1">المرحلة الدراسية الخاصة بك</span>
                              <h3 className="text-2xl md:text-3xl font-black">{item.grade}</h3>
                            </div>
                            <Link 
                              to="/learning-platform" 
                              className="relative z-10 px-5 py-2.5 bg-bg text-primary font-black text-sm rounded-xl hover:bg-card transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer btn-touch"
                            >
                              الذهاب للمحتوى الدراسي <ChevronLeft className="w-4 h-4" />
                            </Link>
                          </div>

                          <div className="space-y-8 pt-2">
                            <div className="space-y-4">
                              <h4 className="text-base font-black text-primary flex items-center gap-2 border-b border-border-main pb-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                الفصل الدراسي الأول
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {subjectsList.map((sub) => (
                                  <Link
                                    key={sub.key}
                                    to={`/lessons/${user.grade}/first/${sub.key}`}
                                    className="p-4 text-sm font-black text-center text-text-main bg-card border border-border-main hover:border-gold hover:bg-gold/5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-sm btn-touch active:scale-95"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4 pt-2">
                              <h4 className="text-base font-black text-primary flex items-center gap-2 border-b border-border-main pb-2">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                الفصل الدراسي الثاني
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {subjectsList.map((sub) => (
                                  <Link
                                    key={sub.key}
                                    to={`/lessons/${user.grade}/second/${sub.key}`}
                                    className="p-4 text-sm font-black text-center text-text-main bg-card border border-border-main hover:border-gold hover:bg-gold/5 rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-sm btn-touch active:scale-95"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link 
                        to={targetLink} 
                        key={item.key} 
                        className="group relative overflow-hidden rounded-3xl bg-bg shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-border-main w-full"
                      >
                        <div className={`h-32 bg-gradient-to-br ${item.color} p-6 md:p-8 flex items-end relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/10"></div>
                          <BookOpen className="absolute -left-4 -top-4 w-32 h-32 text-white/10 transform -rotate-12" />
                          <h3 className="text-2xl md:text-3xl font-black text-white relative z-10">{item.grade}</h3>
                        </div>
                        <div className="p-6 md:p-8">
                          <p className="text-mobile-body md:text-base text-text-muted mb-6 leading-relaxed">
                            شرح مفصل لجميع فروع المادة مع تدريبات مستمرة ومراجعات نهائية تضمن التفوق.
                          </p>
                          <div className="flex items-center text-primary font-black group-hover:text-gold transition-colors text-mobile-btn md:text-base">
                            تصفح المحتوى <ChevronLeft className="w-5 h-5 mr-2" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-bg border-y border-border-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">مميزات المنصة</h2>
            <p className="text-text-muted text-base max-w-2xl mx-auto">
              كل ما تحتاجه للنجاح والتفوق في اللغة العربية في مكان واحد
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-card hover:bg-primary hover:text-white transition-colors group">
                <div className="w-14 h-14 bg-bg text-gold rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:bg-card/10 transition-colors">
                  <feature.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary group-hover:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted group-hover:text-slate-300">
                    نقدم لك أحدث الوسائل التعليمية لضمان فهم عميق للمادة العلمية.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Locations Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">أماكن التواجد (السناتر)</h2>
            <p className="text-text-muted text-base max-w-2xl mx-auto">
              يمكنك الانضمام لمجموعات التقوية في أقرب منطقة لك
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locations.map((loc, i) => (
              <div key={i} className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main flex items-center gap-3 hover:border-gold hover:shadow-md transition-all">
                <MapPin className="w-6 h-6 text-gold shrink-0" />
                <span className="text-xl font-bold text-primary">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 text-white">تواصل معنا</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              فريق الدعم متاح للرد على جميع استفساراتكم
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-center gap-8 max-w-5xl mx-auto">
            {/* WhatsApp Contact Card */}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex-1 bg-bg/10 p-8 rounded-3xl hover:bg-card/15 transition-all border border-white/10 backdrop-blur-md group relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/20 rounded-full blur-3xl -ml-10 -mb-10 transition-transform group-hover:scale-150"></div>
              
              <div className="w-20 h-20 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-green-500/20 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 relative z-10">
                <WhatsAppIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">واتساب</h3>
              <p className="text-slate-300 mb-6 relative z-10">تواصل معنا مباشرة عبر رسائل الواتساب</p>
              <div className="text-2xl font-extrabold text-gold tracking-wider relative z-10" dir="ltr">+20 11 5349 2498</div>
            </a>
            
            {/* Social Media Follow Card */}
            <div className="flex-1 bg-bg/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold text-white mb-4">تابعنا على منصات التواصل</h3>
              <p className="text-slate-400 mb-8 max-w-sm">
                تابع أحدث الأخبار، المراجعات، والمحتوى التعليمي الحصري
              </p>
              
              <div className="flex items-center gap-6">
                <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-600/30 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 shadow-lg group-hover:shadow-blue-600/40">
                    <FacebookIcon className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">فيسبوك</span>
                </a>
                
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-pink-600/20 text-pink-400 rounded-2xl flex items-center justify-center border border-pink-600/30 group-hover:bg-gradient-to-tr group-hover:from-yellow-500 group-hover:via-pink-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 shadow-lg group-hover:shadow-pink-500/40">
                    <InstagramIcon className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-pink-400 transition-colors">إنستجرام</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
