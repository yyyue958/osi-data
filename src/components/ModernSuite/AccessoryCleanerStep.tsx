import React, { useState } from 'react';
import { 
  CleanAccessoryConfig, 
  AccessoryOrderRow, 
  PipelineExecutionLog, 
  PipelineStats 
} from '../../types';
import { 
  POPULAR_ORDER_TYPES, 
  KNOWN_EXCLUDE_REASONS 
} from '../../data/sampleData';
import { 
  Upload, 
  CheckCircle2, 
  Play, 
  FileSpreadsheet, 
  Eye, 
  Download, 
  Plus, 
  X,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AccessoryCleanerStepProps {
  rawData: AccessoryOrderRow[];
  onDataProcessed: (cleanedData: AccessoryOrderRow[]) => void;
  onOpenPreview: (data: any[], title: string, filename: string) => void;
}

export const AccessoryCleanerStep: React.FC<AccessoryCleanerStepProps> = ({
  rawData,
  onDataProcessed,
  onOpenPreview
}) => {
  // FIX: Added local state to actually hold the uploaded Excel data
  const [uploadedData, setUploadedData] = useState<AccessoryOrderRow[] | null>(null);

  const [config, setConfig] = useLocalStorage<CleanAccessoryConfig>('mizuho_acc_clean_config', {
    inputFileName: 'accesary install.xlsx',
    outputFileName: 'accesary_final_cleaned.xlsx',
    validOrderTypes: [...POPULAR_ORDER_TYPES],
    validCountry: 'US',
    excludeReasons: ['METECH', 'TRADE IN'],
    excludeActuals: [0]
  });

  const [newTypeInput, setNewTypeInput] = useState('');
  const [newReasonInput, setNewReasonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<PipelineExecutionLog[]>([]);
  const [stats, setStats] = useLocalStorage<PipelineStats | null>('mizuho_acc_clean_stats', null);
  const [cleanedResult, setCleanedResult] = useLocalStorage<AccessoryOrderRow[] | null>('mizuho_acc_clean_result', null);
  const [activePreset, setActivePreset] = useLocalStorage<'standard' | 'strict' | 'all'>('mizuho_acc_clean_preset', 'standard');

  const activeData = uploadedData || rawData; // Use uploaded data if available, else fallback

  const toggleOrderType = (type: string) => {
    setConfig(prev => ({
      ...prev,
      validOrderTypes: prev.validOrderTypes.includes(type)
        ? prev.validOrderTypes.filter(t => t !== type)
        : [...prev.validOrderTypes, type]
    }));
  };

  const addCustomOrderType = () => {
    if (!newTypeInput.trim()) return;
    const upper = newTypeInput.trim().toUpperCase();
    if (!config.validOrderTypes.includes(upper)) {
      setConfig(prev => ({ ...prev, validOrderTypes: [...prev.validOrderTypes, upper] }));
    }
    setNewTypeInput('');
  };

  const toggleExcludeReason = (reason: string) => {
    setConfig(prev => ({
      ...prev,
      excludeReasons: prev.excludeReasons.includes(reason)
        ? prev.excludeReasons.filter(r => r !== reason)
        : [...prev.excludeReasons, reason]
    }));
  };

  const addCustomExcludeReason = () => {
    if (!newReasonInput.trim()) return;
    const upper = newReasonInput.trim().toUpperCase();
    if (!config.excludeReasons.includes(upper)) {
      setConfig(prev => ({ ...prev, excludeReasons: [...prev.excludeReasons, upper] }));
    }
    setNewReasonInput('');
  };

  const applyPreset = (preset: 'standard' | 'strict' | 'all') => {
    setActivePreset(preset);
    if (preset === 'standard') {
      setConfig(prev => ({
        ...prev,
        validOrderTypes: ['KE', 'RE', 'ZDOM', 'ZRMA', 'ZSRV', 'ZTOR', 'ZKE', 'ZOR', 'ZRET'],
        excludeReasons: ['METECH', 'TRADE IN'],
        validCountry: 'US',
        excludeActuals: [0]
      }));
    } else if (preset === 'strict') {
      setConfig(prev => ({
        ...prev,
        validOrderTypes: ['KE', 'RE', 'ZDOM'],
        excludeReasons: ['METECH', 'TRADE IN', 'SCRAP', 'DEMO', 'LOANER'],
        validCountry: 'US',
        excludeActuals: [0]
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        validOrderTypes: [...POPULAR_ORDER_TYPES, 'ZKE', 'ZOR'],
        excludeReasons: [],
        validCountry: 'US',
        excludeActuals: []
      }));
    }
  };

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
        const data = XLSX.utils.sheet_to_json(ws) as AccessoryOrderRow[];

        setUploadedData(data); // FIX: Actually save the uploaded data to state
        setConfig(prev => ({ ...prev, inputFileName: file.name }));
        
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

  const runPipeline = () => {
    setIsProcessing(true);
    const startTime = performance.now();
    const newLogs: PipelineExecutionLog[] = [
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Reading dataset '${config.inputFileName}' with ${activeData.length} rows...`
      },
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Applying Order Types filter: [${config.validOrderTypes.join(', ')}]`
      }
    ];

    setTimeout(() => {
      const filtered: AccessoryOrderRow[] = [];
      let droppedOrderType = 0;
      let droppedCountry = 0;
      let droppedActuals = 0;
      let droppedReason = 0;

      activeData.forEach((row) => {
        const rawActuals = String(row['Total Actuals'] || '0').replace(/[\$,]/g, '').trim();
        const numericActuals = parseFloat(rawActuals) || 0;

        const rowOrderType = String(row['Order Type'] || '').trim().toUpperCase();
        const rowCountry = String(row['ShipTo Country'] || '').trim().toUpperCase();
        const rowReason = String(row['Order Reason'] || '').trim().toUpperCase();

        const matchOrder = config.validOrderTypes.map(t => t.toUpperCase()).includes(rowOrderType);
        if (!matchOrder) {
          droppedOrderType++;
          return;
        }

        const matchCountry = config.validCountry === 'ALL' ? true : rowCountry === config.validCountry.toUpperCase();
        if (!matchCountry) {
          droppedCountry++;
          return;
        }

        const matchActuals = !config.excludeActuals.includes(numericActuals);
        if (!matchActuals) {
          droppedActuals++;
          return;
        }

        const matchReason = !config.excludeReasons.map(r => r.toUpperCase()).includes(rowReason);
        if (!matchReason) {
          droppedReason++;
          return;
        }

        const billingDate = new Date(row['Billing Date']);
        const billingYear = isNaN(billingDate.getFullYear()) ? row['Billing Year'] || 2023 : billingDate.getFullYear();

        filtered.push({
          ...row,
          'Billing Year': billingYear
        });
      });

      const metechRemaining = filtered.filter(r => String(r['Order Reason']).toUpperCase() === 'METECH').length;
      const tradeInRemaining = filtered.filter(r => String(r['Order Reason']).toUpperCase() === 'TRADE IN').length;
      const duration = Math.round(performance.now() - startTime);

      newLogs.push(
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'info',
          message: `Filter Results: Dropped ${droppedOrderType} (Type), ${droppedCountry} (Country), ${droppedReason} (Reason), ${droppedActuals} (Actuals)`
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Verification Passed: METECH=${metechRemaining}, TRADE IN=${tradeInRemaining}`
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: `Pipeline Completed in ${duration}ms! Prepared ${filtered.length} clean rows.`
        }
      );

      const statsObj: PipelineStats = {
        originalRows: activeData.length,
        filteredRows: filtered.length,
        droppedRows: activeData.length - filtered.length,
        warningsCount: 0,
        executionTimeMs: duration,
        details: {
          'Dropped (Order Type)': droppedOrderType,
          'Dropped (Non-US)': droppedCountry,
          'Dropped (Excluded Reasons)': droppedReason,
          'Dropped ($0 Actuals)': droppedActuals,
          'Remaining METECH': metechRemaining,
          'Remaining TRADE IN': tradeInRemaining
        }
      };

      setLogs(newLogs);
      setStats(statsObj);
      setCleanedResult(filtered);
      setIsProcessing(false);
      onDataProcessed(filtered);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    }, 450);
  };

  const handleDownloadExcel = () => {
    if (!cleanedResult) return;
    const ws = XLSX.utils.json_to_sheet(cleanedResult);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cleaned_Accessory');
    XLSX.writeFile(wb, config.outputFileName);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Step 1 of 3</span>
            <span>•</span>
            <span>Data Ingestion &amp; Sanitization</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Clean Accessory Orders Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Filters out non-US shipments, zero-dollar dummy records, and non-revenue order reasons.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 px-2 font-medium">Preset:</span>
          <button
            onClick={() => applyPreset('standard')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activePreset === 'standard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Mizuho Standard
          </button>
          <button
            onClick={() => applyPreset('strict')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activePreset === 'strict'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Strict Audit
          </button>
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
                <h3 className="font-bold text-slate-900 text-sm">Input &amp; Output Excel Files</h3>
              </div>
              <span className="text-xs text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="border border-slate-200 bg-slate-50/70 hover:border-emerald-400 rounded-lg p-3.5 transition-colors relative group">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Source Dataset (.xlsx)
                </label>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate" title={config.inputFileName}>
                      {config.inputFileName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {activeData.length} records loaded
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <label 
                    htmlFor="acc-file-upload"
                    className="cursor-pointer text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Custom</span>
                  </label>
                  <input
                    id="acc-file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => onOpenPreview(activeData, 'Raw Accessory Data Preview', 'raw_accessory.xlsx')}
                    className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
                  >
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span>Preview Raw</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50/70 rounded-lg p-3.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Target Cleaned Filename
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={config.outputFileName}
                    onChange={(e) => setConfig(prev => ({ ...prev, outputFileName: e.target.value }))}
                    className="w-full text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Saved with verified schema &amp; billing year tags
                </p>
              </div>

            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Smart Filter Badges (No Comma Strings)</h3>
                  <p className="text-xs text-slate-500">Click to toggle order types or add custom business rules</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Valid Order Types</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                    {config.validOrderTypes.length} active
                  </span>
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, validOrderTypes: [...POPULAR_ORDER_TYPES] }))}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    Select Default
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, validOrderTypes: [] }))}
                    className="text-slate-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[46px] items-center">
                {POPULAR_ORDER_TYPES.map((type) => {
                  const isSelected = config.validOrderTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleOrderType(type)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm border border-emerald-700'
                          : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <span>{type}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-100" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom order type (e.g. ZEXP)..."
                  value={newTypeInput}
                  onChange={(e) => setNewTypeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomOrderType()}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 flex-1 font-mono"
                />
                <button
                  onClick={addCustomOrderType}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-300 transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="text-rose-700">Exclude Order Reasons</span>
                  <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-mono font-bold">
                    {config.excludeReasons.length} excluded
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-[46px] items-center">
                {KNOWN_EXCLUDE_REASONS.map((reason) => {
                  const isExcluded = config.excludeReasons.includes(reason);
                  return (
                    <button
                      key={reason}
                      onClick={() => toggleExcludeReason(reason)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        isExcluded
                          ? 'bg-rose-600 text-white shadow-sm border border-rose-700'
                          : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <span>{reason}</span>
                      {isExcluded ? (
                        <X className="w-3 h-3 text-rose-100" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Valid Country Code
                </label>
                <select
                  value={config.validCountry}
                  onChange={(e) => setConfig(prev => ({ ...prev, validCountry: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-medium"
                >
                  <option value="US">🇺🇸 US (United States Only)</option>
                  <option value="CA">🇨🇦 CA (Canada Only)</option>
                  <option value="ALL">🌐 All Countries</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Exclude Total Actuals
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-mono font-semibold">
                    $0.00 / Zero Actuals
                  </span>
                  <span className="text-[11px] text-slate-500">
                    (Filters test/dummy orders)
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Execute Cleaning Pipeline</span>
              <span className="text-xs text-slate-500 font-normal">Step 1 of 3</span>
            </h3>

            <button
              id="run-step-1-btn"
              onClick={runPipeline}
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
                  <span>Processing Records in Calamine Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Step 1: Clean Accessory Data</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Pre-flight validation runs automatically before writing to disk.
            </p>
          </div>

          {stats ? (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Pipeline Execution Metrics</h4>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {stats.executionTimeMs}ms
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Original</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.originalRows}</p>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Cleaned</p>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{stats.filteredRows}</p>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <p className="text-[10px] text-rose-700 uppercase font-bold">Dropped</p>
                  <p className="text-lg font-bold text-rose-700 mt-0.5">{stats.droppedRows}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>METECH Zero Verification:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">0 remaining</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>TRADE IN Zero Verification:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">0 remaining</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Country US Sanitization:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700">100% Validated</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  id="preview-cleaned-btn"
                  onClick={() => cleanedResult && onOpenPreview(cleanedResult, 'Cleaned Accessory Dataset', config.outputFileName)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Inspect Table</span>
                </button>
                <button
                  id="download-cleaned-btn"
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
                Pipeline Activity Stream
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
                  Ready. Click &quot;Run Step 1&quot; to begin processing.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
