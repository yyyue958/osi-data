import React, { useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ActiveView, AccessoryOrderRow, KneeProcedureRow, InstalledBaseRow } from './types';
import { 
  SAMPLE_ACCESSORY_DATA, 
  SAMPLE_KNEE_PROCEDURES_DATA, 
  SAMPLE_INSTALLED_BASE_DATA 
} from './data/sampleData';
import { Navbar } from './components/Navbar';
import { ModernSuite } from './components/ModernSuite/ModernSuite';
import { LegacySimulator } from './components/LegacySimulator';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [activeView, setActiveView] = useLocalStorage<ActiveView>('mizuho_active_view', 'modern-suite');
  
  // App-level datasets
  const [accessoryData, setAccessoryData] = useLocalStorage<AccessoryOrderRow[]>('mizuho_accessory_data', SAMPLE_ACCESSORY_DATA);
  const [kneeData, setKneeData] = useLocalStorage<KneeProcedureRow[]>('mizuho_knee_data', SAMPLE_KNEE_PROCEDURES_DATA);
  const [installedData, setInstalledData] = useLocalStorage<InstalledBaseRow[]>('mizuho_installed_data', SAMPLE_INSTALLED_BASE_DATA);

  // Smart file parser handles BOTH CSV and Excel
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    datasetType: 'accessory' | 'knee' | 'installed'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

    if (isExcel) {
      // 1. Process Excel Files
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = new Uint8Array(evt.target?.result as ArrayBuffer);
          const wb = XLSX.read(buffer, { type: 'array' });
          // blankrows: false prevents massive memory crashes on large Excel files
          const parsedRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { blankrows: false });
          
          if (datasetType === 'accessory') {
            setAccessoryData(parsedRows as AccessoryOrderRow[]);
          } else if (datasetType === 'knee') {
            setKneeData(parsedRows as KneeProcedureRow[]);
          } else if (datasetType === 'installed') {
            setInstalledData(parsedRows as InstalledBaseRow[]);
          }
          alert(`Successfully imported ${parsedRows.length.toLocaleString()} rows from Excel into ${datasetType} data!`);
        } catch (err: any) {
          alert(`Error parsing Excel file: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
      
    } else {
      // 2. Process CSV Files
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const parsedRows = results.data as any[];
          if (datasetType === 'accessory') {
            setAccessoryData(parsedRows as AccessoryOrderRow[]);
          } else if (datasetType === 'knee') {
            setKneeData(parsedRows as KneeProcedureRow[]);
          } else if (datasetType === 'installed') {
            setInstalledData(parsedRows as InstalledBaseRow[]);
          }
          alert(`Successfully imported ${parsedRows.length.toLocaleString()} rows from CSV into ${datasetType} data!`);
        },
        error: (err) => {
          alert(`Error parsing CSV file: ${err.message}`);
        }
      });
    }

    // Reset input so you can re-upload the same file if needed
    e.target.value = '';
  };

  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to reset all data back to the default samples?')) {
      localStorage.clear();
      setAccessoryData([...SAMPLE_ACCESSORY_DATA]);
      setKneeData([...SAMPLE_KNEE_PROCEDURES_DATA]);
      setInstalledData([...SAMPLE_INSTALLED_BASE_DATA]);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onResetDemoData={handleResetDemoData}
      />

      {/* CSV/Excel Import Banner */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-end gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded shadow transition font-medium">
              Upload Accessory (Excel/CSV)
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'accessory')}
              />
            </label>

            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded shadow transition font-medium">
              Upload Knee (Excel/CSV)
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'knee')}
              />
            </label>

            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded shadow transition font-medium">
              Upload Installed Base (Excel/CSV)
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'installed')}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'modern-suite' && (
          <ModernSuite
            accessoryData={accessoryData}
            kneeData={kneeData}
            installedData={installedData}
          />
        )}

        {activeView === 'legacy-comparison' && <LegacySimulator />}
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Mizuho OSI Data Processing Suite</p>
        </div>
      </footer>
    </div>
  );
}
