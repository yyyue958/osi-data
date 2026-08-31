import React, { useState } from 'react';
import { 
  PipelineExecutionLog, 
  PipelineStats 
} from '../../types';
import { 
  CheckCircle2, 
  Play, 
  FileSpreadsheet, 
  Download, 
  MapPin, 
  Sparkles,
  Upload
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const InstalledStateCleanerStep: React.FC = () => {
  // Store the raw file to send to the API, NOT the parsed data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputFileName, setInputFileName] = useState('No file selected');
  
  // Store the download link returned by the Python server
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<PipelineExecutionLog[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);

  // 1. FAST FILE UPLOAD: Just hold the file, don't read it into browser memory
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setInputFileName(file.name);
    setStats(null);
    setDownloadUrl(null);
    
    setLogs([
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Selected file: ${file.name}. Ready to send to Python backend for processing.`
      }
    ]);
  };

  // 2. BACKEND PROCESSING: Send to Python via API
  const runStateCleaning = async () => {
    if (!selectedFile) {
      setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), level: 'error', message: `❌ ERROR: Please upload a file first.` }]);
      return;
    }

    setIsProcessing(true);
    const startTime = performance.now();

    setLogs([
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Uploading ${inputFileName} to backend API...` },
      { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `Server is executing Pandas logic (Please wait)...` }
    ]);

    // Create a form data object to send the file securely
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Connect to the local Python FastAPI server
      const response = await fetch('http://127.0.0.1:8000/api/clean-installed-base', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Server processing failed');
      }

      const duration = Math.round(performance.now() - startTime);

      // Save the download URL returned by Python
      setDownloadUrl(`http://127.0.0.1:8000${result.download_url}`);

      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), level: 'info', message: `----------------------------------------\nTotal original rows:       ${result.total_rows}\nFinal usable rows:         ${result.matched_rows}\nRows excluded/dropped:     ${result.excluded_rows}\n----------------------------------------` },
        { timestamp: new Date().toLocaleTimeString(), level: 'success', message: `✅ Pipeline Complete! Output generated in ${duration}ms.` }
      ]);

      setStats({
        originalRows: result.total_rows,
        filteredRows: result.matched_rows,
        droppedRows: result.excluded_rows,
        warningsCount: result.excluded_rows,
        executionTimeMs: duration,
        details: {
          'Cleaned Matched Rows': result.matched_rows,
          'Excluded/Dropped Rows': result.excluded_rows
        }
      });

    } catch (err) {
      setLogs(prev => [
        ...prev,
        { timestamp: new Date().toLocaleTimeString(), level: 'error', message: `❌ API ERROR: Ensure your Python backend (server.py) is running on port 8000.\nDetails: ${String(err)}` }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. SECURE DOWNLOAD: Open the link provided by Python
  const handleDownloadMultiSheetExcel = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Step 3 of 3</span>
            <span>•</span>
            <span>API Accelerated Processing</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Installed Base State Cleaning (Backend)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bypasses browser memory limits by streaming heavy files directly to the Python Pandas backend.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-slate-700 font-medium">
            Backend Dictionary Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">1</div>
                <h3 className="font-bold text-slate-900 text-sm">Source Upload (No Limits)</h3>
              </div>
            </div>

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
                    {selectedFile ? 'Ready to send to server' : 'Awaiting file'}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <label 
                  htmlFor="installed-file-upload"
                  className="cursor-pointer text-[11px] font-semibold text-white hover:bg-emerald-700 flex items-center gap-1 bg-emerald-600 px-3 py-1.5 rounded-md shadow-sm transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Browse Massive Excel File</span>
                </label>
                <input
                  id="installed-file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Execute Backend Pipeline</span>
            </h3>

            <button
              id="run-step-3-btn"
              onClick={runStateCleaning}
              disabled={isProcessing || !selectedFile}
              className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-sm ${
                isProcessing || !selectedFile
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing on Server...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Send to API for Cleaning</span>
                </>
              )}
            </button>
          </div>

          {stats && downloadUrl && (
            <div className="bg-white border border-emerald-300 rounded-xl p-5 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Server Processing Summary</h4>
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
                <button
                  onClick={handleDownloadMultiSheetExcel}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Multi-Sheet Output from Server</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">
                Server Activity Stream
              </span>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear Log
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 pt-2">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] whitespace-pre-wrap leading-relaxed">
                    {!log.message.includes('---') && <span className="text-slate-500 select-none shrink-0">[{log.timestamp}]</span>}
                    <span
                      className={
                        log.level === 'success' ? 'text-emerald-400 font-semibold'
                        : log.level === 'warn' ? 'text-amber-400'
                        : log.level === 'error' ? 'text-rose-400 font-semibold'
                        : 'text-slate-300'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 py-4 text-center text-xs">
                  Ready. Please select a file.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
