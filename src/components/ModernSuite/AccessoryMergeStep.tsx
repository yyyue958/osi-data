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
  const [mergedResult, setMergedResult] = useLocalStorage<AccessoryOrderRow[] | null>('mizuho_merge_knee_result', null);
  const [saveMode, setSaveMode] = useState<'safe-version' | 'in-place'>('safe-version');

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

  // FIX: Added header=2 skip and specific sheet logic exactly like the Python script
  const handleKneeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        // Find specific sheet like the Python script, or default to first
        const targetSheetName = "All accessory installs - clean";
        const wsname = wb.SheetNames.includes(targetSheetName) ? targetSheetName : wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // { range: 2 } is the exact React equivalent of Python's header=2
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
        message: `Loading cleaned accessory dataset (${activeAccessoryData.length} records)...`
      }
    ];

    setTimeout(() => {
      const filteredKnee: AccessoryOrderRow[] = [];
      
      activeKneeData.forEach(row => {
        const shipYear = typeof row['Ship Year'] === 'number' 
          ? row['Ship Year'] 
          : parseInt(String(row['Ship Year']), 10);

        if (config.targetYears.includes(shipYear)) {
          filteredKnee.push({
            'Billing Date': row['Matl Availability Date'],
            'Billing Year': shipYear,
            'Order Type': row['Order Type'],
            'ShipTo Country': 'US',
            'Order Reason': '',
            'Total Actuals': row['Total Actuals'],
            'Material': row['Material'],
            'Material Description': row['Material Description'],
            'Billing Qty': row['Billing Qty'],
            'ShipToID': row['ShipToID'],
            'ShipTo Name': row['ShipTo Name'],
            'ShipTo Street': row['ShipTo Street'],
            'ShipTo City': row['ShipTo City'],
            'ShipTo Region': row['ShipTo Region'],
            'ShipTo PostalCode': row['ShipTo PostalCode']
          });
        }
      });

      const combinedData = [...activeAccessoryData, ...filteredKnee];
      const duration = Math.round(performance.now() - startTime);

      newLogs.push(
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Extracted ${filteredKnee.length} Knee procedures for years [${config.targetYears.join(', ')}]` },
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Mapped Knee column 'Matl Availability Date' -> 'Billing Date'` },
        { timestamp: new Date().toLocaleTimeString(), level: 'success', message: `Combined ${activeAccessoryData.length} Cleaned + ${filteredKnee.length} Knee = ${combinedData.length} Total Rows.` }
      );

      const statsObj: PipelineStats = {
        originalRows: activeAccessoryData.length,
        filteredRows: combinedData.length,
        droppedRows: activeKneeData.length - filteredKnee.length,
        warningsCount: 0,
        executionTimeMs: duration,
        details: {
          'Cleaned Accessory Rows': activeAccessoryData.length,
          'Extracted Knee Rows': filteredKnee.length,
          'Total Appended Output': combinedData.length,
          'Target Years': config.targetYears.join(', ')
        }
      };

      setLogs(newLogs);
      setStats(statsObj);
      setMergedResult(combinedData);
      setIsProcessing(false);
      onMergedDataReady(combinedData);

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
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
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{config.cleanAccessoryFileName}</p>
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
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{config.kneeProceduresFileName}</p>
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
                <button onClick={() => onOpenPreview(mergedResult!, 'Combined Dataset', 'output.xlsx')} className="flex-1 py-2 bg-slate-100 text-slate-800 rounded-md text-xs font-semibold border border-slate-300">Inspect</button>
                <button onClick={handleDownloadExcel} className="flex-1 py-2 bg-emerald-600 text-white rounded-md text-xs font-semibold">Download .xlsx</button>
              </div>
            </div>
          )}

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 shadow-sm">
            <div className="text-slate-400 border-b border-slate-800 pb-2 font-bold text-[11px] uppercase">Activity Stream</div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px]">
                  <span className="text-slate-500">[{log.timestamp}]</span>
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
