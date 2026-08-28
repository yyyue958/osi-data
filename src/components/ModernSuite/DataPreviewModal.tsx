import React, { useState } from 'react';
import { X, Download, Search, Table, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  data: Record<string, any>[];
  filename?: string;
}

export const DataPreviewModal: React.FC<DataPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  filename = 'export_data.xlsx'
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !data || data.length === 0) return null;

  const columns = Object.keys(data[0] || {});

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Processed_Data');
    XLSX.writeFile(wb, filename);
  };

  const handleExportCsv = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.replace(/\.xlsx$/i, '.csv');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                {subtitle || `Displaying ${filteredData.length} records (${columns.length} columns)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-modal-excel-btn"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export .xlsx</span>
            </button>
            <button
              id="export-modal-csv-btn"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search across all columns (Facility, Order Type, Material...)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredData.length}</span> records
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center text-slate-400">#</th>
                  {columns.map((col) => (
                    <th key={col} className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-slate-800">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-2 px-3 border-r border-slate-100 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      {columns.map((col) => {
                        const val = row[col];
                        return (
                          <td key={col} className="py-2 px-3 border-r border-slate-100 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                            {val !== null && val !== undefined ? String(val) : <span className="text-slate-300 italic">null</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-8 text-center text-slate-400 text-xs">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
