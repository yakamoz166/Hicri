
import React from 'react';
import { CalendarType } from '../types';

interface YearCardProps {
  label: string;
  value: number;
  type: CalendarType;
  onChange?: (val: number) => void;
  isResult?: boolean;
}

export const YearCard: React.FC<YearCardProps> = ({ label, value, type, onChange, isResult }) => {
  return (
    <div className={`p-5 sm:p-6 rounded-2xl transition-all duration-300 ${isResult ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-white border-2 border-slate-200 shadow-sm'}`}>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</h3>
      <div className="flex items-center justify-between">
        {isResult ? (
          <span className="text-3xl sm:text-4xl font-serif font-bold text-emerald-700">{value}</span>
        ) : (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange?.(parseInt(e.target.value) || 0)}
            className="text-3xl sm:text-4xl font-serif font-bold text-slate-800 bg-transparent outline-none w-full border-b border-transparent focus:border-emerald-500 transition-all py-1"
            placeholder="0000"
          />
        )}
        <span className="text-lg font-medium text-slate-400 ml-2">{type}</span>
      </div>
    </div>
  );
};
