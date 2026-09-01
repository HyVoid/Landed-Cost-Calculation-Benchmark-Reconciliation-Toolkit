import React, { useState } from 'react';
import { ActiveTab } from '../types';
import {
  Layers,
  Database,
  Calculator,
  GitCompare,
  AlertTriangle,
  FileText,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  Shield,
  X,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lastSaved: string;
  caseId: string;
  anomalyCount?: number;
  onOpenCsvModal: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onResetData: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lastSaved,
  caseId,
  anomalyCount = 0,
  onOpenCsvModal,
  onExportBackup,
  onImportBackup,
  onResetData,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tabs: {
    id: ActiveTab;
    code: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      id: '00_SETUP_PARAMS',
      code: '00',
      label: 'Setup & Parameters',
      description: 'Exchange rates & tolerances',
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: '01_SKU_MASTER_INPUT',
      code: '01',
      label: 'SKU Master Input',
      description: 'PO, quantities, weights, FOB',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: '02_COST_POOL_INPUT',
      code: '02',
      label: 'Cost Pool & Rates',
      description: 'Freight, duties & port THC',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: '03_PRACTITIONER_CALC',
      code: '03',
      label: 'Benchmark Landed Cost',
      description: 'Authoritative ASC 330 engine',
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      id: '04_WEBSERVICE_RECON',
      code: '04',
      label: 'Web Service Recon',
      description: '3-Tier audit & comparison',
      icon: <GitCompare className="w-4 h-4" />,
    },
    {
      id: '05_VARIANCE_DIAGNOSIS',
      code: '05',
      label: 'Variance Diagnosis',
      description: 'Root cause taxonomy & logs',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: anomalyCount > 0 ? `${anomalyCount} Alert` : undefined,
    },
    {
      id: '06_EXECUTIVE_SUMMARY',
      code: '06',
      label: 'Executive Summary',
      description: 'Auditor sign-off & export',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const formatLastSavedTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-[#1A1A2E] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-[#051C2C] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs shrink-0">
            LC
          </div>
          <div>
            <div className="font-heading font-bold text-base text-[#051C2C] leading-none tracking-tight">
              LANDED COST
            </div>
            <div className="text-[10px] text-[#888888] font-bold tracking-wider uppercase mt-0.5">
              Benchmark Toolkit
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Case ID Badge */}
      <div className="px-5 py-2.5 bg-[#F5F5F2]/70 border-b border-[#E5E5E5] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
          Case Ref:
        </span>
        <span className="font-mono font-bold text-[#051C2C] text-xs bg-white px-2 py-0.5 rounded border border-[#E5E5E5]">
          {caseId}
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888888]">
          Workbook Worksheets
        </div>

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`sidebar-tab-${tab.id}`}
              onClick={() => handleSelectTab(tab.id)}
              className={`w-full text-left rounded-[10px] p-2.5 transition-all duration-200 flex items-start gap-3 relative group cursor-pointer ${
                isActive
                  ? 'bg-[#2251FF]/[0.08] backdrop-blur-md border border-[#2251FF]/25 shadow-xs text-[#051C2C]'
                  : 'text-[#051C2C] hover:bg-[#F5F5F2] border border-transparent'
              }`}
            >
              {/* Left Accent indicator for active */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#2251FF] rounded-r-full shadow-xs" />
              )}

              {/* Icon / Code badge */}
              <div
                className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 text-xs font-bold font-mono transition-colors ${
                  isActive
                    ? 'bg-[#2251FF]/15 text-[#2251FF] border border-[#2251FF]/20'
                    : 'bg-[#F5F5F2] text-[#051C2C]/70 group-hover:bg-white group-hover:text-[#051C2C] group-hover:shadow-xs'
                }`}
              >
                {tab.icon}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-[#051C2C]' : 'text-[#051C2C]/85'
                    }`}
                  >
                    {tab.label}
                  </span>

                  {tab.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full whitespace-nowrap ${
                        isActive
                          ? 'bg-[#2251FF] text-white'
                          : 'bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/20'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    isActive ? 'text-[#2251FF]/80 font-medium' : 'text-[#888888]'
                  }`}
                >
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons & Utilities */}
      <div className="p-4 border-t border-[#E5E5E5] space-y-2.5 bg-white">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#888888] px-1">
          Data &amp; Operations
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenCsvModal}
            className="action-btn justify-center text-[11px] py-1.5 w-full"
            title="Bulk CSV Import for SKUs or Cost Pool"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2251FF]" />
            <span>CSV Import</span>
          </button>

          <button
            onClick={onExportBackup}
            className="action-btn action-btn-primary justify-center text-[11px] py-1.5 w-full"
            title="Export Full JSON Backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onImportBackup}
            className="action-btn justify-center text-[11px] py-1.5 w-full"
            title="Import JSON Backup"
          >
            <Upload className="w-3.5 h-3.5 text-[#051C2C]" />
            <span>Import</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowResetConfirm(!showResetConfirm)}
              className="action-btn action-btn-danger justify-center text-[11px] py-1.5 w-full"
              title="Reset to Benchmark Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {showResetConfirm && (
              <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-white rounded-lg shadow-lg border border-[#E5E5E5] z-50 animate-fade-up">
                <div className="text-xs font-semibold text-[#051C2C] mb-1">
                  Reset Default Data?
                </div>
                <div className="text-[10px] text-[#888888] mb-2 leading-relaxed">
                  Restores standard 3-SKU test case.
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 text-[10px] text-[#051C2C] bg-[#F5F5F2] rounded hover:bg-[#E5E5E5]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onResetData();
                      setShowResetConfirm(false);
                    }}
                    className="px-2 py-1 text-[10px] font-bold text-white bg-[#DC2626] rounded hover:bg-[#B91C1C]"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto-save & Local Storage Status */}
        <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[10px] text-[#888888]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
            <span>Saved {formatLastSavedTime(lastSaved)}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] text-[#051C2C] bg-[#F5F5F2] px-1.5 py-0.5 rounded">
            <Lock className="w-2.5 h-2.5 text-[#00C853]" />
            <span>Local Only</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 border-r border-[#E5E5E5] bg-white z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Overlay */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-xl z-50 animate-fade-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
