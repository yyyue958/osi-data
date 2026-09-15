import React, { useState } from 'react';
import { ConsolidatedHospitalRow } from '../../types';
import { 
  Building2, 
  Play, 
  FileSpreadsheet, 
  ChevronRight, 
  Terminal, 
  Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';

interface LocationConsolidationStepProps {
  onOpenPreview: (data: any[], title: string, filename: string) => void;
  onDataUpdated?: (data: ConsolidatedHospitalRow[]) => void;
}

export const LocationConsolidationStep: React.FC<LocationConsolidationStepProps> = ({
  onDataUpdated
}) => {
  const [subTab, setSubTab] = useState<'proc' | 'ib' | 'acc' | 'master'>('proc');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Select a tab to begin processing data.']);

  // File States
  const [phFiles, setPhFiles] = useState<File[]>([]);
  const [ibFile, setIbFile] = useState<File | null>(null);
  const [accFile, setAccFile] = useState<File | null>(null);
  const [masterAccFile, setMasterAccFile] = useState<File | null>(null);
  const [masterIbFile, setMasterIbFile] = useState<File | null>(null);

  const logMsg = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

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

  const exportExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
    if (!data || data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
  };

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
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err)
      });
    });
  };

  // Helper for safe string parsing to match Pandas `.fillna("").astype(str)`
  const getVal = (v: any) => v === undefined || v === null ? "" : String(v).trim();

  // ==========================================
  // TAB 1: PROCEDURE HOSPITAL CONSOLIDATION
  // ==========================================
  const runProcedureHospital = async () => {
    if (phFiles.length === 0) {
      logMsg('❌ ERROR: Please upload at least one CSV file.');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    logMsg(`🚀 Initializing Procedure Hospital Consolidation...`);
    logMsg(`Loading data from ${phFiles.length} file(s)...`);

    try {
      let combinedData: any[] = [];
      const keepCols = ["HOSPITAL_NAME", "ADDRESSLINE1", "ADDRESSLINE2", "CITY", "STATE", "ZIP_CODE", "DEFINITIVE_ID"];

      for (const file of phFiles) {
        logMsg(`Reading: ${file.name}...`);
        const data = await readCSVFile(file);
        
        const filtered = data.map((row: any) => {
          const newRow: any = {};
          keepCols.forEach(col => {
            newRow[col] = getVal(row[col]);
          });
          return newRow;
        });
        combinedData = combinedData.concat(filtered);
      }

      const initialRows = combinedData.length;
      logMsg(`Total rows loaded across all years: ${initialRows}`);
      logMsg('Cleaning missing text data & building address columns...');

      combinedData = combinedData.map(row => {
        const hName = row["HOSPITAL_NAME"];
        const add1 = row["ADDRESSLINE1"];
        const add2 = row["ADDRESSLINE2"];
        
        const hospAddRaw = `${hName}, ${add1}, ${add2}`;
        row["Hospital + Address"] = hospAddRaw.replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim();
        
        const streetRaw = `${add1} ${add2}`;
        row["street address"] = streetRaw.replace(/\s+/g, ' ').trim();
        
        return row;
      });

      logMsg('Checking for duplicate DEFINITIVE_IDs...');
      const seen = new Set();
      const finalData = [];
      let duplicateCount = 0;

      for (const row of combinedData) {
        const id = row["DEFINITIVE_ID"];
        if (!seen.has(id)) {
          seen.add(id);
          finalData.push(row);
        } else {
          duplicateCount++;
        }
      }

      logMsg('Saving master dataset to CSV...');
      downloadCSV(finalData, 'Procedure_Hospital_Addresses_Combined_Master_List.csv');

      logMsg('---------------------------------------------');
      logMsg(`Total rows combined:   ${initialRows}`);
      logMsg(`Duplicates removed:    ${duplicateCount}`);
      logMsg(`Final unique rows:     ${finalData.length}`);
      logMsg('---------------------------------------------');
      logMsg('✅ Success! Procedure Hospital master list generated.');
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });

    } catch (err: any) {
      logMsg(`❌ ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // TAB 2: INSTALLED BASE CONSOLIDATION
  // ==========================================
  const runInstalledBase = async () => {
    if (!ibFile) {
      logMsg('❌ ERROR: Please upload the Installed Base file.');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    logMsg(`🚀 Initializing Installed Base Consolidation...`);
    logMsg(`Loading data from ${ibFile.name}...`);

    try {
      const data = ibFile.name.toLowerCase().endsWith('.csv')
        ? await readCSVFile(ibFile)
        : await readExcelFile(ibFile);

      const initialRows = data.length;
      const keepCols = ["Location Name", "Location Street", "Location City", "Location State", "Location Zip", "Account Number"];
      const firstRow = data[0] || {};
      const missingCols = keepCols.filter(col => !(col in firstRow));
      
      if (missingCols.length > 0) {
        throw new Error(`Columns missing from input file:\n${missingCols.join(', ')}`);
      }

      logMsg('Consolidating duplicates and preserving extra Account Numbers...');
      
      const grouped: Record<string, any> = {};
      data.forEach(row => {
        const hName = getVal(row["Location Name"]);
        const street = getVal(row["Location Street"]);
        const combinedAddress = `${hName}, ${street}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim();

        const key = `${combinedAddress}|${hName}|${street}|${getVal(row["Location City"])}|${getVal(row["Location State"])}|${getVal(row["Location Zip"])}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            "Hospital + Address": combinedAddress,
            "Location Name": hName,
            "Location Street": street,
            "Location City": getVal(row["Location City"]),
            "Location State": getVal(row["Location State"]),
            "Location Zip": getVal(row["Location Zip"]),
            accounts: new Set<string>()
          };
        }

        const acc = getVal(row["Account Number"]);
        if (acc && acc.toLowerCase() !== "nan" && acc.toLowerCase() !== "none") {
          grouped[key].accounts.add(acc);
        }
      });

      // PANDAS EMULATION PASS 1: Calculate global maximum accounts across entire dataframe
      let maxAccounts = 0;
      Object.values(grouped).forEach(group => {
        maxAccounts = Math.max(maxAccounts, group.accounts.size);
      });

      // PANDAS EMULATION PASS 2: Explicitly build every column for every row to guarantee SheetJS headers
      const finalData = Object.values(grouped).map(group => {
        const row: any = {};
        row["Hospital + Address"] = group["Hospital + Address"];
        row["Location Name"] = group["Location Name"];
        row["Location Street"] = group["Location Street"];
        row["Location City"] = group["Location City"];
        row["Location State"] = group["Location State"];
        row["Location Zip"] = group["Location Zip"];
        
        const accountsArray = Array.from(group.accounts) as string[];
        
        for (let i = 0; i < Math.max(1, maxAccounts); i++) {
          const colName = i === 0 ? "Account Number" : `Account Number ${i + 1}`;
          row[colName] = accountsArray[i] || "";
        }
        
        return row;
      });

      logMsg('Generating Excel output...');
      exportExcel(finalData, 'installed_base_location_combined_unique version 2.xlsx', 'Location_Summary');

      logMsg('---------------------------------------------');
      logMsg(`Total original rows:            ${initialRows}`);
      logMsg(`Final unique locations:         ${finalData.length}`);
      logMsg(`Duplicates consolidated:        ${initialRows - finalData.length}`);
      logMsg(`Max Account Numbers for 1 site: ${maxAccounts}`);
      logMsg('---------------------------------------------');
      logMsg('✅ Pipeline Complete!');
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });

    } catch (err: any) {
      logMsg(`❌ ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // TAB 3: ACCESSORY CONSOLIDATION
  // ==========================================
  const runAccessory = async () => {
    if (!accFile) {
      logMsg('❌ ERROR: Please upload the Accessory file.');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    logMsg(`🚀 Initializing Accessory Hospital Consolidation...`);
    logMsg(`Loading data from ${accFile.name}...`);

    try {
      const data = accFile.name.toLowerCase().endsWith('.csv')
        ? await readCSVFile(accFile)
        : await readExcelFile(accFile);

      const initialRows = data.length;
      const keepCols = ["ShipTo Name", "ShipTo Street", "ShipTo City", "ShipTo PostalCode", "ShipTo Region", "ShipToID"];
      const firstRow = data[0] || {};
      const missingCols = keepCols.filter(col => !(col in firstRow));
      
      if (missingCols.length > 0) {
        throw new Error(`Columns missing from input file:\n${missingCols.join(', ')}`);
      }

      logMsg('Consolidating duplicates and preserving extra ShipTo IDs...');
      
      const grouped: Record<string, any> = {};
      data.forEach(row => {
        const sName = getVal(row["ShipTo Name"]);
        const street = getVal(row["ShipTo Street"]);
        const combinedAddress = `${sName}, ${street}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim();

        const key = `${combinedAddress}|${sName}|${street}|${getVal(row["ShipTo City"])}|${getVal(row["ShipTo Region"])}|${getVal(row["ShipTo PostalCode"])}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            "Hospital + Address": combinedAddress,
            "ShipTo Name": sName,
            "ShipTo Street": street,
            "ShipTo City": getVal(row["ShipTo City"]),
            "ShipTo Region": getVal(row["ShipTo Region"]),
            "ShipTo PostalCode": getVal(row["ShipTo PostalCode"]),
            shipTos: new Set<string>()
          };
        }

        const sid = getVal(row["ShipToID"]);
        if (sid && sid.toLowerCase() !== "nan" && sid.toLowerCase() !== "none") {
          grouped[key].shipTos.add(sid);
        }
      });

      // PANDAS EMULATION PASS 1: Calculate global maximum
      let maxShipTos = 0;
      Object.values(grouped).forEach(group => {
        maxShipTos = Math.max(maxShipTos, group.shipTos.size);
      });

      // PANDAS EMULATION PASS 2: Explicitly build every column
      const finalData = Object.values(grouped).map(group => {
        const row: any = {};
        row["Hospital + Address"] = group["Hospital + Address"];
        row["ShipTo Name"] = group["ShipTo Name"];
        row["ShipTo Street"] = group["ShipTo Street"];
        row["ShipTo City"] = group["ShipTo City"];
        row["ShipTo Region"] = group["ShipTo Region"];
        row["ShipTo PostalCode"] = group["ShipTo PostalCode"];
        
        const idsArray = Array.from(group.shipTos) as string[];
        
        for (let i = 0; i < Math.max(1, maxShipTos); i++) {
          const colName = i === 0 ? "ShipToID" : `ShipToID ${i + 1}`;
          row[colName] = idsArray[i] || "";
        }
        
        return row;
      });

      logMsg('Generating Excel output...');
      exportExcel(finalData, 'accesary_location_combined_unique VERSION 2.xlsx', 'ShipTo_Summary');

      logMsg('---------------------------------------------');
      logMsg(`Total original rows:            ${initialRows}`);
      logMsg(`Final unique locations:         ${finalData.length}`);
      logMsg(`Duplicates consolidated:        ${initialRows - finalData.length}`);
      logMsg(`Max ShipTo IDs for 1 site:      ${maxShipTos}`);
      logMsg('---------------------------------------------');
      logMsg('✅ Pipeline Complete!');
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });

    } catch (err: any) {
      logMsg(`❌ ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // TAB 4: MASTER COMBINER
  // ==========================================
  const runMasterCombiner = async () => {
    if (!masterAccFile || !masterIbFile) {
      logMsg('❌ ERROR: Please upload BOTH Accessory and Installed Base files.');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    logMsg(`🚀 Initializing Master Hospital Combiner...`);
    
    try {
      logMsg(`Loading Accessory Data...`);
      const dataAcc = masterAccFile.name.toLowerCase().endsWith('.csv') 
        ? await readCSVFile(masterAccFile) 
        : await readExcelFile(masterAccFile);
        
      logMsg(`Loading Installed Base Data...`);
      const dataIb = masterIbFile.name.toLowerCase().endsWith('.csv') 
        ? await readCSVFile(masterIbFile) 
        : await readExcelFile(masterIbFile);

      logMsg('Normalizing column schemas across both datasets...');
      
      const extractIds = (row: any, keyword: string) => {
        return Object.keys(row)
          .filter(k => k.includes(keyword) && row[k] !== undefined && row[k] !== null)
          .map(k => {
            let val = String(row[k]).trim();
            if (val.endsWith('.0')) val = val.substring(0, val.length - 2);
            return val;
          })
          .filter(val => val !== "" && val.toLowerCase() !== "nan" && val.toLowerCase() !== "none");
      };

      const normalizedAcc = dataAcc.map(r => ({
        "Location Name": getVal(r["ShipTo Name"] || r["Location Name"]),
        "Location Street": getVal(r["ShipTo Street"] || r["Location Street"]),
        "Hospital + Address": getVal(r["Hospital + Address"]),
        "City": getVal(r["ShipTo City"] || r["City"]),
        "State": getVal(r["ShipTo Region"] || r["State"]),
        "Zip": getVal(r["ShipTo PostalCode"] || r["Zip"]),
        "Extracted_IDs": extractIds(r, 'ShipToID')
      }));

      const normalizedIb = dataIb.map(r => ({
        "Location Name": getVal(r["Location Name"]),
        "Location Street": getVal(r["Location Street"]),
        "Hospital + Address": getVal(r["Hospital + Address"]),
        "City": getVal(r["Location City"] || r["City"]),
        "State": getVal(r["Location State"] || r["State"]),
        "Zip": getVal(r["Location Zip"] || r["Zip"]),
        "Extracted_IDs": extractIds(r, 'Account Number')
      }));

      logMsg('Combining datasets...');
      const combined = [...normalizedAcc, ...normalizedIb];
      const initialRows = combined.length;

      logMsg('Grouping identical hospital locations across datasets...');
      const grouped: Record<string, any> = {};
      
      combined.forEach(row => {
        const key = `${row["Location Name"]}|${row["Location Street"]}|${row["Hospital + Address"]}|${row["City"]}|${row["State"]}|${row["Zip"]}`;
        if (!grouped[key]) {
          grouped[key] = {
            "Location Name": row["Location Name"],
            "Location Street": row["Location Street"],
            "Hospital + Address": row["Hospital + Address"],
            "City": row["City"],
            "State": row["State"],
            "Zip": row["Zip"],
            allIds: new Set<string>()
          };
        }
        
        row.Extracted_IDs.forEach((id: string) => {
          grouped[key].allIds.add(id);
        });
      });

      // PANDAS EMULATION PASS 1: Calculate global maximum
      let maxIds = 0;
      Object.values(grouped).forEach((g: any) => {
        maxIds = Math.max(maxIds, g.allIds.size);
      });

      // PANDAS EMULATION PASS 2: Explicitly build every column
      const finalData = Object.values(grouped).map((group: any) => {
        const row: any = {};
        row["Location Name"] = group["Location Name"];
        row["Location Street"] = group["Location Street"];
        row["Hospital + Address"] = group["Hospital + Address"];
        row["City"] = group["City"];
        row["State"] = group["State"];
        row["Zip"] = group["Zip"];
        
        const idArray = Array.from(group.allIds) as string[];
        
        for (let i = 0; i < Math.max(1, maxIds); i++) {
          const colName = i === 0 ? "ID" : `ID ${i + 1}`;
          row[colName] = idArray[i] || "";
        }
        
        return row;
      });

      logMsg('Generating master hospital location Excel catalog...');
      exportExcel(finalData, 'Master_Hospital_Location_List VERSION 2.xlsx');

      if (onDataUpdated) {
        onDataUpdated(finalData);
      }

      logMsg('---------------------------------------------');
      logMsg(`Accessory rows:                 ${dataAcc.length}`);
      logMsg(`Installed Base rows:            ${dataIb.length}`);
      logMsg(`Total rows before dedupe:       ${initialRows}`);
      logMsg(`Final completely unique rows:   ${finalData.length}`);
      logMsg(`Duplicates merged into 1 row:   ${initialRows - finalData.length}`);
      logMsg(`Max IDs for a single hospital:  ${maxIds}`);
      logMsg('---------------------------------------------');
      logMsg('✅ Success! Master list generated completely.');
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });

    } catch (err: any) {
      logMsg(`❌ ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = () => {
    if (isProcessing) return "Processing locally...";
    if (subTab === 'proc') return "Run Combine & Clean";
    if (subTab === 'ib') return "Run Location Combiner";
    if (subTab === 'acc') return "Run Location Combiner";
    return "Run Master Combiner";
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>App 2: Master Location Consolidation Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hospital Location Aggregator &amp; Multi-ID Pooler
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Fully operational equivalent to the Python Tkinter Suite. Combines, cleans, deduplicates, and pools records natively in the browser via CSV/Excel streaming.
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'proc', label: '1. Procedure Hospital Consolidation' },
          { id: 'ib', label: '2. Installed Base Consolidation' },
          { id: 'acc', label: '3. Accessory Consolidation' },
          { id: 'master', label: '4. Master Combiner (Output)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSubTab(tab.id as any); setLogs(['Ready.']); }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              subTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid View for Current Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Inputs & Action */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Input Configuration</span>
              </h3>
            </div>

            {/* Render file inputs dynamically based on tab */}
            <div className="space-y-4">
              {subTab === 'proc' && (
                <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Input CSV Files (Multiple allowed)</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select Files</span>
                      <input type="file" accept=".csv" multiple onChange={(e) => setPhFiles(Array.from(e.target.files || []))} className="hidden" />
                    </label>
                    <span className="text-xs font-mono text-slate-600">{phFiles.length > 0 ? `${phFiles.length} files selected` : 'None selected'}</span>
                  </div>
                </div>
              )}

              {subTab === 'ib' && (
                <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Installed Base Cleaned File (.xlsx, .csv)</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select File</span>
                      <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setIbFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                    <span className="text-xs font-mono text-slate-600 truncate">{ibFile ? ibFile.name : 'None selected'}</span>
                  </div>
                </div>
              )}

              {subTab === 'acc' && (
                <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Accessory Cleaned File (.xlsx, .csv)</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select File</span>
                      <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setAccFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                    <span className="text-xs font-mono text-slate-600 truncate">{accFile ? accFile.name : 'None selected'}</span>
                  </div>
                </div>
              )}

              {subTab === 'master' && (
                <>
                  <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Consolidated Accessory File</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Select File</span>
                        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setMasterAccFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                      <span className="text-xs font-mono text-slate-600 truncate max-w-[200px]">{masterAccFile ? masterAccFile.name : 'None'}</span>
                    </div>
                  </div>
                  <div className="border border-slate-200 bg-slate-50 rounded-lg p-3.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Consolidated Installed Base File</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Select File</span>
                        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setMasterIbFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                      <span className="text-xs font-mono text-slate-600 truncate max-w-[200px]">{masterIbFile ? masterIbFile.name : 'None'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between pb-2 border-b border-slate-100">
              <span>Execute Pipeline</span>
            </h3>
            <button
              onClick={() => {
                if (subTab === 'proc') runProcedureHospital();
                if (subTab === 'ib') runInstalledBase();
                if (subTab === 'acc') runAccessory();
                if (subTab === 'master') runMasterCombiner();
              }}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-sm ${
                isProcessing ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
              }`}
            >
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>{getButtonText()}</span></>
              ) : (
                <><Play className="w-4 h-4 fill-white" /><span>{getButtonText()}</span></>
              )}
            </button>
            <p className="text-[11px] text-slate-500 text-center">Output will automatically trigger a file download upon completion.</p>
          </div>

          {subTab === 'master' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Cross-System Schema Normalization</h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white rounded border border-emerald-100 flex items-center justify-between">
                  <span className="font-mono text-slate-600">ShipTo Name / Location Name</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold font-mono text-emerald-800">Location Name</span>
                </div>
                <div className="p-2.5 bg-white rounded border border-emerald-100 flex items-center justify-between">
                  <span className="font-mono text-slate-600">ShipTo Region / Location State</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold font-mono text-emerald-800">State</span>
                </div>
                <div className="p-2.5 bg-white rounded border border-emerald-100 flex items-center justify-between">
                  <span className="font-mono text-slate-600">Account Number + ShipToID</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold font-mono text-emerald-800">ID 1, ID 2... ID N</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Terminal Logger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3 h-full min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Execution Console</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                browser-native
              </span>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 space-y-1.5 p-2 bg-slate-950/70 rounded-lg">
              {logs.map((log, i) => (
                <p key={i} className={
                  log.includes('✅') ? 'text-emerald-400 font-bold' 
                  : log.includes('❌') ? 'text-rose-400 font-bold' 
                  : log.includes('🚀') ? 'text-blue-400 font-bold' 
                  : 'text-slate-400'
                }>
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
