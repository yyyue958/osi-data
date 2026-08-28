import React, { useState } from 'react';
import { UX_FRICTION_POINTS } from '../data/uxAuditData';
import { 
  Layers, 
  Sparkles, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  MousePointer,
  RotateCcw,
  Building,
  GitPullRequest,
  Database,
  Filter
} from 'lucide-react';

export const LegacySimulator: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<number>(1); // default to App 2 based on user request
  const [activeTabApp1, setActiveTabApp1] = useState<number>(0);
  const [activeTabApp2, setActiveTabApp2] = useState<number>(3); // default to 4th tab in App 2
  const [highlightFriction, setHighlightFriction] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>('cross-app-fragmentation');

  const activePoint = UX_FRICTION_POINTS.find(p => p.id === selectedHotspot) || UX_FRICTION_POINTS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span>Interactive Simulator</span>
            <span>•</span>
            <span>4 Legacy Python Tkinter Architectures</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Legacy Tkinter Simulation with Friction Hotspots
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Switch between the 4 original Python scripts below. Click any pulsing red hotspot to inspect why it caused cognitive friction and how the new unified design solves it.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <label className="text-xs text-slate-700 font-medium cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={highlightFriction}
              onChange={(e) => setHighlightFriction(e.target.checked)}
              className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Show Friction Callouts</span>
          </label>
        </div>
      </div>

      {/* App Selector Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { setSelectedApp(0); setSelectedHotspot('hardcoded-paths'); }}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedApp === 0
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>App 1: UnifiedDataProcessingApp</span>
        </button>

        <button
          onClick={() => { setSelectedApp(1); setSelectedHotspot('cross-app-fragmentation'); }}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedApp === 1
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>App 2: UnifiedMasterLocationApp</span>
        </button>

        <button
          onClick={() => { setSelectedApp(2); setSelectedHotspot('waterfall-blind-configuration'); }}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedApp === 2
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>App 3: ProcedureWaterfallMatcherApp</span>
        </button>

        <button
          onClick={() => { setSelectedApp(3); setSelectedHotspot('semicolon-target-files'); }}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedApp === 3
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>App 4: DefinitiveIDMapperApp</span>
        </button>
      </div>

      {/* Grid: 2 Halves (Legacy Tkinter Sandbox vs Live Hotspot Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Pixel-Accurate Tkinter Window (7 cols) */}
        <div className="lg:col-span-7 flex justify-center">
          
          {/* Simulated Tkinter Native Window Frame */}
          <div className="w-full max-w-[660px] bg-[#d9d9d9] text-black font-sans rounded-lg shadow-xl border-2 border-slate-400 overflow-hidden select-none">
            
            {/* Windows / Tkinter Title Bar */}
            <div className="bg-slate-200 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between text-xs font-medium text-slate-800">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
                <span>
                  {selectedApp === 0 && 'Mizuho Data Processing Suite'}
                  {selectedApp === 1 && 'Mizuho Location Processing Suite'}
                  {selectedApp === 2 && 'Procedure Waterfall Matcher'}
                  {selectedApp === 3 && 'Definitive ID & Market Report Mapper'}
                </span>
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="px-2 py-0.5 hover:bg-slate-300 cursor-pointer">_</span>
                <span className="px-2 py-0.5 hover:bg-slate-300 cursor-pointer">□</span>
                <span className="px-2 py-0.5 hover:bg-red-500 hover:text-white cursor-pointer">✕</span>
              </div>
            </div>

            {/* APP 1 SIMULATION */}
            {selectedApp === 0 && (
              <div>
                {/* Notebook Tabs */}
                <div className="bg-[#e1e1e1] border-b border-[#a0a0a0] flex items-center px-2 pt-1 gap-1 text-[11px]">
                  {['1. Clean Accessory Data', '2. Merge Accessory before 2017', '3. Clean Installed Data'].map((tabTitle, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTabApp1(idx)}
                      className={`px-3 py-1 border-t border-l border-r rounded-t-sm transition-colors relative ${
                        activeTabApp1 === idx
                          ? 'bg-[#d9d9d9] border-[#707070] font-bold text-black border-b-2 border-b-[#d9d9d9] -mb-[1px] z-10'
                          : 'bg-[#cfcfcf] border-[#b0b0b0] text-slate-700 hover:bg-[#d5d5d5]'
                      }`}
                    >
                      {tabTitle}
                    </button>
                  ))}
                </div>

                <div className="p-3 space-y-3 bg-[#d9d9d9] text-[11px]">
                  {/* File Selection Group */}
                  <fieldset className="border border-[#808080] p-2.5 rounded-sm relative">
                    <legend className="px-1 text-[11px] font-bold text-slate-800">Files</legend>
                    {highlightFriction && (
                      <button 
                        onClick={() => setSelectedHotspot('hardcoded-paths')}
                        className="absolute -top-2 right-2 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow animate-pulse"
                      >
                        <span>Friction #1</span>
                      </button>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="w-24 text-right font-medium">Input File:</label>
                        <input
                          type="text"
                          readOnly
                          value="C:\Users\yyang\Downloads\accesary install.xlsx"
                          className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                        />
                        <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070] hover:bg-[#eaeaea] active:bg-[#ccc]">
                          Browse...
                        </button>
                      </div>
                    </div>
                  </fieldset>

                  {/* Filter Configuration */}
                  <fieldset className="border border-[#808080] p-2.5 rounded-sm relative">
                    <legend className="px-1 text-[11px] font-bold text-slate-800">Filter Configuration</legend>
                    {highlightFriction && (
                      <button 
                        onClick={() => setSelectedHotspot('comma-delimited-strings')}
                        className="absolute -top-2 right-2 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow animate-pulse"
                      >
                        <span>Friction #2</span>
                      </button>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-right font-medium">Valid Order Types:</label>
                        <input
                          type="text"
                          readOnly
                          value="KE, RE, ZDOM, ZRMA, ZSRV, ZTOR, ZKE, ZOR, ZRET, ZRMA"
                          className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-28 text-right font-medium">Exclude Reasons:</label>
                        <input
                          type="text"
                          readOnly
                          value="METECH, TRADE IN"
                          className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700"
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* Action Button */}
                  <button className="w-full py-2 bg-[#4CAF50] text-white font-bold rounded-sm border border-[#2e7d32] shadow-sm hover:brightness-105 active:scale-[0.99]">
                    Run Processing &amp; Save Output
                  </button>

                  {/* Terminal Console */}
                  <div className="bg-white border border-[#7f9db9] p-2 font-mono text-[10px] h-28 overflow-y-auto text-slate-800 leading-tight">
                    <p>--- Accessory Data Cleaning Log ---</p>
                    <p>Loaded 1,420 rows from accesary install.xlsx</p>
                    <p>Filtering by ShipTo Country: US</p>
                    <p>Dropped 14 METECH records</p>
                    <p>Cleaned dataset ready in memory.</p>
                  </div>
                </div>
              </div>
            )}

            {/* APP 2 SIMULATION */}
            {selectedApp === 1 && (
              <div>
                <div className="bg-[#e1e1e1] border-b border-[#a0a0a0] flex items-center px-1 pt-1 gap-0.5 text-[10px] overflow-x-auto whitespace-nowrap">
                  {[
                    '1. Procedure Hospital consolidation', 
                    '2. Installed Base Hospital consolidation', 
                    '3. Accessory Hospital consolidation', 
                    '4. Installed+Accessory Hospital Combiner'
                  ].map((tabTitle, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTabApp2(idx)}
                      className={`px-2 py-1 border-t border-l border-r rounded-t-sm transition-colors relative ${
                        activeTabApp2 === idx
                          ? 'bg-[#d9d9d9] border-[#707070] font-bold text-black border-b-2 border-b-[#d9d9d9] -mb-[1px] z-10'
                          : 'bg-[#cfcfcf] border-[#b0b0b0] text-slate-700 hover:bg-[#d5d5d5]'
                      }`}
                    >
                      {tabTitle}
                    </button>
                  ))}
                </div>

                <div className="p-3 space-y-3 bg-[#d9d9d9] text-[11px]">
                  
                  {activeTabApp2 === 0 && (
                    <>
                      <fieldset className="border border-[#808080] p-2.5 rounded-sm relative">
                        <legend className="px-1 text-[11px] font-bold text-slate-800">1. Select Files</legend>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Input Files<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="Mizuho_Total_Addressable_Market_2022.csv; 2023.csv; 2024.csv"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Output File<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="Procedure_Hospital_Addresses_Combined_Master_List.csv"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                        </div>
                      </fieldset>
                      <button className="w-full py-2 bg-[#4CAF50] text-white font-bold rounded-sm border border-[#2e7d32] shadow-sm">
                        Run Combine &amp; Clean
                      </button>
                    </>
                  )}

                  {activeTabApp2 === 1 && (
                    <>
                      <fieldset className="border border-[#808080] p-2.5 rounded-sm relative">
                        <legend className="px-1 text-[11px] font-bold text-slate-800">1. Select Files</legend>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Input Cleaned States<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="installed base_cleaned_states.xlsx"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Output File<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="installed_base_location_combined_unique version 2.xlsx"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                        </div>
                      </fieldset>
                      <button className="w-full py-2 bg-[#4CAF50] text-white font-bold rounded-sm border border-[#2e7d32] shadow-sm">
                        Run Location Combiner
                      </button>
                    </>
                  )}

                  {activeTabApp2 === 2 && (
                    <>
                      <fieldset className="border border-[#808080] p-2.5 rounded-sm relative">
                        <legend className="px-1 text-[11px] font-bold text-slate-800">1. Select Files</legend>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Input Accessory<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="accesary_final_cleaned.xlsx"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Output File<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="accesary_location_combined_unique VERSION 2.xlsx"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                        </div>
                      </fieldset>
                      <button className="w-full py-2 bg-[#4CAF50] text-white font-bold rounded-sm border border-[#2e7d32] shadow-sm">
                        Run Location Combiner
                      </button>
                    </>
                  )}

                  {activeTabApp2 === 3 && (
                    <>
                      <fieldset className="border border-[#808080] p-2.5 rounded-sm relative">
                        <legend className="px-1 text-[11px] font-bold text-slate-800">1. Select Files</legend>
                        {highlightFriction && (
                          <button 
                            onClick={() => setSelectedHotspot('cross-app-fragmentation')}
                            className="absolute -top-2 right-2 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow animate-pulse"
                          >
                            <span>Cross-App Friction</span>
                          </button>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Accessory Location<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="C:\Users\yyang\...\accesary_location_combined_unique VERSION 2.xlsx"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Installed Base Location<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="C:\Users\yyang\...\installed_base_location_combined_unique version 2.xlsx"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="w-24 text-right font-medium">Output Master File<br/>(Excel or CSV):</label>
                            <input
                              type="text"
                              readOnly
                              value="C:\Users\yyang\...\Master_Hospital_Location_List VERSION 2.xlsx"
                              className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                            />
                            <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse</button>
                          </div>
                        </div>
                      </fieldset>
                      <button className="w-full py-2 bg-[#4CAF50] text-white font-bold rounded-sm border border-[#2e7d32] shadow-sm">
                        Run Master Combiner
                      </button>
                    </>
                  )}

                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">Results &amp; Verification:</p>
                    <div className="bg-white border border-[#7f9db9] p-2 font-mono text-[10px] h-28 overflow-y-auto text-slate-800 leading-tight">
                      <p>--- Console Output ---</p>
                      <p>Awaiting user input...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APP 3 SIMULATION */}
            {selectedApp === 2 && (
              <div className="p-3 space-y-3 bg-[#d9d9d9] text-[11px]">
                <fieldset className="border border-[#808080] p-2.5 rounded-sm relative">
                  <legend className="px-1 text-[11px] font-bold text-slate-800">Waterfall Match Configuration</legend>
                  {highlightFriction && (
                    <button 
                      onClick={() => setSelectedHotspot('waterfall-blind-configuration')}
                      className="absolute -top-2 right-2 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow animate-pulse"
                    >
                      <span>Friction #3</span>
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Step 1: Street + City</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Step 2: 15 Chars + City</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Step 3: 12 Chars + City</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Step 4: Street + Zip</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Step 5: 15 Chars + Zip</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Step 6: 12 Chars + Zip</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Step 7: 2 Words + Zip</label>
                    <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Step 8: Name + Zip</label>
                  </div>
                </fieldset>

                <button className="w-full py-2 bg-[#9C27B0] text-white font-bold rounded-sm border border-[#7b1fa2] shadow-sm">
                  Execute 9-Step Waterfall Matching
                </button>

                <div className="bg-white border border-[#7f9db9] p-2 font-mono text-[10px] h-28 overflow-y-auto text-slate-800 leading-tight">
                  <p>--- Procedure Waterfall Matcher Log ---</p>
                  <p>Executing 9-step cascade across Master Hospital List...</p>
                  <p>Step 1 matches: 348 | Step 2 matches: 92 | Step 5 matches: 41</p>
                  <p>Classification: Exact vs Loose complete.</p>
                </div>
              </div>
            )}

            {/* APP 4 SIMULATION */}
            {selectedApp === 3 && (
              <div className="p-3 space-y-3 bg-[#d9d9d9] text-[11px]">
                <fieldset className="border border-[#808080] p-2.5 rounded-sm relative">
                  <legend className="px-1 text-[11px] font-bold text-slate-800">Target TAM Market Reports</legend>
                  {highlightFriction && (
                    <button 
                      onClick={() => setSelectedHotspot('semicolon-target-files')}
                      className="absolute -top-2 right-2 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow animate-pulse"
                    >
                      <span>Friction #4</span>
                    </button>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="w-24 text-right font-medium">Target Reports:</label>
                      <input
                        type="text"
                        readOnly
                        value="C:\Users\yyang\TAM2022.xlsx; C:\Users\yyang\TAM2023.xlsx; C:\Users\yyang\TAM2024.xlsx"
                        className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate"
                      />
                      <button className="px-2 py-0.5 bg-[#e1e1e1] border border-[#707070]">Browse...</button>
                    </div>
                  </div>
                </fieldset>

                <button className="w-full py-2 bg-[#FF9800] text-white font-bold rounded-sm border border-[#f57c00] shadow-sm">
                  Run Batch VLOOKUP Mapper
                </button>

                <div className="bg-white border border-[#7f9db9] p-2 font-mono text-[10px] h-28 overflow-y-auto text-slate-800 leading-tight">
                  <p>--- Definitive ID Mapper Console ---</p>
                  <p>Joining Definitive IDs onto TAM 2022, 2023, 2024...</p>
                  <p>Appended Combined_ID, ID 1, ID 2 to market reports.</p>
                  <p>Batch mapping finished successfully.</p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right: Live Hotspot Inspector & Contrast (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  UX Friction Inspector
                </h3>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                activePoint.severity === 'Critical' 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {activePoint.severity} Severity
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identified Problem</p>
              <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                {activePoint.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                {activePoint.legacyDescription}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Why It Causes User Friction</p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                {activePoint.whyItHurts}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Modern Solution Implemented</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 font-medium">
                {activePoint.modernSolution}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-mono text-slate-500">
                {activePoint.heuristic}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
