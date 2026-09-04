import React, { useState } from 'react';
import { MarketReportRow } from '../../types';
import { 
  Database, 
  FileSpreadsheet, 
  Play, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  Check, 
  FileCheck,
  Upload,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';

interface DefinitiveIdMapperStepProps {
  onOpenPreview: (data: any[], title: string, filename: string) => void;
  onDataUpdated?: (data: MarketReportRow[]) => void;
}

export const DefinitiveIdMapperStep: React.FC<DefinitiveIdMapperStepProps> = ({
  onOpenPreview,
  onDataUpdated
}) => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFiles, setTargetFiles] = useState<File[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappedResults, setMappedResults] = useState<{name: string; data: any[]}[]>([]);
  const [logs, setLogs] = useState<string[]>([
    'Definitive ID & Market Report VLOOKUP Mapper initialized.',
    'Awaiting Source File and Target Datasets.'
  ]);

  const [stats, setStats] = useState<{
    sourceRows: number;
    colsPulled: string[];
    targetFilesCount: number;
    totalMappedRows: number;
  } | null>(null);

  const logMsg = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // --- DATA PARSERS ---
  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(buffer, { type: 'array' });
          const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { blankrows: false });
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const readCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, { header: true, skipEmptyLines: true, complete: (res) => resolve(res.data), error: (err) => reject(err) });
    });
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- VLOOKUP MAPPER LOGIC ---
  const handleRunMapper = async () => {
    if (!sourceFile) {
      logMsg('❌ ERROR: Please upload a Source File with IDs.');
      return;
    }
    if (targetFiles.length === 0) {
      logMsg('❌ ERROR: Please upload at least one Target Raw Dataset (CSV).');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    logMsg(`🚀 Starting Multi-Target Definitive ID Mapping...`);

    try {
      logMsg(`Loading the source dataset (${sourceFile.name})...`);
      const dfSource = sourceFile.name.toLowerCase().endsWith('.csv')
        ? await readCSVFile(sourceFile)
        : await readExcelFile(sourceFile);

      if (dfSource.length === 0) throw new Error("Source file is empty.");

      // 1. Define columns to pull (Combined_ID, ID, ID 2 ... ID 11)
      const desiredCols = ["Combined_ID", "ID"];
      for (let i = 2; i <= 11; i++) {
        desiredCols.push(`ID ${i}`);
      }

      const sourceKeys = Object.keys(dfSource[0] || {});
      if (!sourceKeys.includes("DEFINITIVE_ID")) {
        throw new Error("Source file is missing the 'DEFINITIVE_ID' column required for VLOOKUP.");
      }

      // 2. Determine which desired columns actually exist in the source
      const actualColsToPull = desiredCols.filter(col => sourceKeys.includes(col));
      
      logMsg(`Columns being mapped over:`);
      actualColsToPull.forEach(col => logMsg(` - ${col}`));

      // 3. Deduplicate Source to prevent row expansion (Build Hash Map)
      logMsg(`\nDeduplicating source IDs to prevent row expansion...`);
      const sourceLookup = new Map<string, any>();
      
      dfSource.forEach(row => {
        const defId = String(row["DEFINITIVE_ID"]).trim();
        if (defId && !['undefined', 'null', ''].includes(defId.toLowerCase()) && !sourceLookup.has(defId)) {
          const extract: any = {};
          actualColsToPull.forEach(col => {
            extract[col] = row[col];
          });
          sourceLookup.set(defId, extract);
        }
      });

      logMsg(`Built fast in-memory hash lookup map for ${sourceLookup.size} unique Definitive IDs.`);
      logMsg(`\nProcessing Target Files...`);
      logMsg(`============================================================`);

      const processedResults: {name: string, data: any[]}[] = [];
      let totalMappedRowsGlobal = 0;

      // 4. Loop through target files and perform VLOOKUP
      for (const targetFile of targetFiles) {
        logMsg(`Processing: ${targetFile.name}`);
        const dfTarget = await readCSVFile(targetFile);
        
        const dfMapped = dfTarget.map(row => {
          const defId = String(row["DEFINITIVE_ID"]).trim();
          const mappedData = sourceLookup.get(defId);
          
          const mergedRow: any = { ...row };
          
          // FIX: Pre-initialize ALL pulled columns to empty string so the CSV downloader registers them
          // even if the very first row in the file is Unmatched!
          actualColsToPull.forEach(col => {
            mergedRow[col] = '';
          });

          // Overwrite with actual mapped data if a match was found
          if (mappedData) {
            actualColsToPull.forEach(col => {
              mergedRow[col] = mappedData[col] !== undefined ? mappedData[col] : '';
            });
          }
          
          return mergedRow;
        });

        const newFileName = targetFile.name.replace(/\.[^/.]+$/, "") + "_Mapped.csv";
        
        // Save to state for preview
        processedResults.push({ name: newFileName, data: dfMapped });
        totalMappedRowsGlobal += dfMapped.length;

        // Trigger Download
        downloadCSV(dfMapped, newFileName);

        logMsg(`  -> Original Rows: ${dfTarget.length}`);
        logMsg(`  -> Mapped Rows:   ${dfMapped.length}`);
        logMsg(`  -> Saved to:      ${newFileName}`);
        logMsg(`------------------------------------------------------------`);
      }

      setMappedResults(processedResults);
      if (onDataUpdated && processedResults.length > 0) {
        onDataUpdated(processedResults[0].data as MarketReportRow[]);
      }

      setStats({
        sourceRows: sourceLookup.size,
        colsPulled: actualColsToPull,
        targetFilesCount: targetFiles.length,
        totalMappedRows: totalMappedRowsGlobal
      });

      logMsg(`\n✅ Success! All ${targetFiles.length} files have been mapped and downloaded to your computer.`);
      confetti({ particleCount: 65, spread: 80, origin: { y: 0.8 } });

    } catch (err: any) {
      logMsg(`❌ ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>App 4: Definitive ID &amp; TAM Market Report Mapper</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Multi-Target Market Report VLOOKUP Mapper
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Performs high-performance VLOOKUP joins across TAM Annual Market Reports, mapping Mizuho Combined IDs and pooled Account/ShipTo columns onto external market research datasets.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Inputs & Architecture (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* File Upload Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>1. Select Files for Mapping</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Batch VLOOKUP Ready
              </span>
            </div>

            <div className="space-y-4">
              <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Source File with IDs (Excel/CSV)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Source</span>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setSourceFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <span className="text-xs font-mono text-slate-600 truncate flex-1">{sourceFile ? sourceFile.name : 'The list you just created in Step 3'}</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Target TAM Market Reports (Select Multiple CSVs)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Targets</span>
                    <input type="file" accept=".csv" multiple onChange={(e) => setTargetFiles(Array.from(e.target.files || []))} className="hidden" />
                  </label>
                  <span className="text-xs font-mono text-slate-600 truncate flex-1">
                    {targetFiles.length > 0 ? `${targetFiles.length} files selected for batch mapping` : 'Select 2022, 2023, 2024 TAM files'}
                  </span>
                </div>
                
                {/* Visualizer for selected target files */}
                {targetFiles.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {targetFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="font-mono text-slate-700 truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VLOOKUP Architecture Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>VLOOKUP Join Specification</span>
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-800">Master Hospital File</span>
                  <span className="text-slate-500 font-bold">[DEFINITIVE_ID]</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold hidden sm:flex">
                  <span>1:1 LEFT JOIN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-800">TAM Market Report</span>
                  <span className="text-slate-500 font-bold">[DEFINITIVE_ID]</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Dynamic Appended Columns:</p>
                <p className="text-[10px] italic">The script will automatically detect and pull over any of these columns if they exist in your source file.</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Combined_ID', 'ID (Primary)', 'ID 2', 'ID 3', 'ID 4', '...', 'ID 11'].map((col, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-mono">
                      +{col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Enriched Results & Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Execute Pipeline</span>
            </h3>
            <button
              onClick={handleRunMapper}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-sm ${
                isProcessing ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
              }`}
            >
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Mapping Datasets...</span></>
              ) : (
                <><Play className="w-4 h-4 fill-white" /><span>Run VLOOKUP / Mapper</span></>
              )}
            </button>
            <p className="text-[11px] text-slate-500 text-center">Output will automatically trigger CSV downloads upon completion.</p>
          </div>
          
          {/* Output Inspection Card */}
          {stats && (
            <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Enriched Output Datasets</span>
                </h3>
                {mappedResults.length > 0 && (
                  <button
                    onClick={() => onOpenPreview(
                      mappedResults[0].data,
                      `Enriched Target: ${mappedResults[0].name}`,
                      mappedResults[0].name
                    )}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded border border-emerald-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Output</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Target Files</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{stats.targetFilesCount}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Cols Pulled</p>
                  <p className="text-lg font-black text-emerald-700 mt-0.5">+{stats.colsPulled.length}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Rows</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{stats.totalMappedRows}</p>
                </div>
              </div>
            </div>
          )}

          {/* Console Log */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3 h-72 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>TAM VLOOKUP Console</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                browser-native
              </span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1.5 p-2 bg-slate-950/70 rounded-lg">
              {logs.map((log, i) => (
                <p key={i} className={log.includes('✅') ? 'text-emerald-400 font-bold' : log.includes('❌') ? 'text-rose-400 font-bold' : log.includes('🚀') ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                  {log}
                </p>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
