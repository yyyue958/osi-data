import React, { useState } from 'react';
import { 
  AppSuiteModule, 
  DataPrepTab,
  AccessoryOrderRow, 
  KneeProcedureRow, 
  InstalledBaseRow,
  ConsolidatedHospitalRow,
  WaterfallMatchedResultRow,
  MarketReportRow
} from '../../types';
import { AccessoryCleanerStep } from './AccessoryCleanerStep';
import { AccessoryMergeStep } from './AccessoryMergeStep';
import { InstalledStateCleanerStep } from './InstalledStateCleanerStep';
import { LocationConsolidationStep } from './LocationConsolidationStep';
import { WaterfallMatcherStep } from './WaterfallMatcherStep';
import { DefinitiveIdMapperStep } from './DefinitiveIdMapperStep';
import { BatchPipelineRunner } from './BatchPipelineRunner';
import { DataPreviewModal } from './DataPreviewModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';

import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Play, 
  Filter, 
  Building2, 
  GitPullRequest, 
  Database 
} from 'lucide-react';

interface ModernSuiteProps {
  accessoryData: AccessoryOrderRow[];
  kneeData: KneeProcedureRow[];
  installedData: InstalledBaseRow[];
}

export const ModernSuite: React.FC<ModernSuiteProps> = ({
  accessoryData,
  kneeData,
  installedData
}) => {
  const [activeModule, setActiveModule] = useLocalStorage<AppSuiteModule>('mizuho_active_module', 'suite-master-batch');
  const [dataPrepSubTab, setDataPrepSubTab] = useLocalStorage<DataPrepTab>('mizuho_data_prep_tab', 'accessory-clean');

  // Shared Datasets Across Suites
  const [cleanedAccessoryData, setCleanedAccessoryData] = useLocalStorage<AccessoryOrderRow[]>('mizuho_cleaned_accessory_v2', accessoryData);
  const [mergedKneeData, setMergedKneeData] = useLocalStorage<AccessoryOrderRow[] | null>('mizuho_merged_knee_v2', null);
  const [stateCleanedData, setStateCleanedData] = useLocalStorage<InstalledBaseRow[] | null>('mizuho_state_cleaned_v2', null);
  const [masterHospitalData, setMasterHospitalData] = useLocalStorage<ConsolidatedHospitalRow[] | null>('mizuho_master_hospital_v2', null);
  const [waterfallData, setWaterfallData] = useLocalStorage<WaterfallMatchedResultRow[] | null>('mizuho_waterfall_data_v2', null);
  const [tamMarketData, setTamMarketData] = useLocalStorage<MarketReportRow[] | null>('mizuho_tam_market_v2', null);

  // Modal Preview State
  const [previewState, setPreviewState] = useState<{
    isOpen: boolean;
    data: any[];
    title: string;
    filename: string;
  }>({
    isOpen: false,
    data: [],
    title: '',
    filename: 'export.xlsx'
  });

  const handleOpenPreview = (data: any[], title: string, filename: string) => {
    setPreviewState({
      isOpen: true,
      data,
      title,
      filename
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          
          <button
            id="tab-suite-master-batch"
            onClick={() => setActiveModule('suite-master-batch')}
            className={`p-3 rounded-lg text-left transition-all relative border ${
              activeModule === 'suite-master-batch'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-950 border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                activeModule === 'suite-master-batch' ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-200 text-emerald-900'
              }`}>
                Automated
              </span>
              <Zap className={`w-4 h-4 ${activeModule === 'suite-master-batch' ? 'text-amber-300' : 'text-emerald-700'}`} />
            </div>
            <p className="font-bold text-xs sm:text-sm mt-1.5 line-clamp-1">
              Full Pipeline
            </p>
            <p className={`text-[11px] hidden sm:block ${activeModule === 'suite-master-batch' ? 'text-slate-300' : 'text-emerald-700'}`}>
              Run all steps at once
            </p>
          </button>

          <button
            id="tab-suite-data-prep"
            onClick={() => setActiveModule('suite-data-prep')}
            className={`p-3 rounded-lg text-left transition-all relative border ${
              activeModule === 'suite-data-prep'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-600 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                activeModule === 'suite-data-prep' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                Step 1
              </span>
              <Filter className={`w-3.5 h-3.5 ${activeModule === 'suite-data-prep' ? 'text-emerald-400' : 'text-slate-400'}`} />
            </div>
            <p className={`font-bold text-xs sm:text-sm mt-1.5 line-clamp-1 ${activeModule === 'suite-data-prep' ? 'text-white' : 'text-slate-900'}`}>
              Data Prep
            </p>
            <p className={`text-[11px] hidden sm:block ${activeModule === 'suite-data-prep' ? 'text-slate-300' : 'text-slate-500'}`}>
              Clean raw datasets
            </p>
          </button>

          <button
            id="tab-suite-location-master"
            onClick={() => setActiveModule('suite-location-master')}
            className={`p-3 rounded-lg text-left transition-all relative border ${
              activeModule === 'suite-location-master'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-600 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                activeModule === 'suite-location-master' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                Step 2
              </span>
              <Building2 className={`w-3.5 h-3.5 ${activeModule === 'suite-location-master' ? 'text-emerald-400' : 'text-slate-400'}`} />
            </div>
            <p className={`font-bold text-xs sm:text-sm mt-1.5 line-clamp-1 ${activeModule === 'suite-location-master' ? 'text-white' : 'text-slate-900'}`}>
              Master Locations
            </p>
            <p className={`text-[11px] hidden sm:block ${activeModule === 'suite-location-master' ? 'text-slate-300' : 'text-slate-500'}`}>
              Merge hospital IDs
            </p>
          </button>

          <button
            id="tab-suite-waterfall-match"
            onClick={() => setActiveModule('suite-waterfall-match')}
            className={`p-3 rounded-lg text-left transition-all relative border ${
              activeModule === 'suite-waterfall-match'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-600 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                activeModule === 'suite-waterfall-match' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                Step 3
              </span>
              <GitPullRequest className={`w-3.5 h-3.5 ${activeModule === 'suite-waterfall-match' ? 'text-emerald-400' : 'text-slate-400'}`} />
            </div>
            <p className={`font-bold text-xs sm:text-sm mt-1.5 line-clamp-1 ${activeModule === 'suite-waterfall-match' ? 'text-white' : 'text-slate-900'}`}>
              Match Procedures
            </p>
            <p className={`text-[11px] hidden sm:block ${activeModule === 'suite-waterfall-match' ? 'text-slate-300' : 'text-slate-500'}`}>
              Link volume to hospitals
            </p>
          </button>

          <button
            id="tab-suite-tam-mapper"
            onClick={() => setActiveModule('suite-tam-mapper')}
            className={`p-3 rounded-lg text-left transition-all relative border ${
              activeModule === 'suite-tam-mapper'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-600 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                activeModule === 'suite-tam-mapper' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                Step 4
              </span>
              <Database className={`w-3.5 h-3.5 ${activeModule === 'suite-tam-mapper' ? 'text-emerald-400' : 'text-slate-400'}`} />
            </div>
            <p className={`font-bold text-xs sm:text-sm mt-1.5 line-clamp-1 ${activeModule === 'suite-tam-mapper' ? 'text-white' : 'text-slate-900'}`}>
              Map Reports
            </p>
            <p className={`text-[11px] hidden sm:block ${activeModule === 'suite-tam-mapper' ? 'text-slate-300' : 'text-slate-500'}`}>
              Enrich market data
            </p>
          </button>

        </div>
      </div>

      {/* Module 1 (Data Prep) Sub-Tabs */}
      {activeModule === 'suite-data-prep' && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setDataPrepSubTab('accessory-clean')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              dataPrepSubTab === 'accessory-clean'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            1. Clean Accessory Data
          </button>
          <button
            onClick={() => setDataPrepSubTab('merge-knee')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              dataPrepSubTab === 'merge-knee'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            2. Merge Knee Procedures (Pre-2017)
          </button>
          <button
            onClick={() => setDataPrepSubTab('state-clean')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              dataPrepSubTab === 'state-clean'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            3. Clean Installed States
          </button>
        </div>
      )}

      {/* ACTIVE MODULE CONTENTS */}
      {activeModule === 'suite-master-batch' && (
        <BatchPipelineRunner
          rawAccessoryData={accessoryData}
          rawKneeData={kneeData}
          rawInstalledData={installedData}
          onOpenPreview={handleOpenPreview}
        />
      )}

      {activeModule === 'suite-data-prep' && dataPrepSubTab === 'accessory-clean' && (
        <AccessoryCleanerStep
          rawData={accessoryData}
          onDataProcessed={(cleaned) => setCleanedAccessoryData(cleaned)}
          onOpenPreview={handleOpenPreview}
        />
      )}

      {activeModule === 'suite-data-prep' && dataPrepSubTab === 'merge-knee' && (
        <AccessoryMergeStep
          cleanedAccessoryData={cleanedAccessoryData}
          kneeProceduresData={kneeData}
          onMergedDataReady={(merged) => setMergedKneeData(merged)}
          onOpenPreview={handleOpenPreview}
        />
      )}

      {activeModule === 'suite-data-prep' && dataPrepSubTab === 'state-clean' && (
        <InstalledStateCleanerStep
          rawInstalledData={installedData}
          onDataProcessed={(matched, excluded) => setStateCleanedData(matched)}
          onOpenPreview={handleOpenPreview}
        />
      )}

      {activeModule === 'suite-location-master' && (
        <LocationConsolidationStep
          onOpenPreview={handleOpenPreview}
          onDataUpdated={(master) => setMasterHospitalData(master)}
        />
      )}

      {activeModule === 'suite-waterfall-match' && (
        <WaterfallMatcherStep
          onOpenPreview={handleOpenPreview}
          onDataUpdated={(res) => setWaterfallData(res)}
        />
      )}

      {activeModule === 'suite-tam-mapper' && (
        <DefinitiveIdMapperStep
          onOpenPreview={handleOpenPreview}
          onDataUpdated={(enriched) => setTamMarketData(enriched)}
        />
      )}

      {/* Global Data Preview Modal */}
      <DataPreviewModal
        isOpen={previewState.isOpen}
        onClose={() => setPreviewState(prev => ({ ...prev, isOpen: false }))}
        title={previewState.title}
        data={previewState.data}
        filename={previewState.filename}
      />

    </div>
  );
};
