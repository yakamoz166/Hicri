
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarType, HistoricalInsight } from './types';
import { convertYear } from './services/calendarService';
import { getHistoricalInsights } from './services/geminiService';
import { YearCard } from './components/YearCard';
import { InsightSection } from './components/InsightSection';

const App: React.FC = () => {
  const [inputYear, setInputYear] = useState<number>(1446);
  const [fromType, setFromType] = useState<CalendarType>(CalendarType.HIJRI);
  const [resultYear, setResultYear] = useState<number>(2024);
  const [insight, setInsight] = useState<HistoricalInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);

  useEffect(() => {
    setResultYear(convertYear(inputYear, fromType));
  }, [inputYear, fromType]);

  const toggleDirection = () => {
    setFromType(prev => prev === CalendarType.HIJRI ? CalendarType.GREGORIAN : CalendarType.HIJRI);
    setInputYear(resultYear);
  };

  const handleFetchInsights = async () => {
    if (inputYear < 1) return;
    setLoadingInsight(true);
    const data = await getHistoricalInsights(inputYear, fromType);
    setInsight(data);
    setLoadingInsight(false);
    
    // Scroll to results on mobile
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 islamic-pattern flex flex-col">
      {/* Mobile Friendly Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-calendar-day text-sm sm:text-base"></i>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">TakvimMatik</h1>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <i className="fas fa-redo-alt"></i>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 mb-3 px-2">
            Tarihler Arası Köprü
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            Yılı girin, dönüşümü görün ve o yılın dünyadaki yansımasını yapay zeka ile keşfedin.
          </p>
        </div>

        {/* Converter Box */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-6 sm:p-10 border border-slate-100">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="w-full flex-1">
              <YearCard 
                label="Giriş Yılı"
                value={inputYear}
                type={fromType}
                onChange={setInputYear}
              />
            </div>

            <button 
              onClick={toggleDirection}
              className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full hover:bg-emerald-500 hover:text-white transition-all transform active:scale-95 shadow-inner"
            >
              <i className="fas fa-exchange-alt rotate-90 md:rotate-0"></i>
            </button>

            <div className="w-full flex-1">
              <YearCard 
                label="Dönüşen Yıl"
                value={resultYear}
                type={fromType === CalendarType.HIJRI ? CalendarType.GREGORIAN : CalendarType.HIJRI}
                isResult
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleFetchInsights}
              disabled={loadingInsight || !inputYear}
              className="flex-1 py-4 sm:py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200/50 transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
            >
              {loadingInsight ? (
                <><i className="fas fa-circle-notch fa-spin mr-2"></i> Araştırılıyor...</>
              ) : (
                <><i className="fas fa-magic mr-2"></i> Tarihsel Keşif Yap</>
              )}
            </button>
            <button 
              onClick={() => {
                const text = `${inputYear} ${fromType} = ${resultYear} ${fromType === CalendarType.HIJRI ? 'Miladi' : 'Hicri'}`;
                navigator.clipboard.writeText(text);
                alert('Dönüşüm panoya kopyalandı!');
              }}
              className="px-6 py-4 sm:py-5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold transition-all flex items-center justify-center"
            >
              <i className="far fa-copy text-lg"></i>
            </button>
          </div>
        </div>

        <InsightSection insight={insight} loading={loadingInsight} />

        {/* Info Cards */}
        <div className="mt-16 grid sm:grid-cols-2 gap-6 pb-12">
          <div className="p-6 bg-white/50 rounded-3xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
              <i className="fas fa-info-circle mr-2 text-emerald-500"></i> Hassasiyet
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dönüşümler standart matematiksel modeller (M=H+622-H/33) kullanılarak yapılmaktadır. Dini günlerde astronomik gözlemler esastır.
            </p>
          </div>
          <div className="p-6 bg-white/50 rounded-3xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center">
              <i className="fas fa-brain mr-2 text-purple-500"></i> AI Desteği
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tarihsel veriler Google Gemini AI tarafından o yıla özel olarak oluşturulur ve internet kaynakları ile doğrulanmaya çalışılır.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-400 font-medium">© 2024 TakvimMatik • Türkiye</p>
      </footer>
    </div>
  );
};

export default App;
