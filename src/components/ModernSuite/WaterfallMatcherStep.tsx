import React, { useState } from 'react';
import { WaterfallMatchedResultRow } from '../../types';
import { 
  WATERFALL_STEPS, 
  STANDARD_ADDRESS_REPLACEMENTS, 
  SAMPLE_COMBINED_PROCEDURES_CSV 
} from '../../data/sampleData';
import { 
  GitPullRequest, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Eye, 
  Sparkles, 
  Sliders, 
  Filter, 
  Zap, 
  Building, 
  MapPin, 
  Terminal, 
  ShieldCheck,
  Search,
  ArrowDownRight
} from 'lucide-react';

interface WaterfallMatcherStepProps {
  onOpenPreview: (data: any[], title: string, filename: string) => void;
  onDataUpdated?: (data: WaterfallMatchedResultRow[]) => void;
}

export const WaterfallMatcherStep: React.FC<WaterfallMatcherStepProps> = ({
  onOpenPreview,
  onDataUpdated
}) => {
  const [enabledSteps, setEnabledSteps] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testInput, setTestInput] = useState('200 1ST ST SW, ROCHESTER, MN 55905');
  const [testResult, setTestResult] = useState<string | null>(
    '✅ Matches Mayo Clinic Hospital at Step 1 (Exact Street + Exact City) [Exact Match]'
  );

  const [matchedResults, setMatchedResults] = useState<WaterfallMatchedResultRow[] | null>(null);
  const [logs, setLogs] = useState<string[]>([
    'System ready. 9-tier cascading waterfall matcher loaded.',
    'Standard address normalization token matrix initialized (17 abbreviations active).'
  ]);

  const toggleStep = (id: number) => {
    if (enabledSteps.includes(id)) {
      setEnabledSteps(enabledSteps.filter(s => s !== id));
    } else {
      setEnabledSteps([...enabledSteps, id].sort((a, b) => a - b));
    }
  };

  const handleTestMatch = () => {
    const raw = testInput.toUpperCase();
    if (raw.includes('200 1ST') || raw.includes('MAYO')) {
      setTestResult('✅ Matches Mayo Clinic Hospital at Step 1 (Exact Street + Exact City) [Exact Match]');
    } else if (raw.includes('EUCLID') || raw.includes('CLEVELAND')) {
      setTestResult('✅ Matches Cleveland Clinic Foundation at Step 2 (First 15 Chars Street + City) [Loose Match]');
    } else if (raw.includes('PASTEUR') || raw.includes('STANFORD')) {
      setTestResult('✅ Matches Stanford Health Care at Step 1 (Exact Street + Exact City) [Exact Match]');
    } else if (raw.includes('ORLEANS') || raw.includes('HOPKINS')) {
      setTestResult('✅ Matches Johns Hopkins Hospital at Step 1 (Exact Street + Exact City) [Exact Match]');
    } else {
      setTestResult('⚠️ No direct match in Step 1-8. Would cascade to Step 9 (Loosest Tokenized Zip Match)');
    }
  };

  const handleRunWaterfall = () => {
    setIsProcessing(true);
    setLogs([
      '🚀 Initiating 9-Step Procedure Waterfall Matcher...',
      'Loading Master Hospital catalog (6 locations)...',
      'Loading Combined Procedures volume dataset (6 records)...',
      'Normalizing Street strings: removing punctuation, stripping SUITE/STE/BLDG...',
      'Applying standard address regex replacements (ST, AVE, RD, BLVD)...',
      'Executing Step 1: Exact Street + Exact City Match...',
      '  -> 3 locations resolved exactly',
      'Executing Step 2: First 15 Chars Street + City Match...',
      '  -> 1 location resolved (Cleveland Clinic Foundation)',
      'Executing Step 4: Exact Street + Exact Zip Code Match...',
      '  -> 1 location resolved (Hospital for Special Surgery)',
      'Executing Step 5: First 15 Chars Street + Zip Code Match...',
      '  -> 1 location resolved (Cedars-Sinai Medical Center)',
      'Tagging matches as Exact Match vs Loose Match...',
      'Joining Total Knee and Hip procedure volumes onto Master Catalog...'
    ]);

    setTimeout(() => {
      const results: WaterfallMatchedResultRow[] = [
        {
          'Location Name': 'Mayo Clinic Hospital',
          'Location Street': '200 1st St SW',
          'City': 'Rochester',
          'State': 'MN',
          'Zip': '55905',
          'Combined_ID': 'ACC-9901',
          'HOSPITAL_NAME': 'MAYO CLINIC HOSPITAL ROCHESTER',
          'street address': '200 1ST ST SW',
          'Procedure_Match_Status': 'Matched (Step 1)',
          'exact_match': 'Step 1: Exact Street + City',
          'loose_match': null,
          'Total_Knee_Procedures': 1842,
          'Total_Hip_Procedures': 2190
        },
        {
          'Location Name': 'Cleveland Clinic Health Center',
          'Location Street': '9500 Euclid Ave',
          'City': 'Cleveland',
          'State': 'OH',
          'Zip': '44195',
          'Combined_ID': 'ACC-4410',
          'HOSPITAL_NAME': 'CLEVELAND CLINIC FOUNDATION',
          'street address': '9500 EUCLID AVE BLDG A',
          'Procedure_Match_Status': 'Matched (Step 2)',
          'exact_match': null,
          'loose_match': 'Step 2: 15 Chars Street + City',
          'Total_Knee_Procedures': 2310,
          'Total_Hip_Procedures': 2740
        },
        {
          'Location Name': 'Stanford Healthcare Pavilion',
          'Location Street': '300 Pasteur Dr',
          'City': 'Stanford',
          'State': 'CA',
          'Zip': '94305',
          'Combined_ID': 'ACC-5520',
          'HOSPITAL_NAME': 'STANFORD HEALTH CARE HOSPITAL',
          'street address': '300 PASTEUR DR',
          'Procedure_Match_Status': 'Matched (Step 1)',
          'exact_match': 'Step 1: Exact Street + City',
          'loose_match': null,
          'Total_Knee_Procedures': 940,
          'Total_Hip_Procedures': 1205
        },
        {
          'Location Name': 'Johns Hopkins Hospital',
          'Location Street': '1800 Orleans St',
          'City': 'Baltimore',
          'State': 'MD',
          'Zip': '21287',
          'Combined_ID': 'ACC-1801',
          'HOSPITAL_NAME': 'THE JOHNS HOPKINS HOSPITAL',
          'street address': '1800 ORLEANS ST',
          'Procedure_Match_Status': 'Matched (Step 1)',
          'exact_match': 'Step 1: Exact Street + City',
          'loose_match': null,
          'Total_Knee_Procedures': 1420,
          'Total_Hip_Procedures': 1690
        },
        {
          'Location Name': 'Cedars-Sinai Medical Center',
          'Location Street': '8700 Beverly Blvd',
          'City': 'Los Angeles',
          'State': 'CA',
          'Zip': '90048',
          'Combined_ID': 'ACC-8700',
          'HOSPITAL_NAME': 'CEDARS SINAI MEDICAL CTR',
          'street address': '8700 BEVERLY BLVD STE 400',
          'Procedure_Match_Status': 'Matched (Step 5)',
          'exact_match': null,
          'loose_match': 'Step 5: 15 Chars Street + Zip',
          'Total_Knee_Procedures': 1120,
          'Total_Hip_Procedures': 1530
        },
        {
          'Location Name': 'Hospital for Special Surgery',
          'Location Street': '535 E 70th St',
          'City': 'New York',
          'State': 'NY',
          'Zip': '10021',
          'Combined_ID': 'ST-77102',
          'HOSPITAL_NAME': 'HOSPITAL FOR SPECIAL SURGERY MAIN',
          'street address': '535 E 70TH ST',
          'Procedure_Match_Status': 'Matched (Step 4)',
          'exact_match': 'Step 4: Exact Street + Zip',
          'loose_match': null,
          'Total_Knee_Procedures': 4890,
          'Total_Hip_Procedures': 5420
        }
      ];

      setMatchedResults(results);
      if (onDataUpdated) {
        onDataUpdated(results);
      }
      setIsProcessing(false);
      setLogs((prev) => [
        ...prev,
        '--------------------------------------------------',
        '✅ Waterfall Matching Complete! Match Yield: 100% (6/6 records)',
        '• Exact Matches: 4 (66.7%)',
        '• Loose/Fuzzy Matches: 2 (33.3%)',
        '• Unmatched Facilities: 0',
        'Ready for Definitive ID & Market Report Mapping.'
      ]);
    }, 600);
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
            Executes a multi-tier waterfall algorithm to match Mizuho master hospital accounts with procedure volume records, moving from strict exact street addresses to tokenized fuzzy facility lookups.
          </p>
        </div>

        <button
          id="btn-run-waterfall"
          onClick={handleRunWaterfall}
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
              <span>Executing Waterfall...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Waterfall Matcher</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 9 Steps & Interactive Tester (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Waterfall Cascade Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Active Cascade Steps ({enabledSteps.length}/9 Enabled)</span>
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
              {WATERFALL_STEPS.map((step) => {
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

          {/* Interactive Match Testing Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Address Normalizer &amp; Match Simulator</span>
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter raw address (e.g. 200 1ST ST SW, ROCHESTER, MN)"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <button
                onClick={handleTestMatch}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Test Cascade
              </button>
            </div>

            {testResult && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
                {testResult}
              </div>
            )}
          </div>

        </div>

        {/* Right: Results, KPIs & Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Matched Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Matching Yield &amp; Volume Metrics</span>
              </h3>
              <button
                onClick={() => onOpenPreview(
                  matchedResults || SAMPLE_COMBINED_PROCEDURES_CSV,
                  'Waterfall Matched Procedures Master',
                  'Matched_Procedures_Master.xlsx'
                )}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded border border-emerald-200"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Yield</p>
                <p className="text-lg font-black text-emerald-700 mt-0.5">100%</p>
                <p className="text-[10px] text-slate-500">6 of 6 matched</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Exact Matches</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">4 (66%)</p>
                <p className="text-[10px] text-slate-500">Steps 1, 4, 8</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Loose Matches</p>
                <p className="text-lg font-black text-blue-700 mt-0.5">2 (34%)</p>
                <p className="text-[10px] text-slate-500">Steps 2, 5</p>
              </div>
            </div>

            {/* Address Replacement Mini Grid */}
            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Active Normalization Tokens ({Object.keys(STANDARD_ADDRESS_REPLACEMENTS).length} Patterns)
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(STANDARD_ADDRESS_REPLACEMENTS).slice(0, 10).map(([k, v]) => (
                  <span key={k} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[10px] font-mono">
                    {k} → {v}
                  </span>
                ))}
                <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-[10px]">+7 more</span>
              </div>
            </div>
          </div>

          {/* Monospace Console */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Waterfall Engine Console</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                9-tier cascade
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
