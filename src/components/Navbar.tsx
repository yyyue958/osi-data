import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onResetDemoData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onResetDemoData,
}) => {
  return (
    <header className="bg-[#0f172a] border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-900/30">
              <span className="font-bold text-white text-base tracking-tighter">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base sm:text-lg">
                  MIZUHO OSI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Data Processing Suite
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-3">
            <button
              id="reset-demo-data-btn"
              onClick={onResetDemoData}
              title="Clear All Data"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#1e293b] hover:bg-slate-700 border border-slate-700 rounded-md transition-colors font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-200 select-none" title="Admin User">
              YX
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
