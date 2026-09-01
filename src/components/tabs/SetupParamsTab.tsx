import React, { useState } from 'react';
import { SetupParams, FxRateEntry, AllocationBasis } from '../../types';
import { Sliders, Plus, Trash2, ShieldCheck, Scale, DollarSign, Info } from 'lucide-react';
import { formatNumber, formatPercent } from '../../utils/calcEngine';

interface SetupParamsTabProps {
  params: SetupParams;
  onUpdateParams: (newParams: SetupParams) => void;
}

export const SetupParamsTab: React.FC<SetupParamsTabProps> = ({
  params,
  onUpdateParams,
}) => {
  const [newCurrency, setNewCurrency] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleChange = <K extends keyof SetupParams>(field: K, value: SetupParams[K]) => {
    onUpdateParams({
      ...params,
      [field]: value,
    });
  };

  const handleRateChange = (index: number, newRateValue: number) => {
    const updatedRates = [...params.fxRates];
    updatedRates[index] = {
      ...updatedRates[index],
      rate: Math.max(0.0001, newRateValue),
    };
    handleChange('fxRates', updatedRates);
  };

  const handleAddCurrency = () => {
    if (!newCurrency.trim() || isNaN(parseFloat(newRate))) return;
    const code = newCurrency.trim().toUpperCase();
    if (params.fxRates.some((f) => f.currency === code)) return;

    const updatedRates: FxRateEntry[] = [
      ...params.fxRates,
      {
        currency: code,
        rate: parseFloat(newRate) || 1.0,
        description: newDesc.trim() || `${code} to USD Exchange Rate`,
      },
    ];
    handleChange('fxRates', updatedRates);
    setNewCurrency('');
    setNewRate('');
    setNewDesc('');
  };

  const handleDeleteCurrency = (code: string) => {
    if (code === 'USD') return; // Cannot delete base currency
    const updatedRates = params.fxRates.filter((f) => f.currency !== code);
    handleChange('fxRates', updatedRates);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
            Layer 00 • Global System Parameters &amp; Assumptions
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-[28px] text-[#051C2C] tracking-tight">
            System Parameters &amp; Valuation Policy
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2251FF]/10 text-[#2251FF] border border-[#2251FF]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Single Source of Truth
          </span>
        </div>
      </div>

      {/* Insight Directive Block */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1A1A2E] leading-relaxed">
            <span className="font-semibold text-[#051C2C]">Zero-Hardcoding Architecture: </span>
            All calculation engines dynamically reference the exchange rate dictionary, tolerance
            thresholds, and allocation dictionaries defined here. Updating exchange rates or
            tolerances here propagates instantaneously across all 7 sheets without formula overrides.
          </div>
        </div>
      </div>

      {/* Grid Zone: Case Meta & Tolerances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Case Meta Card */}
        <div className="lg:col-span-6 card-elevated p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#051C2C]" />
              <h2 className="font-heading font-bold text-base text-[#051C2C]">
                Case Identification &amp; Accounting Standards
              </h2>
            </div>
            <span className="text-[11px] text-[#888888] font-mono">00_SETUP_PARAMS!B3:C6</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                Case Identifier (CASE_ID)
              </label>
              <input
                type="text"
                value={params.caseId}
                onChange={(e) => handleChange('caseId', e.target.value)}
                className="input-cell w-full px-3 py-1.5 text-xs font-semibold text-[#051C2C]"
                placeholder="e.g. CASE-2026-001"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                Shipment / BOL ID (SHIPMENT_ID)
              </label>
              <input
                type="text"
                value={params.shipmentId}
                onChange={(e) => handleChange('shipmentId', e.target.value)}
                className="input-cell w-full px-3 py-1.5 text-xs font-semibold text-[#051C2C]"
                placeholder="e.g. SH-US-98231"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                Base Currency (BASE_CURRENCY)
              </label>
              <input
                type="text"
                value={params.baseCurrency}
                onChange={(e) => handleChange('baseCurrency', e.target.value.toUpperCase())}
                className="input-cell w-full px-3 py-1.5 text-xs font-semibold text-[#051C2C]"
                placeholder="USD"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                Accounting Policy Standard
              </label>
              <select
                value={params.accountingStandard}
                onChange={(e) => handleChange('accountingStandard', e.target.value)}
                className="input-cell w-full px-3 py-1.5 text-xs font-semibold text-[#051C2C]"
              >
                <option value="ASC 330 (US GAAP)">ASC 330 (US GAAP) — Inventory Capitalization</option>
                <option value="IAS 2 (IFRS)">IAS 2 (IFRS) — Inventories</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tolerances Card */}
        <div className="lg:col-span-6 card-elevated p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#051C2C]" />
              <h2 className="font-heading font-bold text-base text-[#051C2C]">
                Reconciliation Tolerances (Audit Thresholds)
              </h2>
            </div>
            <span className="text-[11px] text-[#888888] font-mono">00_SETUP_PARAMS!C7:C8</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-[#F5F5F2] rounded-lg border border-[#E8E8E6]">
              <div className="text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                Absolute Tolerance (TOLERANCE_ABS)
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-semibold text-[#051C2C]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={params.toleranceAbs}
                  onChange={(e) =>
                    handleChange('toleranceAbs', Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="input-cell w-full px-3 py-1 text-sm font-bold text-[#051C2C]"
                />
              </div>
              <div className="text-[10px] text-[#888888] mt-1.5">
                Variances below this dollar threshold are considered rounded matches.
              </div>
            </div>

            <div className="p-3 bg-[#F5F5F2] rounded-lg border border-[#E8E8E6]">
              <div className="text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                Percentage Tolerance (TOLERANCE_PCT)
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="0.5"
                  value={params.tolerancePct * 100}
                  onChange={(e) =>
                    handleChange(
                      'tolerancePct',
                      Math.max(0, (parseFloat(e.target.value) || 0) / 100)
                    )
                  }
                  className="input-cell w-full px-3 py-1 text-sm font-bold text-[#051C2C]"
                />
                <span className="text-sm font-semibold text-[#051C2C]">%</span>
              </div>
              <div className="text-[10px] text-[#888888] mt-1.5">
                Current threshold: {formatPercent(params.tolerancePct)}. Critical error triggered if &gt; {formatPercent(params.tolerancePct * 10)}.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Zone: FX Rates & Allocation Basis Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Exchange Rate Table Card */}
        <div className="lg:col-span-6 card-elevated p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#051C2C]" />
              <h2 className="font-heading font-bold text-base text-[#051C2C]">
                Exchange Rate Dictionary (FX_Rate_To_USD)
              </h2>
            </div>
            <span className="text-[11px] text-[#888888] font-mono">00_SETUP_PARAMS!B10:C14</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="table-header border-b border-[#E8E8E6]">
                  <th className="py-2 px-3">Currency Code</th>
                  <th className="py-2 px-3 text-right">Rate (1 FX = X USD)</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-2 text-center w-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {params.fxRates.map((fx, idx) => (
                  <tr key={fx.currency} className="hover:bg-[#F5F5F2]/50 transition-colors">
                    <td className="py-2 px-3 font-bold text-[#051C2C]">{fx.currency}</td>
                    <td className="py-2 px-3 text-right">
                      {fx.currency === 'USD' ? (
                        <span className="font-mono text-[#888888]">1.0000 (Base)</span>
                      ) : (
                        <input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          value={fx.rate}
                          onChange={(e) =>
                            handleRateChange(idx, parseFloat(e.target.value) || 1.0)
                          }
                          className="input-cell w-24 px-2 py-0.5 text-right font-mono font-semibold text-[#051C2C]"
                        />
                      )}
                    </td>
                    <td className="py-2 px-3 text-[#888888]">{fx.description}</td>
                    <td className="py-2 px-2 text-center">
                      {fx.currency !== 'USD' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCurrency(fx.currency)}
                          className="text-[#888888] hover:text-[#D32F2F] p-1 rounded"
                          title="Delete Currency"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Currency Bar */}
          <div className="p-3 bg-[#F5F5F2] rounded-lg border border-[#E8E8E6] flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Code (e.g. JPY)"
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
              className="input-cell px-2.5 py-1 text-xs w-28 uppercase font-bold"
              maxLength={4}
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Rate to USD"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="input-cell px-2.5 py-1 text-xs w-28 font-mono"
            />
            <input
              type="text"
              placeholder="Currency name / notes"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="input-cell px-2.5 py-1 text-xs flex-1 min-w-[140px]"
            />
            <button
              type="button"
              onClick={handleAddCurrency}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#051C2C] rounded-md hover:bg-[#051C2C]/90"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Allocation Basis Mapping Dictionary */}
        <div className="lg:col-span-6 card-elevated p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#051C2C]" />
              <h2 className="font-heading font-bold text-base text-[#051C2C]">
                Allocation Basis Key Mapping Dictionary
              </h2>
            </div>
            <span className="text-[11px] text-[#888888] font-mono">00_SETUP_PARAMS!B16:D20</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="table-header border-b border-[#E8E8E6]">
                  <th className="py-2 px-3">Allocation Basis</th>
                  <th className="py-2 px-3">Associated SKU Metric</th>
                  <th className="py-2 px-3">Suitable Cost Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {params.allocationBases.map((b) => (
                  <tr key={b.name} className="hover:bg-[#F5F5F2]/50 transition-colors">
                    <td className="py-2 px-3 font-semibold text-[#051C2C] whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#2251FF]/10 text-[#2251FF]">
                        {b.name}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[#1A1A2E]">{b.mappedField}</td>
                    <td className="py-2 px-3 text-[#888888]">{b.suitableCosts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
