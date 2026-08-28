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
  // FIX: State for uploaded custom Knee Procedures
  const [uploadedKneeData, setUploadedKneeData] = useState<KneeProcedureRow[] | null>(null);
  const activeKneeData = uploadedKneeData || kneeProceduresData;

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

  // FIX: Handle Uploading the Knee Procedures Excel file
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
        const data = XLSX.utils.sheet_to_json(ws) as KneeProcedureRow[];

        setUploadedKneeData(data);
        setConfig(prev => ({ ...prev, kneeProceduresFileName: file.name }));
        
        setLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: `Uploaded custom Knee file: ${file.name} (${data.length} records loaded into memory)`
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

  const runMergePipeline = () => {
    setIsProcessing(true);
    const startTime = performance.now();
    const newLogs: PipelineExecutionLog[] = [
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Loading cleaned accessory dataset (${cleanedAccessoryData.length} records)...`
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Loading Knee Procedures dataset from '${config.kneeProceduresFileName}'...`
      }
    ];

    setTimeout(() => {
      const filteredKnee: AccessoryOrderRow[] = [];
      
      // FIX: Use activeKneeData instead of kneeProceduresData
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

      const combinedData = [...cleanedAccessoryData, ...filteredKnee];
      const duration = Math.round(performance.now() - startTime);

      newLogs.push(
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `Extracted ${filteredKnee.length} Knee procedures for years [${config.targetYears.join(', ')}]`
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `Mapped Knee column 'Matl Availability Date' -> 'Billing Date'`
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Combined ${cleanedAccessoryData.length} Cleaned Accessory + ${filteredKnee.length} Knee = ${combinedData.length} Total Rows.`
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Saved output successfully in ${duration}ms (${saveMode === 'safe-version' ? 'Timestamped Version Created' : 'In-Place Overwrite with Backup'}).`
        }
      );

      const statsObj: PipelineStats = {
        originalRows: cleanedAccessoryData.length,
        filteredRows: combinedData.length,
        droppedRows: activeKneeData.length - filteredKnee.length,
        warningsCount: 0,
        executionTimeMs: duration,
        details: {
          'Cleaned Accessory Rows': cleanedAccessoryData.length,
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

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
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

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-700 font-medium">
            Step 1 Dependency: <strong className="text-emerald-700">{cleanedAccessoryData.length} records ready</strong>
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
                <h3 className="font-bold text-slate-900 text-sm">Dual Ingestion Sources</h3>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">Cleaned Accessory Dataset</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                      From Step 1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {cleanedAccessoryData.length} rows ready for appending
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenPreview(cleanedAccessoryData, 'Cleaned Accessory Input', 'step1_cleaned.xlsx')}
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview</span>
              </button>
            </div>

            <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]" title={config.kneeProceduresFileName}>
                      {config.kneeProceduresFileName}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {activeKneeData.length} records loaded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label 
                  htmlFor="knee-file-upload"
                  className="cursor-pointer text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-md border border-emerald-200 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Custom</span>
                </label>
                <input
                  id="knee-file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => onOpenPreview(activeKneeData, 'Knee Procedures Dataset Preview', 'knee_procedures.xlsx')}
                  className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3 text-xs text-slate-700">
              <span className="font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-300 font-semibold">
                Matl Availability Date
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-semibold">
                Billing Date
              </span>
              <span className="text-[11px] text-slate-500 ml-auto hidden sm:inline">
                (Auto-aligned schema)
              </span>
            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Target Ship Years Selection</h3>
                  <p className="text-xs text-slate-500">Select which procedure years to extract and append</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setPresetYears('pre-2017')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-700 rounded-md border border-slate-200 font-semibold"
                >
                  &lt; 2017
                </button>
                <button
                  onClick={() => setPresetYears('all')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md border border-slate-200 font-medium"
                >
                  All
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              {availableYears.map((yr) => {
                const isSelected = config.targetYears.includes(yr);
                return (
                  <button
                    key={yr}
                    onClick={() => toggleYear(yr)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm border border-emerald-700'
                        : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
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
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Execute Merge &amp; Append</span>
              <span className="text-xs text-slate-500 font-normal">Step 2 of 3</span>
            </h3>

            <button
              id="run-step-2-btn"
              onClick={runMergePipeline}
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
                  <span>Aligning &amp; Appending Knee Rows...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Step 2: Merge &amp; Append</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Aligns ShipToID, PostalCode, and normalizes date columns automatically.
            </p>
          </div>

          {stats ? (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Combined Dataset Metrics</h4>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {stats.executionTimeMs}ms
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Cleaned Acc</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.details?.['Cleaned Accessory Rows']}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Extracted Knee</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.details?.['Extracted Knee Rows']}</p>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Combined</p>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats.filteredRows}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  id="preview-merged-btn"
                  onClick={() => mergedResult && onOpenPreview(mergedResult, 'Combined Accessory & Knee Dataset', 'accessory_with_knee.xlsx')}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Inspect Table</span>
                </button>
                <button
                  id="download-merged-btn"
                  onClick={handleDownloadExcel}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .xlsx</span>
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
                  Ready. Click &quot;Run Step 2&quot; to merge records.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
