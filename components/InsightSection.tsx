
import React, { useState, useRef } from 'react';
import { HistoricalInsight } from '../types';
import { generateSpeech } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../services/audioUtils';

interface InsightSectionProps {
  insight: HistoricalInsight | null;
  loading: boolean;
}

export const InsightSection: React.FC<InsightSectionProps> = ({ insight, loading }) => {
  const [speaking, setSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleStopSpeech = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setSpeaking(false);
  };

  const handleStartSpeech = async () => {
    if (!insight) return;
    
    setSpeaking(true);
    
    // Prepare the script
    const script = `
      ${insight.year} yılı tarihsel özeti. 
      Kültürel önemi: ${insight.culturalSignificance}.
      Önemli olaylar: ${insight.events.map(e => `${e.date} tarihinde ${e.description}`).join('. ')}.
      Önemli şahsiyetler: ${insight.notableFigures.map(f => `${f.name}, ${f.role}, ${f.description}`).join('. ')}.
    `;

    const base64Audio = await generateSpeech(script);

    if (base64Audio) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContextRef.current,
        24000,
        1
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setSpeaking(false);
        sourceNodeRef.current = null;
      };
      
      sourceNodeRef.current = source;
      source.start();
    } else {
      setSpeaking(false);
      alert("Ses oluşturulamadı.");
    }
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 sm:p-8 bg-white rounded-2xl border-2 border-slate-100 shadow-sm animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-4 bg-slate-100 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="mt-8 space-y-6">
      <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-scroll"></i>
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
              {insight.year} Yılı Tarihsel Özeti
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {!speaking ? (
              <button 
                onClick={handleStartSpeech}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-xl transition-all font-semibold text-sm group"
              >
                <i className="fas fa-volume-up group-hover:scale-110 transition-transform"></i>
                <span>Dinle</span>
              </button>
            ) : (
              <button 
                onClick={handleStopSpeech}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl transition-all font-semibold text-sm"
              >
                <i className="fas fa-stop"></i>
                <span>Durdur</span>
              </button>
            )}
          </div>
        </div>
        
        {speaking && (
           <div className="absolute top-0 left-0 w-full h-1 bg-emerald-100 overflow-hidden">
             <div className="h-full bg-emerald-500 animate-[loading_2s_infinite_linear]" style={{ width: '30%', animation: 'shimmer 1.5s infinite linear' }}></div>
           </div>
        )}

        <p className="text-slate-600 italic leading-relaxed border-l-4 border-emerald-400 pl-4 py-2">
          "{insight.culturalSignificance}"
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <i className="fas fa-calendar-alt mr-2 text-emerald-500"></i> Olaylar
          </h3>
          <div className="space-y-4">
            {insight.events.map((event, idx) => (
              <div key={idx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-300 before:rounded-full">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 rounded">{event.date}</span>
                <p className="mt-1 text-sm text-slate-600 leading-snug">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <i className="fas fa-user-tie mr-2 text-amber-500"></i> Şahsiyetler
          </h3>
          <div className="space-y-3">
            {insight.notableFigures.map((figure, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold text-slate-800">{figure.name}</h4>
                  <span className="text-[9px] font-bold text-amber-600 uppercase">{figure.role}</span>
                </div>
                <p className="text-[12px] text-slate-500 leading-tight">{figure.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {insight.furtherReading && insight.furtherReading.length > 0 && (
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl">
          <h3 className="text-sm font-bold mb-4 text-emerald-400 uppercase tracking-widest">Kaynaklar ve Bağlantılar</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {insight.furtherReading.map((res, idx) => (
              <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/5">
                <i className="fas fa-link text-xs mr-3 text-slate-400 group-hover:text-emerald-400"></i>
                <span className="text-xs font-medium truncate">{res.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
};
