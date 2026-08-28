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
import { useLocalStorage } from '../../hooks/useLocalStorage';

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
  // FIX: Local state to hold the uploaded file
  const [uploadedData, setUploadedData] = useState<InstalledBaseRow[] | null>(null);
  const activeData = uploadedData || rawInstalledData;

  const [inputFileName, setInputFileName] = useState('installed based  08-04-2026(raw).xlsx');
  const [outputFileName, setOutputFileName] = useLocalStorage('mizuho_installed_output', 'cleaned_states_output.xlsx');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<PipelineExecutionLog[]>([]);
  const [stats, setStats] = useLocalStorage<PipelineStats | null>('mizuho_installed_stats', null);
  
  const [cleanedMatched, setCleanedMatched] = useLocalStorage<any[] | null>('mizuho_installed_matched', null);
  const [excludedRecords, setExcludedRecords] = useLocalStorage<any[] | null>('mizuho_installed_excluded', null);
  const [stateChartData, setStateChartData] = useLocalStorage<{ state: string; count: number }[]>('mizuho_installed_chart', []);

  // FIX: File Upload Handler for Step 3
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as InstalledBaseRow[];

        setUploadedData(data);
        setInputFileName(file.name);
        
        setLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: `Uploaded custom file: ${file.name} (${data.length} records loaded into memory)`
          }
        ]);
      } catch (err) {
        setLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'error',
            message: `Failed to parse uploaded Excel: ${String(err)}`
          }
        ]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const runStateCleaning = () => {
    setIsProcessing(true);
    const startTime = performance.now();

    const newLogs: PipelineExecutionLog[] = [
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Reading '${inputFileName}' with ${activeData.length} records...`
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Standardizing US state names and abbreviations across 50 states...`
      }
    ];

    setTimeout(() => {
      const lookup: Record<string, string> = {};
      Object.entries(US_STATES_MAP).forEach(([abbr, full]) => {
        lookup[abbr.toUpperCase()] = full;
        lookup[full.toUpperCase()] = full;
      });

      const matched: any[] = [];
      const excluded: any[] = [];
      let hyphenYearsRemoved = 0;

      // FIX: Use activeData instead of rawInstalledData
      activeData.forEach(row => {
        const rawState = String(row['Location State'] || '').trim().toUpperCase();
        const stdState = lookup[rawState];

        if (!stdState) {
          excluded.push({
            ...row,
            Exclusion_Reason: 'Unmatched / Invalid US State'
          });
          return;
        }

        const rawYear = String(row['IB_Shipped_Year'] || '').trim();
        if (rawYear === '-' || rawYear === '' || rawYear === 'N/A') {
          hyphenYearsRemoved++;
          excluded.push({
            ...row,
            State_Standardized: stdState,
            Exclusion_Reason: "Missing / '-' Ship Year"
          });
          return;
        }

        matched.push({
          ...row,
          State_Standardized: stdState
        });
      });

      const stateCounts: Record<string, number> = {};
      matched.forEach(r => {
        const st = r.State_Standardized;
        stateCounts[st] = (stateCounts[st] || 0) + 1;
      });

      const chartData = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 7);

      const duration = Math.round(performance.now() - startTime);

      newLogs.push(
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `Validation: ${matched.length} valid records matched to official US 50-State database.`
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'warn',
          message: `Dropped ${hyphenYearsRemoved} row(s) with IB_Shipped_Year='-' and ${excluded.length - hyphenYearsRemoved} row(s) with non-standard states.`
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Success! Multi-sheet Excel workbook ready with 'Cleaned_Matched' (${matched.length}) and 'Excluded_States' (${excluded.length}).`
        }
      );

      const statsObj: PipelineStats = {
        originalRows: activeData.length,
        filteredRows: matched.length,
        droppedRows: excluded.length,
        warningsCount: excluded.length,
        executionTimeMs: duration,
        details: {
          'Cleaned Matched Rows': matched.length,
          'Excluded Bad State / Hyphen Year': excluded.length,
          'Hyphen Years Dropped': hyphenYearsRemoved
        }
      };

      setLogs(newLogs);
      setStats(statsObj);
      setCleanedMatched(matched);
      setExcludedRecords(excluded);
      setStateChartData(chartData);
      setIsProcessing(false);
      onDataProcessed(matched, excluded);

      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.8 }
      });
    }, 400);
  };

  const handleDownloadMultiSheetExcel = () => {
    if (!cleanedMatched || !excludedRecords) return;
    const wb = XLSX.utils.book_new();

    const wsMatched = XLSX.utils.json_to_sheet(cleanedMatched);
    const wsExcluded = XLSX.utils.json_to_sheet(excludedRecords);

    XLSX.utils.book_append_sheet(wb, wsMatched, 'Cleaned_Matched');
    XLSX.utils.book_append_sheet(wb, wsExcluded, 'Excluded_States');

    XLSX.writeFile(wb, outputFileName);
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
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Normalizes case-insensitive US state names, eliminates incomplete &apos;-&apos; shipping records, and segregates audit exclusions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-700 font-medium">
            50-State Dictionary Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Source &amp; Multi-Sheet Target</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="border border-slate-200 bg-slate-50/70 hover:border-emerald-400 rounded-lg p-3.5 transition-colors relative group">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Raw Installed Base (.xlsx)
                </label>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate" title={inputFileName}>
                      {inputFileName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {activeData.length} records loaded
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  {/* FIX: New Upload Button for Installed Base */}
                  <label 
                    htmlFor="installed-file-upload"
                    className="cursor-pointer text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Custom</span>
                  </label>
                  <input
                    id="installed-file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => onOpenPreview(activeData, 'Raw Installed Base Dataset', 'installed_base_raw.xlsx')}
                    className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
                  >
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>Preview Raw</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Output Multi-Sheet Workbook
                </label>
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="w-full text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Contains [Cleaned_Matched] + [Excluded_States]
                </p>
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Automated Normalization Matrix</h3>
                  <p className="text-xs text-slate-500">Examples of messy inputs converted cleanly</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] text-slate-500 font-mono">Raw: &quot;california&quot;</p>
                <p className="font-bold text-emerald-700 mt-1">→ California</p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] text-slate-500 font-mono">Raw: &quot;TEXAS&quot;</p>
                <p className="font-bold text-emerald-700 mt-1">→ Texas</p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] text-slate-500 font-mono">Raw: &quot;massachusetts&quot;</p>
                <p className="font-bold text-emerald-700 mt-1">→ Massachusetts</p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] text-slate-500 font-mono">Raw: Year = &quot;-&quot;</p>
                <p className="font-bold text-rose-700 mt-1">→ Excluded Sheet</p>
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
                <span className="text-[11px] text-slate-500 font-mono font-semibold">
                  {stateChartData.reduce((acc, curr) => acc + curr.count, 0)} total installations
                </span>
              </div>
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateChartData}>
                    <XAxis dataKey="state" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
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
              <span className="text-xs text-slate-500 font-normal">Step 3 of 3</span>
            </h3>

            <button
              id="run-step-3-btn"
              onClick={runStateCleaning}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-sm ${
                isProcessing
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Standardizing States &amp; Splitting Sheets...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Step 3: Clean Installed Data</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Requires Location State &amp; IB_Shipped_Year columns.
            </p>
          </div>

          {stats ? (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Standardization Summary</h4>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {stats.executionTimeMs}ms
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Total Input</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.originalRows}</p>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Cleaned Matched</p>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats.filteredRows}</p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <p className="text-[10px] text-amber-700 uppercase font-bold">Excluded Rows</p>
                  <p className="text-lg font-bold text-amber-700 mt-0.5">{stats.droppedRows}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => cleanedMatched && onOpenPreview(cleanedMatched, 'Cleaned & Standardized States Sheet', 'cleaned_matched.xlsx')}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Matched Sheet</span>
                  </button>
                  <button
                    onClick={() => excludedRecords && onOpenPreview(excludedRecords, 'Excluded States Audit Sheet', 'excluded_states.xlsx')}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Excluded Sheet</span>
                  </button>
                </div>

                <button
                  id="download-state-excel-btn"
                  onClick={handleDownloadMultiSheetExcel}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Multi-Sheet Excel Workbook</span>
                </button>
              </div>
            </div>
          ) : null}

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">
                Activity Stream
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear Log
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-slate-500 select-none shrink-0">[{log.timestamp}]</span>
                    <span
                      className={
                        log.level === 'success'
                          ? 'text-emerald-400 font-semibold'
                          : log.level === 'warn'
                          ? 'text-amber-400'
                          : log.level === 'error'
                          ? 'text-rose-400 font-semibold'
                          : 'text-slate-300'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 py-4 text-center text-xs">
                  Ready. Click &quot;Run Step 3&quot; to standardize states.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
