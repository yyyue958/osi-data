import React from 'react';
import { AccessoryOrderRow, KneeProcedureRow, InstalledBaseRow } from './types';
import { Navbar } from './components/Navbar';
import { ModernSuite } from './components/ModernSuite/ModernSuite';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  // App-level datasets now initialize as completely empty arrays
  const [accessoryData, setAccessoryData] = useLocalStorage<AccessoryOrderRow[]>('mizuho_accessory_data', []);
  const [kneeData, setKneeData] = useLocalStorage<KneeProcedureRow[]>('mizuho_knee_data', []);
  const [installedData, setInstalledData] = useLocalStorage<InstalledBaseRow[]>('mizuho_installed_data', []);

  // "Clear All Data" button for the Navbar
  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to wipe all saved data and start fresh?')) {
      localStorage.clear();
      setAccessoryData([]);
      setKneeData([]);
      setInstalledData([]);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar onResetDemoData={handleResetDemoData} />

      {/* Main Content Area - Now permanently showing the Modern Suite */}
      <main className="flex-1">
        <ModernSuite
          accessoryData={accessoryData}
          kneeData={kneeData}
          installedData={installedData}
        />
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
