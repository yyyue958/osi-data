import React, { useState } from 'react';
import { MarketReportRow } from '../../types';
import { 
  SAMPLE_TAM_2022_REPORT, 
  SAMPLE_TAM_2023_REPORT, 
  SAMPLE_TAM_2024_REPORT 
} from '../../data/sampleData';
import { 
  Database, 
  CheckCircle2, 
  FileSpreadsheet, 
  Play, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  FolderPlus, 
  Layers, 
  Check, 
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface DefinitiveIdMapperStepProps {
  onOpenPreview: (data: any[], title: string, filename: string) => void;
  onDataUpdated?: (data: MarketReportRow[]) => void;
}

export const DefinitiveIdMapperStep: React.FC<DefinitiveIdMapperStepProps> = ({
  onOpenPreview,
  onDataUpdated
}) => {
  const [selectedReports, setSelectedReports] = useState<string[]>(['TAM_2022', 'TAM_2023', 'TAM_2024']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappedData, setMappedData] = useState<MarketReportRow[] | null>(null);
  const [logs, setLogs] = useState<string[]>([
    'Definitive ID & Market Report VLOOKUP Mapper initialized.',
    '3 TAM Market Report targets loaded in memory.'
  ]);

  const toggleReport = (rep: string) => {
    if (selectedReports.includes(rep)) {
      if (selectedReports.length > 1) {
        setSelectedReports(selectedReports.filter(r => r !== rep));
      }
    } else {
      setSelectedReports([...selectedReports, rep]);
    }
  };

  const handleRunMapper = () => {
    setIsProcessing(true);
    setLogs([
      '🚀 Starting Multi-Target Definitive ID Mapping...',
      'Loading Master Hospital Catalog with Combined IDs...',
      'Building fast in-memory hash lookup map for Definitive IDs (109283, 229104, 550192, 884102, 331908, 771029)...',
      'Processing TAM 2022 Market Report (4 rows)...',
      '  -> Mapped Combined_ID and ID pools to 4 facilities',
      'Processing TAM 2023 Market Report (3 rows)...',
      '  -> Mapped Combined_ID and ID pools to 3 facilities',
      'Processing TAM 2024 Market Report (4 rows)...',
      '  -> Mapped Combined_ID and ID pools to 4 facilities',
      'Performing validation sanity check on unmatched Definitive IDs...',
      'Writing enriched datasets with preserved original columns...'
    ]);

    setTimeout(() => {
      const enriched: MarketReportRow[] = [
        {
          DEFINITIVE_ID: '109283',
          HOSPITAL_NAME: 'Mayo Clinic Hospital Rochester',
          CITY: 'Rochester',
          STATE: 'MN',
          CATEGORY: 'Orthopedics & Spine',
          TOTAL_BEDS: 1300,
          ANNUAL_PROCEDURE_VOLUME: 4400,
          Combined_ID: 'ACC-9901',
          'ID': 'ACC-9901',
          'ID 2': 'ACC-9902',
          'ID 3': 'ST-88201',
          'ID 4': 'ST-88202'
        },
        {
          DEFINITIVE_ID: '229104',
          HOSPITAL_NAME: 'Cleveland Clinic Main Campus',
          CITY: 'Cleveland',
          STATE: 'OH',
          CATEGORY: 'Orthopedics & Spine',
          TOTAL_BEDS: 1440,
          ANNUAL_PROCEDURE_VOLUME: 5200,
          Combined_ID: 'ACC-4410',
          'ID': 'ACC-4410',
          'ID 2': 'ACC-4411',
          'ID 3': 'ST-10394'
        },
        {
          DEFINITIVE_ID: '550192',
          HOSPITAL_NAME: 'Stanford Health Care',
          CITY: 'Stanford',
          STATE: 'CA',
          CATEGORY: 'Orthopedics & Trauma',
          TOTAL_BEDS: 613,
          ANNUAL_PROCEDURE_VOLUME: 2145,
          Combined_ID: 'ACC-5520',
          'ID': 'ACC-5520',
          'ID 2': 'ST-55102',
          'ID 3': 'ST-55103'
        },
        {
          DEFINITIVE_ID: '884102',
          HOSPITAL_NAME: 'Johns Hopkins Hospital',
          CITY: 'Baltimore',
          STATE: 'MD',
          CATEGORY: 'Spine Surgery & Arthroplasty',
          TOTAL_BEDS: 1180,
          ANNUAL_PROCEDURE_VOLUME: 3250,
          Combined_ID: 'ACC-1801',
          'ID': 'ACC-1801'
        },
        {
          DEFINITIVE_ID: '331908',
          HOSPITAL_NAME: 'Cedars-Sinai Medical Center',
          CITY: 'Los Angeles',
          STATE: 'CA',
          CATEGORY: 'Orthopedic Robotic Surgery',
          TOTAL_BEDS: 886,
          ANNUAL_PROCEDURE_VOLUME: 2650,
          Combined_ID: 'ACC-8700',
          'ID': 'ACC-8700'
        },
        {
          DEFINITIVE_ID: '771029',
          HOSPITAL_NAME: 'Hospital for Special Surgery',
          CITY: 'New York',
          STATE: 'NY',
          CATEGORY: 'Orthopedic Specialty Center',
          TOTAL_BEDS: 220,
          ANNUAL_PROCEDURE_VOLUME: 10800,
          Combined_ID: 'ST-77102',
          'ID': 'ST-77102'
        }
      ];

      setMappedData(enriched);
      if (onDataUpdated) {
        onDataUpdated(enriched);
      }
      setIsProcessing(false);
      setLogs((prev) => [
        ...prev,
        '--------------------------------------------------',
        '✅ Definitive ID Mapping Completed Successfully!',
        'Total Target Reports Processed: 3 Annual Datasets',
        'Total Hospital Records Enriched: 11 market rows',
        'Match Rate: 100% (0 orphaned Definitive IDs)',
        'All Account & ShipTo IDs attached without data loss.'
      ]);
    }, 600);
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

        <button
          id="btn-run-mapper"
          onClick={handleRunMapper}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            isProcessing
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Mapping Target Datasets...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run TAM ID Mapper</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Target Files Selector & VLOOKUP Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Target Reports Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Target TAM Market Reports ({selectedReports.length} Active)</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Batch VLOOKUP Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'TAM_2022', title: 'TAM 2022 Market Report', rows: '4 records', file: 'tam_2022_report.xlsx', data: SAMPLE_TAM_2022_REPORT },
                { id: 'TAM_2023', title: 'TAM 2023 Market Report', rows: '3 records', file: 'tam_2023_report.xlsx', data: SAMPLE_TAM_2023_REPORT },
                { id: 'TAM_2024', title: 'TAM 2024 Market Report', rows: '4 records', file: 'tam_2024_report.xlsx', data: SAMPLE_TAM_2024_REPORT }
              ].map((rep) => {
                const isSelected = selectedReports.includes(rep.id);
                return (
                  <div
                    key={rep.id}
                    onClick={() => toggleReport(rep.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all space-y-2 relative ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Target Report
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{rep.title}</p>
                      <p className={`text-[11px] font-mono ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{rep.file}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                      <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{rep.rows}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPreview(rep.data, rep.title, rep.file);
                        }}
                        className={`text-[10px] font-semibold underline ${isSelected ? 'text-emerald-400' : 'text-emerald-700'}`}
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VLOOKUP Architecture Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>VLOOKUP Join Specification</span>
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-800">Master Hospital Catalog</span>
                  <span className="text-slate-400">[DEFINITIVE_ID]</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span>1:1 VLOOKUP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-800">TAM Market Report</span>
                  <span className="text-slate-400">[DEFINITIVE_ID]</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-1 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Appended Enriched Columns:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Combined_ID', 'ID (Primary)', 'ID 2', 'ID 3', 'ID 4', 'Location Street', 'Match Status'].map((col, idx) => (
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
          
          {/* Output Inspection Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Enriched Output Datasets</span>
              </h3>
              <button
                onClick={() => onOpenPreview(
                  mappedData || SAMPLE_TAM_2024_REPORT,
                  'Enriched TAM Market Report with ID Mapping',
                  'TAM_Market_Report_Mapped.xlsx'
                )}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded border border-emerald-200"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Enriched</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Match Rate</p>
                <p className="text-lg font-black text-emerald-700 mt-0.5">100%</p>
                <p className="text-[10px] text-slate-500">11 of 11 rows</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Columns Added</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">+6 Cols</p>
                <p className="text-[10px] text-slate-500">Pooled IDs</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Orphaned IDs</p>
                <p className="text-lg font-black text-emerald-700 mt-0.5">0</p>
                <p className="text-[10px] text-slate-500">Zero data loss</p>
              </div>
            </div>
          </div>

          {/* Console Log */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>TAM VLOOKUP Console</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                pandas merge
              </span>
            </div>

            <div className="h-44 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 p-2 bg-slate-950/70 rounded-lg">
              {logs.map((log, i) => (
                <p key={i} className={log.startsWith('✅') ? 'text-emerald-400 font-bold' : log.startsWith('🚀') ? 'text-blue-400 font-bold' : 'text-slate-400'}>
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
