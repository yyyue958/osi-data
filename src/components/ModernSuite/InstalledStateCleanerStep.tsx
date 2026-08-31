import React, { useState } from 'react';
import { 
  InstalledBaseRow, 
  PipelineExecutionLog, 
  PipelineStats 
} from '../../types';
import { US_STATES_MAP } from '../../data/sampleData';
import { 
  CheckCircle2, 
  Play, 
  FileSpreadsheet, 
  Eye, 
  Download, 
  MapPin, 
  AlertTriangle,
  BarChart3,
  Sparkles,
  Upload
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';

export const InstalledStateCleanerStep: React.FC = () => {
  // STRICTLY using useState (RAM) to avoid LocalStorage Quota Crashes
  const [activeData, setActiveData] = useState<InstalledBaseRow[]>([]);
  const [inputFileName, setInputFileName] = useState('No file uploaded');
  const [outputFileName, setOutputFileName] = useState('cleaned_states_output.xlsx');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<PipelineExecutionLog[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  
  const [cleanedMatched, setCleanedMatched] = useState<any[] | null>(null);
  const [excludedRecords, setExcludedRecords] = useState<any[] | null>(null);
  const [stateChartData, setStateChartData] = useState<{ state: string; count: number }[]>([]);

  // SMART AUTO-DETECT FILE UPLOAD (Memory Optimized)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = new Uint8Array(evt.target?.result as ArrayBuffer);
        // "dense: true" saves massive amounts of browser memory for large sheets
        const wb = XLSX.read(buffer, { type: 'array', dense: true });
        
        let bestSheetName = wb.SheetNames[0];
        let maxRows = 0;
        let bestData: InstalledBaseRow[] = [];

        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          let sheetData = XLSX.utils.sheet_to_json(ws) as any[];
          
          if (sheetData.length === 0) {
            try {
              sheetData = XLSX.utils.sheet_to_json(ws, { range: 2 }) as any[];
            } catch (e) {}
          }

          if (sheetData.length > maxRows) {
            maxRows = sheetData.length;
            bestSheetName = sheetName;
            bestData = sheetData;
          }
        });

        if (bestData.length === 0) {
          setLogs([{ timestamp: new Date().toLocaleTimeString(), level: 'error', message: `❌ Could not find data.` }]);
          return;
        }

        setActiveData(bestData);
        setInputFileName(file.name);
        setStats(null); // Reset previous runs
        
        setLogs([
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'success',
            message: `Loaded sheet "${bestSheetName}". (${bestData.length} records in RAM)`
          }
        ]);
      } catch (err) {
        setLogs([{ timestamp: new Date().toLocaleTimeString(), level: 'error', message: `Parse Failed: ${String(err)}` }]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const runStateCleaning = () => {
    if (activeData.length === 0) {
      setLogs([{ timestamp: new Date().toLocaleTimeString(), level: 'error', message: `❌ ERROR: Please upload a file first.` }]);
      return;
    }

    setIsProcessing(true);
    const startTime = performance.now();
    
    // Allow UI to update before locking the main thread with heavy processing
    setTimeout(() => {
      const firstRow = activeData[0] || {};
      if (!('Location State' in firstRow) || !('IB_Shipped_Year' in firstRow)) {
        setLogs([{ timestamp: new Date().toLocaleTimeString(), level: 'error', message: `❌ ERROR: Missing 'Location State' or 'IB_Shipped_Year'.` }]);
        setIsProcessing(false);
        return;
      }

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

      const duration = Math.round(performance.now() - startTime);

      setLogs([
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Loading data from:\n${inputFileName}...` },
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Standardizing states...` },
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `----------------------------------------\nTotal original rows:       ${activeData.length}\nRows dropped (Bad State):  ${not_matched.length}\nRows dropped (Year = '-'): ${years_removed}\nFinal usable rows:         ${matched.length}\n----------------------------------------` },
        { timestamp: new Date().toLocaleTimeString(), level: 'success', message: `✅ Pipeline Complete!` }
      ]);

      setStats({
        originalRows: activeData.length,
        filteredRows: matched.length,
        droppedRows: not_matched.length + years_removed,
        warningsCount: not_matched.length,
        executionTimeMs: duration,
        details: {
          'Cleaned Matched Rows': matched.length,
          'Excluded Bad State': not_matched.length,
          'Hyphen Years Dropped': years_removed
        }
      });

      setCleanedMatched(matched);
      setExcludedRecords(not_matched);
      setStateChartData(sortedStates.slice(0, 7));
      setIsProcessing(false);

      confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });
    }, 100); // 100ms delay gives the browser time to show the spinning loader
  };

  const handleDownloadMultiSheetExcel = () => {
    if (!cleanedMatched || !excludedRecords) return;
    const wb = XLSX.utils.book_new();

    const wsMatched = XLSX.utils.json_to_sheet(cleanedMatched);
    const wsExcluded = XLSX.utils.json_to_sheet(excludedRecords);

    XLSX.utils.book_append_sheet(wb, wsMatched, 'Cleaned_Matched');
    XLSX.utils.book_append_sheet(wb, wsExcluded, 'Excluded_States');

    let fName = outputFileName;
    if (!fName.toLowerCase().endsWith('.xlsx')) fName += '.xlsx';

    XLSX.writeFile(wb, fName, { bookType: 'xlsx', type: 'array' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Step 3 of 3</span>
            <span>•</span>
            <span>Geographic Standardization &amp; Sanity</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Installed Base State Cleaning Pipeline
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">1. Source &amp; Target</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Raw Installed Base (.xlsx)</label>
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate" title={inputFileName}>{inputFileName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{activeData.length} records</p>
                  </div>
                </div>
                <label className="cursor-pointer text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-md flex justify-center items-center gap-1 transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload File
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Output File Name</label>
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="w-full text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {stateChartData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Top Standardized Installed States</span>
              </h4>
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateChartData}>
                    <XAxis dataKey="state" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '6px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Execute Cleaning</h3>
            <button
              onClick={runStateCleaning}
              disabled={isProcessing || activeData.length === 0}
              className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex justify-center gap-2 shadow-sm ${
                isProcessing || activeData.length === 0 ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isProcessing ? <span>Processing (Please Wait)...</span> : <span>Run Step 3</span>}
            </button>
          </div>

          {stats && (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-md space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Summary</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Input</p>
                  <p className="text-lg font-bold text-slate-900">{stats.originalRows}</p>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Matched</p>
                  <p className="text-lg font-bold text-emerald-700">{stats.filteredRows}</p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <p className="text-[10px] text-amber-700 uppercase font-bold">Excluded</p>
                  <p className="text-lg font-bold text-amber-700">{stats.droppedRows}</p>
                </div>
              </div>
              <button
                onClick={handleDownloadMultiSheetExcel}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Final .xlsx
              </button>
            </div>
          )}

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 font-mono text-xs shadow-sm">
            <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2 mb-2 uppercase font-bold text-[11px]">
              <span>Logs</span>
              <button onClick={() => setLogs([])} className="hover:text-white">Clear</button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {logs.map((log, idx) => (
                <div key={idx} className={`whitespace-pre-wrap ${log.level === 'success' ? 'text-emerald-400' : log.level === 'error' ? 'text-rose-400' : 'text-slate-300'}`}>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
