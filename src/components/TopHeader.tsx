import React from 'react';
import { ActiveTab, SetupParams } from '../types';
import {
  Menu,
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface TopHeaderProps {
  activeTab: ActiveTab;
  params: SetupParams;
  onOpenMobileSidebar: () => void;
  onOpenCsvModal: () => void;
  onExportBackup: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  params,
  onOpenMobileSidebar,
  onOpenCsvModal,
  onExportBackup,
}) => {
  const getTabInfo = (tab: ActiveTab) => {
    switch (tab) {
      case '00_SETUP_PARAMS':
        return {
          layer: 'Layer 00',
          title: 'System Setup & Parameters',
          subtitle: 'Multi-currency exchange rate tables, allocation base definitions, and audit tolerances',
        };
      case '01_SKU_MASTER_INPUT':
        return {
          layer: 'Layer 01',
          title: 'SKU Commercial Master Input',
          subtitle: 'Commercial invoice line items, purchase orders, quantities, net/gross weights, and FOB values',
        };
      case '02_COST_POOL_INPUT':
        return {
          layer: 'Layer 02',
          title: 'Invoiced Cost Pool & Rates',
          subtitle: 'International ocean freight, customs tariff duty, port handling THC, and ASC 330 capitalization',
        };
      case '03_PRACTITIONER_CALC':
        return {
          layer: 'Layer 03',
          title: 'Practitioner Benchmark Calculation',
          subtitle: 'Authoritative landing cost matrix distribution by gross weight, cubic volume, and commercial value',
        };
      case '04_WEBSERVICE_RECON':
        return {
          layer: 'Layer 04',
          title: 'Web Service Multi-Tier Reconciliation',
          subtitle: 'Automated 3-tier progressive audit comparing benchmark landed cost against client web service API outputs',
        };
      case '05_VARIANCE_DIAGNOSIS':
        return {
          layer: 'Layer 05',
          title: 'Variance Diagnosis & Root Cause Attribution',
          subtitle: 'Structured taxonomy log classifying allocation bias, base calculation shifts, and period expense inclusion',
        };
      case '06_EXECUTIVE_SUMMARY':
        return {
          layer: 'Layer 06',
          title: 'Executive Audit Summary & Sign-off',
          subtitle: 'Consolidated match rate certification, net shipment variance, and engineering optimization advice',
        };
      default:
        return {
          layer: 'Layer',
          title: 'Landed Cost Benchmark',
          subtitle: 'Reconciliation and Audit Toolkit',
        };
    }
  };

  const currentInfo = getTabInfo(activeTab);

  return (
    <header className="w-full bg-white border-b border-[#E5E5E5] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile menu toggle & Current page breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-[#051C2C] hover:bg-[#F5F5F2] border border-[#E5E5E5]"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2251FF] bg-[#2251FF]/10 px-2 py-0.5 rounded">
              {currentInfo.layer}
            </span>
            <span className="text-xs text-[#888888] hidden sm:inline">•</span>
            <span className="text-xs text-[#888888] font-mono hidden sm:inline">
              Shipment: {params.shipmentId}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#051C2C] truncate tracking-tight">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Quick action toolbar */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenCsvModal}
          className="action-btn text-xs hidden sm:inline-flex"
          title="Import CSV Data"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#2251FF]" />
          <span>CSV Import</span>
        </button>

        <button
          onClick={onExportBackup}
          className="action-btn action-btn-primary text-xs"
          title="Export JSON Snapshot"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Snapshot</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>
    </header>
  );
};
