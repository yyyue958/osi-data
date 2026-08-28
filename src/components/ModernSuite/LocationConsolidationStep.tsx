import React, { useState } from 'react';
import { ConsolidatedHospitalRow, ProcedureHospitalRawRow } from '../../types';
import { 
  SAMPLE_TAM_PROCEDURE_HOSPITALS, 
  SAMPLE_INSTALLED_BASE_LOCATIONS, 
  SAMPLE_ACCESSORY_LOCATIONS 
} from '../../data/sampleData';
import { 
  Building2, 
  Layers, 
  CheckCircle2, 
  Search, 
  Download, 
  Eye, 
  Play, 
  FileSpreadsheet, 
  Hash, 
  GitMerge, 
  ChevronRight, 
  Terminal, 
  Sparkles,
  Info
} from 'lucide-react';

interface LocationConsolidationStepProps {
  onOpenPreview: (data: any[], title: string, filename: string) => void;
  onDataUpdated?: (data: ConsolidatedHospitalRow[]) => void;
}

export const LocationConsolidationStep: React.FC<LocationConsolidationStepProps> = ({
  onOpenPreview,
  onDataUpdated
}) => {
  const [subTab, setSubTab] = useState<'proc' | 'ib' | 'acc' | 'master'>('master');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'Ready to consolidate hospital records and pool account identifiers.'
  ]);
  const [processedMaster, setProcessedMaster] = useState<ConsolidatedHospitalRow[] | null>(null);

  // Run Master Combiner Logic
  const handleRunMasterCombiner = () => {
    setIsProcessing(true);
    setLogs([
      '🚀 Initializing Master Hospital Location Combiner...',
      'Loading Accessory Location datasets (4 records loaded)...',
      'Loading Installed Base Location datasets (5 records loaded)...',
      'Standardizing column schemas across both datasets...',
      'Mapping ShipTo IDs & Account Numbers into canonical ID vectors...',
      'Grouping identical hospital locations across datasets...',
      'Pooling all unique IDs per site (e.g. Mayo Clinic: ACC-9901, ACC-9902, ST-88201, ST-88202)...',
      'Deduplicating duplicate IDs within hospital groups...',
      'Generating master hospital location catalog...'
    ]);

    setTimeout(() => {
      // Simulate pooling logic
      const masterList: ConsolidatedHospitalRow[] = [
        {
          'Hospital + Address': 'Mayo Clinic Hospital, 200 1st St SW',
          'Location Name': 'Mayo Clinic Hospital',
          'Location Street': '200 1st St SW',
          'City': 'Rochester',
          'State': 'MN',
          'Zip': '55905',
          'ID': 'ACC-9901',
          'ID 2': 'ACC-9902',
          'ID 3': 'ST-88201',
          'ID 4': 'ST-88202',
          'All_IDs': ['ACC-9901', 'ACC-9902', 'ST-88201', 'ST-88202']
        },
        {
          'Hospital + Address': 'Cleveland Clinic Health Center, 9500 Euclid Ave',
          'Location Name': 'Cleveland Clinic Health Center',
          'Location Street': '9500 Euclid Ave',
          'City': 'Cleveland',
          'State': 'OH',
          'Zip': '44195',
          'ID': 'ACC-4410',
          'ID 2': 'ACC-4411',
          'ID 3': 'ST-10394',
          'All_IDs': ['ACC-4410', 'ACC-4411', 'ST-10394']
        },
        {
          'Hospital + Address': 'Stanford Healthcare Pavilion, 300 Pasteur Dr',
          'Location Name': 'Stanford Healthcare Pavilion',
          'Location Street': '300 Pasteur Dr',
          'City': 'Stanford',
          'State': 'CA',
          'Zip': '94305',
          'ID': 'ACC-5520',
          'ID 2': 'ST-55102',
          'ID 3': 'ST-55103',
          'All_IDs': ['ACC-5520', 'ST-55102', 'ST-55103']
        },
        {
          'Hospital + Address': 'Johns Hopkins Hospital, 1800 Orleans St',
          'Location Name': 'Johns Hopkins Hospital',
          'Location Street': '1800 Orleans St',
          'City': 'Baltimore',
          'State': 'MD',
          'Zip': '21287',
          'ID': 'ACC-1801',
          'All_IDs': ['ACC-1801']
        },
        {
          'Hospital + Address': 'Cedars-Sinai Medical Center, 8700 Beverly Blvd',
          'Location Name': 'Cedars-Sinai Medical Center',
          'Location Street': '8700 Beverly Blvd',
          'City': 'Los Angeles',
          'State': 'CA',
          'Zip': '90048',
          'ID': 'ACC-8700',
          'All_IDs': ['ACC-8700']
        },
        {
          'Hospital + Address': 'Hospital for Special Surgery, 535 E 70th St',
          'Location Name': 'Hospital for Special Surgery',
          'Location Street': '535 E 70th St',
          'City': 'New York',
          'State': 'NY',
          'Zip': '10021',
          'ID': 'ST-77102',
          'All_IDs': ['ST-77102']
        }
      ];

      setProcessedMaster(masterList);
      if (onDataUpdated) {
        onDataUpdated(masterList);
      }
      setIsProcessing(false);
      setLogs((prev) => [
        ...prev,
        '--------------------------------------------------',
        '✅ Master Hospital Location List successfully generated!',
        'Total Unique Hospitals: 6 facilities',
        'Total Preserved Account & ShipTo IDs: 14 unique identifiers',
        'Cross-system duplicates consolidated into single rows.',
        'Ready for Waterfall Procedure Matching.'
      ]);
    }, 600);
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
            Consolidates TAM procedure hospitals, Installed Base records, and Accessory ship-to locations into a unified Master Hospital Catalog while preserving all associated Account Numbers and ShipTo IDs across columns.
          </p>
        </div>

        <button
          id="btn-run-master-combiner"
          onClick={handleRunMasterCombiner}
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
              <span>Consolidating Locations...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Master Combiner</span>
            </>
          )}
        </button>
      </div>

      {/* Sub-Tabs: 4 consolidation stages */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('master')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            subTab === 'master'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          4. Master Hospital Combiner (Output)
        </button>
        <button
          onClick={() => setSubTab('proc')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            subTab === 'proc'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. Procedure Hospital Consolidation
        </button>
        <button
          onClick={() => setSubTab('ib')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            subTab === 'ib'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          2. Installed Base Consolidation
        </button>
        <button
          onClick={() => setSubTab('acc')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
            subTab === 'acc'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          3. Accessory Consolidation
        </button>
      </div>

      {/* Main Content based on SubTab */}
      {subTab === 'master' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Configuration & Stats (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Sources Overview Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-emerald-600" />
                  <span>Pipeline Source Datasets</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready to Merge
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source 1: Cleaned Accessory</p>
                  <p className="text-xs font-semibold text-slate-900">accesary_location_combined_unique.xlsx</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <span>4 Unique Facilities</span>
                    <span>•</span>
                    <span>Multi-ShipToIDs</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source 2: Installed Base</p>
                  <p className="text-xs font-semibold text-slate-900">installed_base_location_combined.xlsx</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <span>5 Unique Facilities</span>
                    <span>•</span>
                    <span>Multi-Account Numbers</span>
                  </div>
                </div>
              </div>

              {/* ID Pooling Explanation */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1 text-xs text-slate-700">
                <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Automated Multi-ID Pooling Logic</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  When a hospital exists in both datasets with multiple account numbers (e.g. <code>ACC-9901, ACC-9902</code>) and ShipTo IDs (e.g. <code>ST-88201, ST-88202</code>), the pipeline consolidates them horizontally into <code>ID 1, ID 2, ID 3, ID 4...</code> without losing any identifier.
                </p>
              </div>
            </div>

            {/* Results Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Master Hospital Location List</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenPreview(
                      processedMaster || SAMPLE_INSTALLED_BASE_LOCATIONS,
                      'Master Hospital Location List (VERSION 2)',
                      'Master_Hospital_Location_List.xlsx'
                    )}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md border border-emerald-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Table</span>
                  </button>
                </div>
              </div>

              {/* Quick KPI stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unique Sites</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{processedMaster ? processedMaster.length : 6}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pooled IDs</p>
                  <p className="text-lg font-black text-emerald-700 mt-0.5">14 IDs</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Max IDs / Site</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">4 IDs</p>
                </div>
              </div>

              {/* Sample Table Preview Snippet */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Hospital Name</th>
                      <th className="p-2.5">City, State</th>
                      <th className="p-2.5">Zip</th>
                      <th className="p-2.5">Pooled IDs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(processedMaster || [
                      { 'Location Name': 'Mayo Clinic Hospital', City: 'Rochester', State: 'MN', Zip: '55905', All_IDs: ['ACC-9901', 'ACC-9902', 'ST-88201', 'ST-88202'] },
                      { 'Location Name': 'Cleveland Clinic Health Center', City: 'Cleveland', State: 'OH', Zip: '44195', All_IDs: ['ACC-4410', 'ACC-4411', 'ST-10394'] },
                      { 'Location Name': 'Stanford Healthcare Pavilion', City: 'Stanford', State: 'CA', Zip: '94305', All_IDs: ['ACC-5520', 'ST-55102', 'ST-55103'] }
                    ]).slice(0, 3).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-900">{row['Location Name']}</td>
                        <td className="p-2.5 text-slate-600">{row.City}, {row.State}</td>
                        <td className="p-2.5 font-mono text-slate-600">{row.Zip}</td>
                        <td className="p-2.5">
                          <div className="flex flex-wrap gap-1">
                            {row.All_IDs?.map((id: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-mono">
                                {id}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right: Real-time Terminal Logs & Schema Visualizer (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Terminal Console */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Master Combiner Console</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  calamine + pandas
                </span>
              </div>

              <div className="h-56 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 p-2 bg-slate-950/70 rounded-lg">
                {logs.map((log, i) => (
                  <p key={i} className={log.startsWith('✅') ? 'text-emerald-400 font-bold' : log.startsWith('🚀') ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                    {log}
                  </p>
                ))}
              </div>
            </div>

            {/* Schema Mapping Matrix */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cross-System Schema Normalization
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-slate-600">ShipTo Name / Location Name</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold font-mono text-emerald-800">Location Name</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-slate-600">ShipTo Region / Location State</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold font-mono text-emerald-800">State</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-slate-600">ShipTo PostalCode / Location Zip</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold font-mono text-emerald-800">Zip</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-slate-600">Account Number + ShipToID</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold font-mono text-emerald-800">ID 1, ID 2... ID N</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SubTab 1: Procedure Hospital Consolidation */}
      {subTab === 'proc' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Procedure Hospital Multi-Year Consolidation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Combines TAM 2022, 2023, 2024 annual report files and generates clean address tokens</p>
            </div>
            <button
              onClick={() => onOpenPreview(SAMPLE_TAM_PROCEDURE_HOSPITALS, 'Procedure Hospital Addresses Master List', 'Procedure_Hospital_Addresses_Combined_Master_List.csv')}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview 8 Records</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Input Files</p>
              <p className="text-xs font-semibold text-slate-900 mt-1">TAM 2022, 2023, 2024 Reports</p>
              <p className="text-[11px] text-slate-500 mt-0.5">3 Multi-Year Files</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Token Generation</p>
              <p className="text-xs font-semibold text-emerald-700 mt-1">Hospital + Address &amp; street address</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Regex cleaned spacing &amp; commas</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Deduplication</p>
              <p className="text-xs font-semibold text-slate-900 mt-1">DEFINITIVE_ID Unique Key</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Cross-year duplicates dropped</p>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Installed Base Consolidation */}
      {subTab === 'ib' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Installed Base Hospital Consolidation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Groups installed tables by hospital location and expands multiple Account Numbers into columns</p>
            </div>
            <button
              onClick={() => onOpenPreview(SAMPLE_INSTALLED_BASE_LOCATIONS, 'Installed Base Consolidated Locations', 'installed_base_location_combined.xlsx')}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview 5 Records</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="text-xs font-bold text-slate-900">Grouping Key</p>
              <p className="text-xs text-slate-600">Location Name + Location Street + Location City + Location State + Location Zip</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="text-xs font-bold text-slate-900">Output Columns</p>
              <p className="text-xs text-slate-600 font-mono">Hospital + Address, Location Name, Street, City, State, Zip, Account Number 1, Account Number 2...</p>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Accessory Consolidation */}
      {subTab === 'acc' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Accessory Hospital Consolidation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Groups accessory sales by Ship-To location and expands multiple ShipToIDs into columns</p>
            </div>
            <button
              onClick={() => onOpenPreview(SAMPLE_ACCESSORY_LOCATIONS, 'Accessory Consolidated Locations', 'accesary_location_combined_unique.xlsx')}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview 4 Records</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="text-xs font-bold text-slate-900">Grouping Key</p>
              <p className="text-xs text-slate-600">ShipTo Name + ShipTo Street + ShipTo City + ShipTo Region + ShipTo PostalCode</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <p className="text-xs font-bold text-slate-900">Output Columns</p>
              <p className="text-xs text-slate-600 font-mono">Hospital + Address, ShipTo Name, Street, City, Region, PostalCode, ShipToID 1, ShipToID 2...</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
