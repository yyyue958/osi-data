import React, { useState } from 'react';
import { InstalledBaseRow, PipelineExecutionLog, PipelineStats } from '../../types';
import { US_STATES_MAP } from '../../data/sampleData';
import { Play, FileText, Download, MapPin, Sparkles, Upload, Eye, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';
import Papa from 'papaparse';

interface InstalledStateCleanerStepProps {
  rawInstalledData: InstalledBaseRow[];
  onDataProcessed: (cleaned: InstalledBaseRow[], excluded: InstalledBaseRow[]) => void;
  onOpenPreview: (data: any[], title: string, filename: string) => void;
}

export const InstalledStateCleanerStep: React.FC<InstalledStateCleanerStepProps> = ({ 
  rawInstalledData, 
  onDataProcessed, 
  onOpenPreview 
}) => {
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const activeData = uploadedData || rawInstalledData || [];
  
  const [inputFileName, setInputFileName] = useState('Data passed from previous step');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<PipelineExecutionLog[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  
  const [cleanedMatched, setCleanedMatched] = useState<any[] | null>(null);
  const [excludedRecords, setExcludedRecords] = useState<any[] | null>(null);
  const [stateChartData, setStateChartData] = useState<{ state: string; count: number }[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInputFileName(file.name);
    setLogs([{ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Reading CSV: ${file.name}...` }]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data;
        if (parsedData.length === 0) {
          setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), level: 'error', message: '❌ CSV is empty or formatted incorrectly.' }]);
          return;
        }

        setUploadedData(parsedData);
        setLogs(prev => [
          ...prev,
          { timestamp: new Date().toLocaleTimeString(), level: 'success', message: `✅ Loaded ${parsedData.length} records into memory safely.` }
        ]);
        
        setStats(null);
        setCleanedMatched(null);
        setExcludedRecords(null);
      },
      error: (error) => {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), level: 'error', message: `❌ Parsing Error: ${error.message}` }]);
      }
    });
  };

  const runStateCleaning = () => {
    if (activeData.length === 0) return;
    
    setIsProcessing(true);
    const startTime = performance.now();
    
    const firstRow = activeData[0] || {};
    if (!('Location State' in firstRow) || !('IB_Shipped_Year' in firstRow)) {
      const available = Object.keys(firstRow).slice(0, 10).join(', ');
      setLogs([{ timestamp: new Date().toLocaleTimeString(), level: 'error', message: `❌ ERROR: Columns missing! Ensure 'Location State' and 'IB_Shipped_Year' exist.\nAvailable columns: ${available}...` }]);
      setIsProcessing(false);
      return;
    }

    const newLogs: PipelineExecutionLog[] = [
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Standardizing states using Pandas logic equivalent...` }
    ];

    setTimeout(() => {
      const lookup: Record<string, string> = {};
      Object.entries(US_STATES_MAP).forEach(([abbr, full]) => {
        lookup[abbr.toUpperCase()] = full;
        lookup[full.toUpperCase()] = full;
      });

      const matched: any[] = [];
      const not_matched: any[] = [];
      let years_removed = 0;

      activeData.forEach(row => {
        const rawState = String(row['Location State'] || '').trim().toUpperCase();
        const stdState = lookup[rawState] || null;
        
        const rowWithState = { ...row, State_Standardized: stdState };

        if (!stdState) {
          not_matched.push(rowWithState);
          return;
        }

        const rawYear = String(row['IB_Shipped_Year'] || '').trim();
        if (rawYear === '-') {
          years_removed++;
          return;
        }

        matched.push(rowWithState);
      });

      const stateCounts: Record<string, number> = {};
      matched.forEach(r => {
        const st = r.State_Standardized;
        stateCounts[st] = (stateCounts[st] || 0) + 1;
      });

      const sortedStates = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count);

      const chartData = sortedStates.slice(0, 7);
      const top10String = sortedStates.slice(0, 10).map(s => `${s.state.padEnd(20)} ${s.count}`).join('\n');
      const duration = Math.round(performance.now() - startTime);

      newLogs.push(
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Filtering out '-' in 'IB_Shipped_Year'...` },
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `----------------------------------------\nTotal original rows:       ${activeData.length}\nRows dropped (Bad State):  ${not_matched.length}\nRows dropped (Year = '-'): ${years_removed}\nFinal usable rows:         ${matched.length}\n----------------------------------------` },
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Top 10 States in Final Data:\n${top10String}` },
        { timestamp: new Date().toLocaleTimeString(), level: 'success', message: `✅ Pipeline Complete in ${duration}ms!` }
      );

      setLogs(newLogs);
      setStats({
        originalRows: activeData.length,
        filteredRows: matched.length,
        droppedRows: not_matched.length + years_removed,
        warningsCount: not_matched.length,
        executionTimeMs: duration,
        details: { 'Cleaned Matched': matched.length, 'Excluded Bad State': not_matched.length, 'Hyphen Years Dropped': years_removed }
      });
      setCleanedMatched(matched);
      setExcludedRecords(not_matched);
      setStateChartData(chartData);
      setIsProcessing(false);
      
      onDataProcessed(matched as InstalledBaseRow[], not_matched as InstalledBaseRow[]);
      
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });
    }, 150);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Step 3 of 3</span>
            <span>•</span>
            <span>Geographic Standardization (CSV Mode)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Installed Base CSV Cleaner</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Upload, clean, and download massive datasets instantly using text stream CSVs.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-700 font-medium">50-State Dictionary Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">1</div>
                <h3 className="font-bold text-slate-900 text-sm">Data Source (CSV)</h3>
              </div>
            </div>
            <div className="border border-slate-200 bg-slate-50/70 hover:border-emerald-400 rounded-lg p-3.5 transition-colors relative group">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{inputFileName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{activeData.length} records ready</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <label className="cursor-pointer text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Upload Custom CSV</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={() => onOpenPreview(activeData, 'Raw Source Dataset', 'source_data.csv')}
                  className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
                >
                  <Eye className="w-3 h-3 text-slate-500" />
                  <span>Preview Raw</span>
                </button>
              </div>
            </div>
          </div>

          {stateChartData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Top Standardized Installed States</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-mono font-semibold">{stateChartData.reduce((acc, curr) => acc + curr.count, 0)} total</span>
              </div>
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateChartData}>
                    <XAxis dataKey="state" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Execute State Cleaning</span>
            </h3>
            <button
              onClick={runStateCleaning}
              disabled={isProcessing || activeData.length === 0}
              className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-sm ${
                isProcessing || activeData.length === 0 ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
              }`}
            >
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing CSV...</span></>
              ) : (
                <><Play className="w-4 h-4 fill-white" /><span>Run CSV Cleaning Pipeline</span></>
              )}
            </button>
          </div>

          {stats && (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Standardization Summary</h4>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{stats.executionTimeMs}ms</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Total Input</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.originalRows}</p>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Cleaned</p>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats.filteredRows}</p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <p className="text-[10px] text-amber-700 uppercase font-bold">Excluded</p>
                  <p className="text-lg font-bold text-amber-700 mt-0.5">{stats.details?.['Excluded Bad State']}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => cleanedMatched && downloadCSV(cleanedMatched, 'Cleaned_Matched_States.csv')}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Cleaned Data (.csv)</span>
                </button>
                <button
                  onClick={() => excludedRecords && downloadCSV(excludedRecords, 'Excluded_States_Audit.csv')}
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excluded Audit (.csv)</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">Results & Verification</span>
              <button onClick={() => setLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300">Clear Log</button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 pt-2">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {!log.message.includes('---') && <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>}
                  <span className={log.level === 'success' ? 'text-emerald-400 font-semibold' : log.level === 'error' ? 'text-rose-400 font-semibold' : 'text-slate-300'}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
