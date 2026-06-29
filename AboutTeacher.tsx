import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Award, BookOpen, MapPin, Phone, Star, GraduationCap, Clock } from 'lucide-react';

export function AboutTeacher() {
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-card">
      <Helmet>
        <title>أكاديمية جمعة عبد الشفيع | عن الأستاذ</title>
        <meta name="description" content="تعرف على الأستاذ جمعة عبد الشفيع، خبير اللغة العربية للمراحل الثانوية بخبرة تزيد عن 30 عاماً، ومواقع التدريس وسجل التفوق." />
      </Helmet>
      {/* Header Profile Section */}
      <section className="bg-primary text-white pt-24 pb-40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold via-primary to-primary"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="relative group shrink-0">
              <div className="absolute -inset-4 bg-gold/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[500px] lg:rounded-3xl rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                <img 
                  src="/gomaa-abdelshafea.webp" 
                  alt="الأستاذ جمعة عبد الشفيع" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gold text-primary px-6 py-3 rounded-2xl font-black shadow-xl z-20 transform rotate-3 text-mobile-btn md:text-lg">
                30+ سنة خبرة
              </div>
            </div>
            <div className="text-center lg:text-right flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg/10 rounded-full border border-white/20 mb-8 backdrop-blur-sm">
                <Star className="w-5 h-5 text-gold fill-gold" />
                <span className="font-black text-gold tracking-widest text-xs md:text-sm">خبير مادة اللغة العربية</span>
              </div>
              <h1 className="text-mobile-h1 md:text-5xl lg:text-7xl font-black mb-6 leading-tight">الأستاذ جمعة عبد الشفيع</h1>
              <h2 className="text-mobile-h2 md:text-2xl lg:text-3xl text-slate-300 font-black mb-10">مدرس اللغة العربية للمراحل الثانوية بالقاهرة</h2>
              <p className="text-mobile-body md:text-xl text-slate-300 max-w-4xl mx-auto lg:mx-0 leading-relaxed font-medium">
                خبرة تزيد عن 30 عاماً في تدريس اللغة العربية للمراحل الثانوية، مع شرح مبسط ومنهجية تعليمية تساعد الطلاب على التفوق وتحقيق أفضل النتائج. متخصص في تبسيط قواعد النحو والبلاغة بأساليب حديثة تربط بين الأصالة والسهولة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 -mt-16 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-bg rounded-3xl shadow-xl border border-border-main p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <div className="text-3xl font-extrabold text-primary mb-1" dir="ltr">+30</div>
              <div className="text-sm text-text-muted font-medium">سنة خبرة</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gold/10 text-gold-dark rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="text-3xl font-extrabold text-primary mb-1" dir="ltr">1000s</div>
              <div className="text-sm text-text-muted font-medium">الطلاب الناجحين</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Award className="w-7 h-7" />
              </div>
              <div className="text-3xl font-extrabold text-primary mb-1" dir="ltr">1st</div>
              <div className="text-sm text-text-muted font-medium">المراكز الأولى</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="text-3xl font-extrabold text-primary mb-1">شامل</div>
              <div className="text-sm text-text-muted font-medium">منهج متكامل</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Experience */}
      <section className="py-16 bg-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">المسيرة التعليمية والخبرات</h2>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            
            {/* Timeline Item 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gold text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-6 rounded-2xl border border-border-main shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-primary text-xl">خبير مادة اللغة العربية</h3>
                  <time className="text-sm font-medium text-gold">الحاضر</time>
                </div>
                <div className="text-base text-text-muted">
                  إعداد أقوى المراجعات النهائية ونماذج الامتحانات لضمان تفوق الطلاب وحصولهم على الدرجات النهائية.
                </div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-bg p-6 rounded-2xl border border-border-main shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-primary text-xl">تدريس المراحل الثانوية</h3>
                  <time className="text-sm font-medium text-slate-400">1993 - الآن</time>
                </div>
                <div className="text-base text-text-muted">
                  خبرة عملية واسعة في تبسيط النحو والبلاغة وتوصيل المعلومة بأسلوب شيق يتناسب مع تطور المناهج.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary mb-4 text-center">أماكن التواجد</h2>
          <p className="text-base text-text-muted text-center mb-12 max-w-2xl mx-auto">
            مجموعات تقوية مميزة في نخبة من السناتر التعليمية على مستوى القاهرة
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {locations.map((loc, i) => (
              <div key={i} className="bg-bg p-6 rounded-2xl shadow-sm border border-border-main flex flex-col items-center gap-4 hover:border-gold hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <MapPin className="w-6 h-6 text-slate-400 group-hover:text-gold transition-colors" />
                </div>
                <span className="text-xl font-bold text-primary">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">للحجز والتواصل</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="tel:01153492498" className="flex items-center justify-center gap-4 bg-bg/10 p-6 rounded-2xl hover:bg-card/20 transition-all border border-white/10 backdrop-blur-sm flex-1">
              <Phone className="w-8 h-8 text-gold" />
              <div className="text-right" dir="ltr">
                <div className="text-xl font-bold text-white">01153492498</div>
              </div>
            </a>
            <a href="tel:01005275581" className="flex items-center justify-center gap-4 bg-bg/10 p-6 rounded-2xl hover:bg-card/20 transition-all border border-white/10 backdrop-blur-sm flex-1">
              <Phone className="w-8 h-8 text-gold" />
              <div className="text-right" dir="ltr">
                <div className="text-xl font-bold text-white">01005275581</div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
