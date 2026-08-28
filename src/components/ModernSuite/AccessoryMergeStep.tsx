import React, { useState } from 'react';
import { 
  MergeKneeConfig, 
  AccessoryOrderRow, 
  KneeProcedureRow, 
  PipelineExecutionLog, 
  PipelineStats 
} from '../../types';
import { 
  CheckCircle2, 
  Play, 
  FileSpreadsheet, 
  Eye, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AccessoryMergeStepProps {
  cleanedAccessoryData: AccessoryOrderRow[];
  kneeProceduresData: KneeProcedureRow[];
  onMergedDataReady: (mergedData: AccessoryOrderRow[]) => void;
  onOpenPreview: (data: any[], title: string, filename: string) => void;
}

// Exactly matches Python target_cols
const TARGET_COLS = [
  "Billing Date", "Ship Year", "Order Type", "Material", "Material Description",
  "Billing Qty", "Total Actuals", "ShipToID", "ShipTo Name", "ShipTo Street",
  "ShipTo City", "ShipTo Region", "ShipTo PostalCode"
];

export const AccessoryMergeStep: React.FC<AccessoryMergeStepProps> = ({
  cleanedAccessoryData,
  kneeProceduresData,
  onMergedDataReady,
  onOpenPreview
}) => {
  const [uploadedKneeData, setUploadedKneeData] = useState<KneeProcedureRow[] | null>(null);
  const activeKneeData = uploadedKneeData || kneeProceduresData;

  const [uploadedAccessoryData, setUploadedAccessoryData] = useState<AccessoryOrderRow[] | null>(null);
  const activeAccessoryData = uploadedAccessoryData || cleanedAccessoryData;

  const [config, setConfig] = useLocalStorage<MergeKneeConfig>('mizuho_merge_knee_config', {
    cleanAccessoryFileName: 'accesary_final_cleaned.xlsx',
    kneeProceduresFileName: '2020-2022 Knee procedures.xlsx',
    targetYears: [2013, 2014, 2015, 2016]
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<PipelineExecutionLog[]>([]);
  const [stats, setStats] = useLocalStorage<PipelineStats | null>('mizuho_merge_knee_stats', null);
  const [mergedResult, setMergedResult] = useLocalStorage<any[] | null>('mizuho_merge_knee_result', null);

  const availableYears = [2012, 2013, 2014, 2015, 2016, 2017, 2018];

  const toggleYear = (year: number) => {
    setConfig(prev => ({
      ...prev,
      targetYears: prev.targetYears.includes(year)
        ? prev.targetYears.filter(y => y !== year)
        : [...prev.targetYears, year].sort((a, b) => a - b)
    }));
  };

  const setPresetYears = (preset: 'pre-2017' | 'all' | 'recent') => {
    if (preset === 'pre-2017') {
      setConfig(prev => ({ ...prev, targetYears: [2013, 2014, 2015, 2016] }));
    } else if (preset === 'all') {
      setConfig(prev => ({ ...prev, targetYears: availableYears }));
    } else {
      setConfig(prev => ({ ...prev, targetYears: [2015, 2016] }));
    }
  };

  const handleAccessoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as AccessoryOrderRow[];

        setUploadedAccessoryData(data);
        setConfig(prev => ({ ...prev, cleanAccessoryFileName: file.name }));
        
        setLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: `Uploaded Clean Accessory file: ${file.name} (${data.length} records)`
          }
        ]);
      } catch (err) {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), level: 'error', message: `Error: ${String(err)}` }]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Skip header=2 and check specific sheet
  const handleKneeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const targetSheetName = "All accessory installs - clean";
        const wsname = wb.SheetNames.includes(targetSheetName) ? targetSheetName : wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data = XLSX.utils.sheet_to_json(ws, { range: 2 }) as KneeProcedureRow[];

        setUploadedKneeData(data);
        setConfig(prev => ({ ...prev, kneeProceduresFileName: file.name }));
        
        setLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: `Uploaded Knee file: ${file.name}. Skipped top 2 header rows. (${data.length} records loaded)`
          }
        ]);
      } catch (err) {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), level: 'error', message: `Error: ${String(err)}` }]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const runMergePipeline = () => {
    setIsProcessing(true);
    const startTime = performance.now();
    const newLogs: PipelineExecutionLog[] = [
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Loading existing cleaned accessory dataset:\n${config.cleanAccessoryFileName}...`
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Loading Knee procedures dataset (headers on Row 3):\n${config.kneeProceduresFileName}...`
      }
    ];

    setTimeout(() => {
      try {
        newLogs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Filtering Knee procedures for Ship Years: ${config.targetYears.join(', ')}` });

        // 1. Process Accessory Data exactly like Python (subsetting columns & extracting year)
        const processedAccessory: any[] = [];
        activeAccessoryData.forEach(row => {
          const newRow: any = {};
          
          let shipYear = row['Ship Year'] || row['Billing Year'];
          if (shipYear === undefined || shipYear === null || shipYear === '') {
             const d = new Date(row['Billing Date']);
             if (!isNaN(d.getFullYear())) shipYear = d.getFullYear();
          }

          TARGET_COLS.forEach(col => {
            if (col === 'Ship Year') {
              newRow[col] = shipYear;
            } else {
              newRow[col] = row[col] !== undefined ? row[col] : '';
            }
          });
          processedAccessory.push(newRow);
        });

        // 2. Process Knee Data exactly like Python (renaming Matl->Billing Date, Billing Year->Ship Year)
        const filteredKnee: any[] = [];
        activeKneeData.forEach(row => {
          let shipYear = typeof row['Ship Year'] === 'number' ? row['Ship Year'] : parseInt(String(row['Ship Year']), 10);
          if (isNaN(shipYear) && row['Billing Year']) {
            shipYear = parseInt(String(row['Billing Year']), 10);
          }

          if (config.targetYears.includes(shipYear)) {
            const newRow: any = {};
            TARGET_COLS.forEach(col => {
              if (col === 'Billing Date') {
                newRow[col] = row['Matl Availability Date'];
              } else if (col === 'Ship Year') {
                newRow[col] = shipYear;
              } else {
                newRow[col] = row[col] !== undefined ? row[col] : '';
              }
            });
            filteredKnee.push(newRow);
          }
        });

        newLogs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `-> Extracted ${filteredKnee.length} rows from target years.` });
        newLogs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Aligning column names (Mapping Knee 'Matl Availability Date' -> 'Billing Date')...` });
        newLogs.push({ timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Appending Knee records below cleaned accessory dataset...` });

        // Combine subsets
        const combinedData = [...processedAccessory, ...filteredKnee];
        const duration = Math.round(performance.now() - startTime);

        newLogs.push(
          { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `---------------------------------------------` },
          { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Original Cleaned Rows:    ${processedAccessory.length}` },
          { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Appended Knee Rows:       ${filteredKnee.length}` },
          { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Total Combined Rows:      ${combinedData.length}` },
          { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `---------------------------------------------` },
          { timestamp: new Date().toLocaleTimeString(), level: 'success', message: `✅ Success! The datasets have been merged and saved.` }
        );

        const statsObj: PipelineStats = {
          originalRows: processedAccessory.length,
          filteredRows: combinedData.length,
          droppedRows: activeKneeData.length - filteredKnee.length,
          warningsCount: 0,
          executionTimeMs: duration,
          details: {
            'Cleaned Accessory Rows': processedAccessory.length,
            'Extracted Knee Rows': filteredKnee.length,
            'Total Appended Output': combinedData.length,
            'Target Years': config.targetYears.join(', ')
          }
        };

        setLogs(newLogs);
        setStats(statsObj);
        setMergedResult(combinedData);
        setIsProcessing(false);
        onMergedDataReady(combinedData as AccessoryOrderRow[]);

        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });

      } catch (err) {
        setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), level: 'error', message: `❌ ERROR: ${String(err)}` }]);
        setIsProcessing(false);
      }
    }, 400);
  };

  const handleDownloadExcel = () => {
    if (!mergedResult) return;
    const ws = XLSX.utils.json_to_sheet(mergedResult);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Merged_Accessory_Knee');
    XLSX.writeFile(wb, 'accessory_with_pre2017_knee.xlsx');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Step 2 of 3</span>
            <span>•</span>
            <span>Dataset Merging &amp; Alignment</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Merge Accessory with Pre-2017 Knee Procedures
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Extracts historical knee procedures, maps column schemas, and appends to the cleaned accessory dataset.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">1. Dual Ingestion Sources</h3>

            {/* Accessory Upload */}
            <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={config.cleanAccessoryFileName}>{config.cleanAccessoryFileName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{activeAccessoryData.length} rows ready</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Upload Custom
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleAccessoryFileUpload} className="hidden" />
                </label>
                <button onClick={() => onOpenPreview(activeAccessoryData, 'Cleaned Accessory Input', 'step1_cleaned.xlsx')} className="text-xs text-slate-700 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview
                </button>
              </div>
            </div>

            {/* Knee Upload */}
            <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={config.kneeProceduresFileName}>{config.kneeProceduresFileName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{activeKneeData.length} records loaded (Header Row 3)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Upload Custom
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleKneeFileUpload} className="hidden" />
                </label>
                <button onClick={() => onOpenPreview(activeKneeData, 'Knee Procedures Dataset Preview', 'knee_procedures.xlsx')} className="text-xs text-slate-700 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-100 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">2. Target Ship Years Selection</h3>
            <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              {availableYears.map((yr) => {
                const isSelected = config.targetYears.includes(yr);
                return (
                  <button
                    key={yr}
                    onClick={() => toggleYear(yr)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isSelected ? 'bg-emerald-600 text-white shadow-sm border border-emerald-700' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span>{yr}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-100" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Execute Merge &amp; Append</h3>
            <button
              onClick={runMergePipeline}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                isProcessing ? 'bg-slate-400 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isProcessing ? <span>Processing...</span> : <span>Run Step 2: Merge &amp; Append</span>}
            </button>
          </div>

          {stats && (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-md space-y-4">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Combined Dataset Metrics</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold">Cleaned Acc</p>
                  <p className="text-lg font-bold text-slate-900">{stats.details?.['Cleaned Accessory Rows']}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold">Extracted Knee</p>
                  <p className="text-lg font-bold text-slate-900">{stats.details?.['Extracted Knee Rows']}</p>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-bold">Combined</p>
                  <p className="text-lg font-bold text-emerald-700">{stats.filteredRows}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onOpenPreview(mergedResult!, 'Combined Dataset', 'output.xlsx')} className="flex-1 py-2 bg-slate-100 text-slate-800 rounded-md text-xs font-semibold border border-slate-300">Inspect Table</button>
                <button onClick={handleDownloadExcel} className="flex-1 py-2 bg-emerald-600 text-white rounded-md text-xs font-semibold">Download .xlsx</button>
              </div>
            </div>
          )}

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 shadow-sm">
            <div className="text-slate-400 border-b border-slate-800 pb-2 font-bold text-[11px] uppercase flex justify-between">
              <span>Results & Verification</span>
              <button onClick={() => setLogs([])} className="hover:text-white">Clear</button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 pt-2">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] whitespace-pre-wrap">
                  {log.message.includes('---') ? null : <span className="text-slate-500">[{log.timestamp}]</span>}
                  <span className={log.level === 'success' ? 'text-emerald-400' : log.level === 'error' ? 'text-rose-400' : 'text-slate-300'}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
