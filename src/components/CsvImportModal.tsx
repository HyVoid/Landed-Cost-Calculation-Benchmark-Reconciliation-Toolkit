import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SkuItem, CostPoolItem } from '../types';
import {
  exportSkusToCsv,
  exportCostPoolToCsv,
  parseSkusFromCsv,
  parseCostPoolFromCsv,
  downloadFile,
} from '../utils/csvHelper';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSkus: (skus: SkuItem[], replace: boolean) => void;
  onImportCosts: (costs: CostPoolItem[], replace: boolean) => void;
  currentSkus: SkuItem[];
  currentCosts: CostPoolItem[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportSkus,
  onImportCosts,
  currentSkus,
  currentCosts,
}) => {
  const [targetType, setTargetType] = useState<'sku' | 'cost'>('sku');
  const [csvText, setCsvText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [previewError, setPreviewError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text || '');
      setPreviewError(null);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    if (targetType === 'sku') {
      const sample = exportSkusToCsv(currentSkus);
      downloadFile(sample, 'SKU_Master_Template.csv', 'text/csv;charset=utf-8;');
    } else {
      const sample = exportCostPoolToCsv(currentCosts);
      downloadFile(sample, 'Cost_Pool_Template.csv', 'text/csv;charset=utf-8;');
    }
  };

  const handleExecuteImport = () => {
    if (!csvText.trim()) {
      setPreviewError('Please select a file or paste valid CSV content.');
      return;
    }

    try {
      if (targetType === 'sku') {
        const parsed = parseSkusFromCsv(csvText);
        if (parsed.length === 0) {
          setPreviewError('No valid SKU rows parsed. Please check column headers and format.');
          return;
        }
        onImportSkus(parsed, importMode === 'replace');
      } else {
        const parsed = parseCostPoolFromCsv(csvText);
        if (parsed.length === 0) {
          setPreviewError('No valid Cost items parsed. Please check column headers and format.');
          return;
        }
        onImportCosts(parsed, importMode === 'replace');
      }
      onClose();
    } catch (err: any) {
      setPreviewError(err.message || 'Failed to parse CSV content.');
    }
  };

  return (
    <div
      id="csv-import-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(5, 28, 44, 0.4)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E8E8E6] overflow-hidden animate-fade-up"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E6] bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#2251FF]" />
            <h3 className="font-heading font-bold text-lg text-[#051C2C]">
              Bulk CSV Data Import
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#888888] hover:text-[#051C2C] hover:bg-[#F5F5F2]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Sheet Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#051C2C] uppercase tracking-wider mb-2">
              Select Target Data Layer
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setTargetType('sku');
                  setPreviewError(null);
                }}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  targetType === 'sku'
                    ? 'border-[#2251FF] bg-[#2251FF]/5 text-[#051C2C] ring-1 ring-[#2251FF]'
                    : 'border-[#E8E8E6] bg-[#FFFFFF] text-[#888888] hover:border-[#051C2C]/30'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#051C2C]">01 SKU Master Input</div>
                  <div className="text-[11px] text-[#888888]">
                    PO, Weights, Volumes & Customs Unit Values
                  </div>
                </div>
                {targetType === 'sku' && <CheckCircle2 className="w-4 h-4 text-[#2251FF]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetType('cost');
                  setPreviewError(null);
                }}
                className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  targetType === 'cost'
                    ? 'border-[#2251FF] bg-[#2251FF]/5 text-[#051C2C] ring-1 ring-[#2251FF]'
                    : 'border-[#E8E8E6] bg-[#FFFFFF] text-[#888888] hover:border-[#051C2C]/30'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#051C2C]">02 Cost Pool Invoices</div>
                  <div className="text-[11px] text-[#888888]">
                    Freight, Duties, Port Charges & Allocation Rules
                  </div>
                </div>
                {targetType === 'cost' && <CheckCircle2 className="w-4 h-4 text-[#2251FF]" />}
              </button>
            </div>
          </div>

          {/* Import Mode Options */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F5F2] border border-[#E8E8E6]">
            <div>
              <span className="text-xs font-semibold text-[#051C2C]">Import Strategy:</span>
              <span className="text-xs text-[#888888] ml-2">
                {importMode === 'replace'
                  ? 'Replace all existing records with imported CSV'
                  : 'Append new rows to existing table'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-[#E8E8E6]">
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  importMode === 'replace'
                    ? 'bg-[#051C2C] text-white'
                    : 'text-[#888888] hover:text-[#051C2C]'
                }`}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  importMode === 'append'
                    ? 'bg-[#051C2C] text-white'
                    : 'text-[#888888] hover:text-[#051C2C]'
                }`}
              >
                Append
              </button>
            </div>
          </div>

          {/* File Upload / Paste Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#051C2C] uppercase tracking-wider">
                Upload File or Paste CSV Text
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1 text-xs text-[#2251FF] hover:underline font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample Template
              </button>
            </div>

            <div className="border-2 border-dashed border-[#E8E8E6] hover:border-[#2251FF]/50 rounded-xl p-4 text-center bg-[#F5F5F2]/40 transition-colors">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                id="csv-file-input"
                className="hidden"
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#E8E8E6] flex items-center justify-center text-[#2251FF]">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-[#051C2C]">
                  Click to browse CSV file or drag and drop here
                </div>
                <div className="text-[11px] text-[#888888]">
                  UTF-8 CSV format supported
                </div>
              </label>
            </div>

            <textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setPreviewError(null);
              }}
              placeholder={`Or paste raw CSV text here (comma-separated with header row)...`}
              rows={5}
              className="w-full text-xs font-mono p-3 rounded-lg border border-[#E8E8E6] bg-[#FFFFFF] focus:outline-none focus:border-[#2251FF] focus:ring-1 focus:ring-[#2251FF]"
            />
          </div>

          {previewError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#D32F2F]/10 border border-[#D32F2F]/20 text-[#D32F2F] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{previewError}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E8E6] bg-[#F5F5F2]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#051C2C] bg-white border border-[#E8E8E6] rounded-lg hover:bg-[#F5F5F2] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2251FF] hover:bg-[#2251FF]/90 rounded-lg transition-colors shadow-xs"
          >
            Process &amp; Load Data
          </button>
        </div>
      </div>
    </div>
  );
};
