import React from 'react';
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

  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to reset all data back to the default samples?')) {
      setAccessoryData([...SAMPLE_ACCESSORY_DATA]);
      setKneeData([...SAMPLE_KNEE_PROCEDURES_DATA]);
      setInstalledData([...SAMPLE_INSTALLED_BASE_DATA]);
      localStorage.clear();
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
          <p>
            Mizuho Data Processing Suite
          </p>
        </div>
      </footer>
    </div>
  );
}
