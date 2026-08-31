import React, { useState } from 'react';
import { WaterfallMatchedResultRow } from '../../types';
import { 
  GitPullRequest, 
  CheckCircle2, 
  Play, 
  Eye, 
  Sliders, 
  Terminal, 
  ShieldCheck,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';

interface WaterfallMatcherStepProps {
  onOpenPreview: (data: any[], title: string, filename: string) => void;
  onDataUpdated?: (data: WaterfallMatchedResultRow[]) => void;
}

const WATERFALL_STEPS_CONFIG = [
  { id: 0, label: 'Step 1: Exact Street + Exact City', desc: 'Strict identical match on standardized street and city.' },
  { id: 1, label: 'Step 2: First 15 Chars Street + City', desc: 'Fuzzy match on street prefix + exact city.' },
  { id: 2, label: 'Step 3: First 12 Chars Street + City', desc: 'Looser match on street prefix + exact city.' },
  { id: 3, label: 'Step 4: Exact Street + Exact Zip Code', desc: 'Strict identical match on standardized street and ZIP.' },
  { id: 4, label: 'Step 5: First 15 Chars Street + Zip Code', desc: 'Fuzzy match on street prefix + exact ZIP.' },
  { id: 5, label: 'Step 6: First 12 Chars Street + Zip Code', desc: 'Looser match on street prefix + exact ZIP.' },
  { id: 6, label: 'Step 7: First 2 Words Street + Zip Code', desc: 'Word-based street prefix + exact ZIP.' },
  { id: 7, label: 'Step 8: Exact Hospital Name + Zip Code', desc: 'Strict identical match on facility name + exact ZIP.' },
  { id: 8, label: 'Step 9: First 2 Words Name + Zip Code', desc: 'Fuzzy name prefix + exact ZIP code. (Loosest)' }
];

const STANDARD_ADDRESS_REPLACEMENTS: Record<string, string> = {
  '\\bSTREET\\b': 'ST', '\\bSUITE\\b': 'STE', '\\bAVENUE\\b': 'AVE',
  '\\bROAD\\b': 'RD', '\\bBOULEVARD\\b': 'BLVD', '\\bDRIVE\\b': 'DR',
  '\\bCOURT\\b': 'CT', '\\bPARKWAY\\b': 'PKWY', '\\bHIGHWAY\\b': 'HWY',
  '\\bBUILDING\\b': 'BLDG', '\\bAPARTMENT\\b': 'APT', '\\bROOM\\b': 'RM',
  '\\bFLOOR\\b': 'FL', '\\bNORTH\\b': 'N', '\\bSOUTH\\b': 'S',
  '\\bEAST\\b': 'E', '\\bWEST\\b': 'W'
};

export const WaterfallMatcherStep: React.FC<WaterfallMatcherStepProps> = ({
  onOpenPreview,
  onDataUpdated
}) => {
  const [enabledSteps, setEnabledSteps] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>(['System ready. Waiting for files to begin 9-tier cascading waterfall matcher.']);

  // File States
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [procedureFile, setProcedureFile] = useState<File | null>(null);

  const [stats, setStats] = useState<{
    totalExcel: number;
    totalIds: number;
    matched: number;
    unmatched: number;
    exactMatches: number;
    looseMatches: number;
  } | null>(null);

  const [matchedResults, setMatchedResults] = useState<any[] | null>(null);

  const logMsg = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const toggleStep = (id: number) => {
    if (enabledSteps.includes(id)) {
      setEnabledSteps(enabledSteps.filter(s => s !== id));
    } else {
      setEnabledSteps([...enabledSteps, id].sort((a, b) => a - b));
    }
  };

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

  // --- TEXT CLEANERS ---
  const cleanStreetText = (str: string) => {
    if (!str) return '';
    let cleaned = String(str).toUpperCase().replace(/#/g, 'STE ');
    for (const [old, replace] of Object.entries(STANDARD_ADDRESS_REPLACEMENTS)) {
      cleaned = cleaned.replace(new RegExp(old, 'g'), replace);
    }
    return cleaned.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  };

  const cleanNameText = (str: string) => {
    if (!str) return '';
    return String(str).toUpperCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  };

  const cleanZip = (str: string) => {
    if (!str) return '';
    return String(str).replace(/\.0$/, '').split('-')[0].replace(/\D/g, '').padStart(5, '0').slice(0, 5);
  };

  const getFirst2Words = (str: string) => str ? str.split(/\s+/).slice(0, 2).join(' ') : '';

  // --- WATERFALL MATCHING ENGINE ---
  const handleRunWaterfall = async () => {
    if (!masterFile || !procedureFile) {
      logMsg('❌ ERROR: Please upload both Master Hospital File and Combined Procedures File.');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    logMsg(`🚀 Initiating 9-Step Procedure Waterfall Matcher...`);

    try {
      logMsg('Loading datasets (this may take a moment)...');
      
      const dfMaster = masterFile.name.toLowerCase().endsWith('.csv') 
        ? await readCSVFile(masterFile) 
        : await readExcelFile(masterFile);
      
      const dfCsv = await readCSVFile(procedureFile);

      // --- STEP 1: POOL IDS ---
      logMsg('Pooling all unique IDs from the Master file...');
      const masterCols = Object.keys(dfMaster[0] || {});
      const idCols = masterCols.filter(c => c.toUpperCase().includes('ID') || c.toUpperCase().includes('ACCOUNT'));

      const allUniqueIdsGlobal = new Set<string>();

      dfMaster.forEach(row => {
        const uniqueIds = new Set<string>();
        idCols.forEach(col => {
          const val = row[col];
          if (val !== undefined && val !== null) {
            const cleanVal = String(val).replace(/\.0$/, '').trim();
            if (cleanVal && !['nan', 'none', ''].includes(cleanVal.toLowerCase())) {
              uniqueIds.add(cleanVal);
              allUniqueIdsGlobal.add(cleanVal);
            }
          }
        });
        const idsArray = Array.from(uniqueIds);
        row.All_IDs_List = idsArray;
        row.Combined_ID = idsArray.join(', ');
      });

      logMsg('-------------------------------------------------------');
      logMsg(`VERIFICATION: Found ${allUniqueIdsGlobal.size} absolutely unique IDs in the Excel file.`);
      logMsg('Because Excel is now the base file, ALL of these will be preserved.');
      logMsg('-------------------------------------------------------');

      // Identify Master Columns
      const masterCityCol = masterCols.find(c => ['City', 'Location City', 'ShipTo City', 'CITY'].includes(c));
      const masterZipCol = masterCols.find(c => ['Zip', 'Location Zip', 'ShipTo PostalCode', 'ZIP', 'PostalCode'].includes(c));
      const masterNameCol = masterCols.find(c => ['Location Name', 'ShipTo Name', 'Name', 'Hospital Name'].includes(c));
      const masterStreetCol = masterCols.find(c => ['Location Street', 'ShipTo Street', 'Street', 'Address'].includes(c));

      if (!masterCityCol || !masterZipCol || !masterNameCol || !masterStreetCol) {
         throw new Error(`Missing crucial columns in Master file. Found: City(${masterCityCol}), Zip(${masterZipCol}), Name(${masterNameCol}), Street(${masterStreetCol})`);
      }

      logMsg('Standardizing addresses, names, cities, and ZIP codes...');

      // Process Master Data
      dfMaster.forEach(row => {
        const street = cleanStreetText(row[masterStreetCol]);
        const name = cleanNameText(row[masterNameCol]);
        const city = String(row[masterCityCol] || '').toUpperCase().trim();
        const zip = cleanZip(row[masterZipCol]);
        
        const f2Street = getFirst2Words(street);
        const f2Name = getFirst2Words(name);

        row._keys = {
          Exact: `${street}|${city}`,
          City15: `${street.substring(0, 15)}|${city}`,
          City12: `${street.substring(0, 12)}|${city}`,
          ExactZip: `${street}|${zip}`,
          Zip15: `${street.substring(0, 15)}|${zip}`,
          Zip12: `${street.substring(0, 12)}|${zip}`,
          First2Zip: `${f2Street}|${zip}`,
          NameZip: `${name}|${zip}`,
          FuzzyNameZip: `${f2Name}|${zip}`
        };
      });

      // Process Procedures Data
      const dictExact = new Map();
      const dict15City = new Map();
      const dict12City = new Map();
      const dictExactZip = new Map();
      const dict15Zip = new Map();
      const dict12Zip = new Map();
      const dictFirst2Zip = new Map();
      const dictNameZip = new Map();
      const dictFuzzyNameZip = new Map();

      logMsg('Building matching dictionaries from Procedure CSV...');
      
      dfCsv.forEach(row => {
        const street = cleanStreetText(row["street address"] || row["ADDRESSLINE1"] || '');
        const name = cleanNameText(row["HOSPITAL_NAME"]);
        const city = String(row["CITY"] || '').toUpperCase().trim();
        const zip = cleanZip(row["ZIP_CODE"] || row["Zip"]);

        const f2Street = getFirst2Words(street);
        const f2Name = getFirst2Words(name);

        const keys = {
          Exact: `${street}|${city}`,
          City15: `${street.substring(0, 15)}|${city}`,
          City12: `${street.substring(0, 12)}|${city}`,
          ExactZip: `${street}|${zip}`,
          Zip15: `${street.substring(0, 15)}|${zip}`,
          Zip12: `${street.substring(0, 12)}|${zip}`,
          First2Zip: `${f2Street}|${zip}`,
          NameZip: `${name}|${zip}`,
          FuzzyNameZip: `${f2Name}|${zip}`
        };

        if (keys.Exact !== '|') dictExact.set(keys.Exact, row);
        if (keys.City15 !== '|') dict15City.set(keys.City15, row);
        if (keys.City12 !== '|') dict12City.set(keys.City12, row);
        if (keys.ExactZip !== '|') dictExactZip.set(keys.ExactZip, row);
        if (keys.Zip15 !== '|') dict15Zip.set(keys.Zip15, row);
        if (keys.Zip12 !== '|') dict12Zip.set(keys.Zip12, row);
        if (keys.First2Zip !== '|') dictFirst2Zip.set(keys.First2Zip, row);
        if (keys.NameZip !== '|') dictNameZip.set(keys.NameZip, row);
        if (keys.FuzzyNameZip !== '|') dictFuzzyNameZip.set(keys.FuzzyNameZip, row);
      });

      logMsg('Executing Waterfall Match with User Settings...');

      let exactMatchCount = 0;
      let looseMatchCount = 0;
      let unmatchedCount = 0;

      const finalDataset = dfMaster.map(mRow => {
        const keys = mRow._keys;
        let matchedProc = null;
        let matchType = "Unmatched";

        if (enabledSteps.includes(0) && dictExact.has(keys.Exact)) { matchedProc = dictExact.get(keys.Exact); matchType = "Exact Match"; }
        else if (enabledSteps.includes(1) && dict15City.has(keys.City15)) { matchedProc = dict15City.get(keys.City15); matchType = "15 Char + City"; }
        else if (enabledSteps.includes(2) && dict12City.has(keys.City12)) { matchedProc = dict12City.get(keys.City12); matchType = "12 Char + City"; }
        else if (enabledSteps.includes(3) && dictExactZip.has(keys.ExactZip)) { matchedProc = dictExactZip.get(keys.ExactZip); matchType = "Exact Street + Zip"; }
        else if (enabledSteps.includes(4) && dict15Zip.has(keys.Zip15)) { matchedProc = dict15Zip.get(keys.Zip15); matchType = "15 Char + Zip"; }
        else if (enabledSteps.includes(5) && dict12Zip.has(keys.Zip12)) { matchedProc = dict12Zip.get(keys.Zip12); matchType = "12 Char + Zip"; }
        else if (enabledSteps.includes(6) && dictFirst2Zip.has(keys.First2Zip)) { matchedProc = dictFirst2Zip.get(keys.First2Zip); matchType = "First 2 Words + Zip"; }
        else if (enabledSteps.includes(7) && dictNameZip.has(keys.NameZip)) { matchedProc = dictNameZip.get(keys.NameZip); matchType = "Name + Zip"; }
        else if (enabledSteps.includes(8) && dictFuzzyNameZip.has(keys.FuzzyNameZip)) { matchedProc = dictFuzzyNameZip.get(keys.FuzzyNameZip); matchType = "Fuzzy Name + Zip"; }

        if (matchType !== "Unmatched") {
          if (matchType === "Fuzzy Name + Zip") looseMatchCount++; else exactMatchCount++;
        } else {
          unmatchedCount++;
        }

        const mergedRow = { ...mRow, ...(matchedProc || {}) };
        
        mergedRow.Procedure_Match_Status = matchType;
        mergedRow.exact_match = (matchType !== "Fuzzy Name + Zip" && matchType !== "Unmatched") ? matchType : '';
        mergedRow.loose_match = (matchType === "Fuzzy Name + Zip") ? matchType : '';
        
        // Delete internal keys to keep output clean
        delete mergedRow._keys;
        delete mergedRow.All_IDs_List;

        return mergedRow;
      });

      logMsg('Assembling and saving final dataset...');
      downloadCSV(finalDataset, 'Master_Hospital_Matched_To_Procedures.csv');
      
      setStats({
        totalExcel: dfMaster.length,
        totalIds: allUniqueIdsGlobal.size,
        matched: dfMaster.length - unmatchedCount,
        unmatched: unmatchedCount,
        exactMatches: exactMatchCount,
        looseMatches: looseMatchCount
      });

      setMatchedResults(finalDataset);
      if (onDataUpdated) {
        onDataUpdated(finalDataset);
      }

      logMsg('--------------------------------------------------');
      logMsg(`Total Rows in output (Matches Excel Base): ${dfMaster.length}`);
      logMsg(`Total Unique IDs preserved:                  ${allUniqueIdsGlobal.size}`);
      logMsg(`Rows successfully matched to CSV:            ${dfMaster.length - unmatchedCount}`);
      logMsg(`Rows with NO CSV procedure match:            ${unmatchedCount}`);
      logMsg('--------------------------------------------------');
      logMsg('✅ Final Step Complete! Output saved.');
      
      confetti({ particleCount: 65, spread: 80, origin: { y: 0.8 } });

    } catch (err: any) {
      logMsg(`❌ ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <GitPullRequest className="w-4 h-4 text-emerald-600" />
            <span>App 3: Procedure Waterfall Matcher</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            9-Tier Address &amp; Name Cascading Matcher
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Fully mirrors the Python Pandas application. Normalizes address strings, pools all unique identifiers, and joins Master accounts to Procedure volumes using a 9-step cascading fuzzy match.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Inputs & Options */}
        <div className="lg:col-span-7 space-y-6">

          {/* File Upload Configuration */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>1. Select Files</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Master Hospital File (Excel/CSV)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select File</span>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setMasterFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <span className="text-xs font-mono text-slate-600 truncate">{masterFile ? masterFile.name : 'None selected'}</span>
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Combined Procedures File (CSV)</label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select File</span>
                    <input type="file" accept=".csv" onChange={(e) => setProcedureFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                  <span className="text-xs font-mono text-slate-600 truncate">{procedureFile ? procedureFile.name : 'None selected'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Waterfall Cascade Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>2. Match Accuracy Options ({enabledSteps.length}/9 Enabled)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnabledSteps([0, 1, 2, 3, 4, 5, 6, 7, 8])}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  Enable All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setEnabledSteps([0, 3, 7])}
                  className="text-[11px] font-semibold text-slate-600 hover:underline"
                >
                  Exact Only
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {WATERFALL_STEPS_CONFIG.map((step) => {
                const isExact = [0, 3, 7].includes(step.id);
                const isSelected = enabledSteps.includes(step.id);
                return (
                  <div
                    key={step.id}
                    onClick={() => toggleStep(step.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? isExact
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-blue-50/50 border-blue-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected 
                          ? isExact ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-400 bg-white'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{step.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded whitespace-nowrap ${
                      isExact ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isExact ? 'Exact Match' : 'Loose Match'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Results, KPIs & Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Execute Pipeline</span>
            </h3>
            <button
              onClick={handleRunWaterfall}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-sm ${
                isProcessing ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
              }`}
            >
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Executing Waterfall...</span></>
              ) : (
                <><Play className="w-4 h-4 fill-white" /><span>Run Waterfall Match</span></>
              )}
            </button>
          </div>
          
          {/* Matched Summary Card */}
          {stats && (
            <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Matching Yield Metrics</span>
                </h3>
                <button
                  onClick={() => onOpenPreview(matchedResults || [], 'Waterfall Matched Procedures', 'Matched_Procedures.csv')}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded border border-emerald-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Input Master Rows</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{stats.totalExcel}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Input Unique IDs</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{stats.totalIds}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Total Matched</p>
                  <p className="text-lg font-black text-emerald-700 mt-0.5">{stats.matched}</p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-[10px] font-bold text-rose-700 uppercase">Unmatched</p>
                  <p className="text-lg font-black text-rose-700 mt-0.5">{stats.unmatched}</p>
                </div>
              </div>
            </div>
          )}

          {/* Monospace Console */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3 h-64 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Waterfall Engine Console</span>
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
