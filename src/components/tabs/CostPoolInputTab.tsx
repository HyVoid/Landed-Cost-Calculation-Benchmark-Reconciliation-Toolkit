import React from 'react';
import { CostPoolItem, SetupParams, CostCategory, AllocationBasis, AccountingTreatment } from '../../types';
import { getFxRate, formatCurrency, formatNumber } from '../../utils/calcEngine';
import { Plus, Trash2, Copy, FileSpreadsheet, Info, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { exportCostPoolToCsv, downloadFile } from '../../utils/csvHelper';

interface CostPoolInputTabProps {
  costPool: CostPoolItem[];
  params: SetupParams;
  onUpdateCostPool: (costs: CostPoolItem[]) => void;
  onOpenCsvModal: () => void;
}

export const CostPoolInputTab: React.FC<CostPoolInputTabProps> = ({
  costPool,
  params,
  onUpdateCostPool,
  onOpenCsvModal,
}) => {
  const handleCostFieldChange = (
    id: string,
    field: keyof CostPoolItem,
    value: string | number
  ) => {
    const updated = costPool.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        [field]: value,
      };
    });
    onUpdateCostPool(updated);
  };

  const handleAddCost = () => {
    const nextNum = costPool.length + 1;
    const newCost: CostPoolItem = {
      id: `cost-${Date.now()}`,
      costId: `C-${String(nextNum).padStart(3, '0')}`,
      costCategory: 'Freight',
      costSubcategory: 'Additional Logistics Charge',
      invoiceNumber: `INV-${nextNum}00`,
      invoiceCurrency: 'USD',
      invoiceAmount: 500.0,
      allocationBasis: 'Gross Weight',
      accountingTreatment: 'Capitalize to Inventory',
    };
    onUpdateCostPool([...costPool, newCost]);
  };

  const handleDuplicateCost = (cost: CostPoolItem) => {
    const newCost: CostPoolItem = {
      ...cost,
      id: `cost-${Date.now()}`,
      costId: `${cost.costId}-B`,
      costSubcategory: `${cost.costSubcategory} (Copy)`,
    };
    onUpdateCostPool([...costPool, newCost]);
  };

  const handleDeleteCost = (id: string) => {
    if (costPool.length <= 1) return;
    onUpdateCostPool(costPool.filter((c) => c.id !== id));
  };

  const handleExportCsv = () => {
    const csv = exportCostPoolToCsv(costPool);
    downloadFile(csv, 'Cost_Pool_Invoices.csv', 'text/csv;charset=utf-8;');
  };

  // Capitalized vs Expensed breakdown
  const capitalizedCosts = costPool.filter(
    (c) => c.accountingTreatment === 'Capitalize to Inventory'
  );
  const periodExpenses = costPool.filter(
    (c) => c.accountingTreatment === 'Period Expense'
  );

  const totalCapitalizedUsd = capitalizedCosts.reduce((sum, c) => {
    const fx = getFxRate(c.invoiceCurrency, params);
    return sum + (Number(c.invoiceAmount) || 0) * fx;
  }, 0);

  const totalPeriodExpenseUsd = periodExpenses.reduce((sum, c) => {
    const fx = getFxRate(c.invoiceCurrency, params);
    return sum + (Number(c.invoiceAmount) || 0) * fx;
  }, 0);

  const totalAllInvoicesUsd = totalCapitalizedUsd + totalPeriodExpenseUsd;

  const categoryList: CostCategory[] = [
    'Freight',
    'Duty',
    'Surcharge',
    'Insurance',
    'Brokerage',
    'Other',
  ];

  const basisList: AllocationBasis[] = [
    'Gross Weight',
    'Volume',
    'Commercial Value',
    'Customs Value',
    'Quantity Units',
  ];

  const treatmentList: AccountingTreatment[] = [
    'Capitalize to Inventory',
    'Period Expense',
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
            Layer 02 • Independent Invoice Cost Pool &amp; Allocation Strategy
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-[28px] text-[#051C2C] tracking-tight">
            Cost Pool &amp; Allocation Rules
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCsvModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#051C2C] bg-white border border-[#E8E8E6] rounded-lg hover:bg-[#F5F5F2] transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2251FF]" />
            Bulk CSV Import
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#051C2C] bg-white border border-[#E8E8E6] rounded-lg hover:bg-[#F5F5F2] transition-colors"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleAddCost}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2251FF] rounded-lg hover:bg-[#2251FF]/90 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Invoice Item
          </button>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4 border-l-4 border-[#2251FF]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
              Capitalized to Inventory (Landed Cost Pool)
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C853]/10 text-[#00C853]">
              ASC 330 / IAS 2 Active
            </span>
          </div>
          <div className="font-heading font-bold text-2xl text-[#051C2C] mt-1.5">
            {formatCurrency(totalCapitalizedUsd)}
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            {capitalizedCosts.length} invoices entering SKU cost allocation pool
          </div>
        </div>

        <div className="card-elevated p-4 border-l-4 border-[#888888]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
              Period Operating Expenses
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#888888]/10 text-[#888888]">
              Excluded from Landing
            </span>
          </div>
          <div className="font-heading font-bold text-2xl text-[#051C2C] mt-1.5">
            {formatCurrency(totalPeriodExpenseUsd)}
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            {periodExpenses.length} administrative invoices expensed directly in period
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Total Invoices Gross USD
          </div>
          <div className="font-heading font-bold text-2xl text-[#051C2C] mt-1.5">
            {formatCurrency(totalAllInvoicesUsd)}
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            {costPool.length} total supplier and customs invoices recorded
          </div>
        </div>
      </div>

      {/* Insight Callout */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1A1A2E] leading-relaxed">
            <span className="font-semibold text-[#051C2C]">Decoupled Strategy Mapping: </span>
            Each line item independently specifies its billing currency (auto-converted using Layer 00 FX Rates),
            its exact allocation driver (<span className="font-medium">Gross Weight, Volume, Commercial Value, Customs Value, or Quantity</span>),
            and its accounting attribute. Only costs flagged as <span className="font-semibold text-[#051C2C]">Capitalize to Inventory</span> are
            eligible to enter the Landed Cost benchmark engine.
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="table-header border-b border-[#E8E8E6]">
                <th className="py-2.5 px-2 text-center w-8">#</th>
                <th className="py-2.5 px-3 w-24">Cost ID (A)</th>
                <th className="py-2.5 px-3 w-32">Category (B)</th>
                <th className="py-2.5 px-3 min-w-[180px]">Subcategory / Description (C)</th>
                <th className="py-2.5 px-3 w-32">Invoice No (D)</th>
                <th className="py-2.5 px-2.5 w-24">Currency (E)</th>
                <th className="py-2.5 px-3 text-right w-32">Invoice Amount (F)</th>
                <th className="py-2.5 px-3 text-right w-24 bg-[#051C2C]/5 font-bold">FX to USD (G)</th>
                <th className="py-2.5 px-3 text-right w-32 bg-[#051C2C]/5 font-bold">Cost in USD (H)</th>
                <th className="py-2.5 px-3 w-40">Allocation Basis (I)</th>
                <th className="py-2.5 px-3 w-44">Accounting Treatment (J)</th>
                <th className="py-2.5 px-2 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {costPool.map((cost, idx) => {
                const fxRate = getFxRate(cost.invoiceCurrency, params);
                const costUsd = (Number(cost.invoiceAmount) || 0) * fxRate;
                const isCapitalized = cost.accountingTreatment === 'Capitalize to Inventory';

                return (
                  <tr
                    key={cost.id}
                    className={`hover:bg-[#F5F5F2]/40 transition-colors ${
                      !isCapitalized ? 'opacity-80' : ''
                    }`}
                  >
                    <td className="py-2 px-2 text-center font-mono text-[#888888] text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Cost ID */}
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        value={cost.costId}
                        onChange={(e) => handleCostFieldChange(cost.id, 'costId', e.target.value)}
                        className="input-cell w-full px-2 py-1 font-mono font-bold text-xs text-[#051C2C]"
                      />
                    </td>

                    {/* Cost Category */}
                    <td className="py-1.5 px-2.5">
                      <select
                        value={cost.costCategory}
                        onChange={(e) =>
                          handleCostFieldChange(
                            cost.id,
                            'costCategory',
                            e.target.value as CostCategory
                          )
                        }
                        className="input-cell w-full px-2 py-1 text-xs font-semibold text-[#051C2C]"
                      >
                        {categoryList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Subcategory */}
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        value={cost.costSubcategory}
                        onChange={(e) =>
                          handleCostFieldChange(cost.id, 'costSubcategory', e.target.value)
                        }
                        className="input-cell w-full px-2 py-1 text-xs"
                      />
                    </td>

                    {/* Invoice Number */}
                    <td className="py-1.5 px-2.5">
                      <input
                        type="text"
                        value={cost.invoiceNumber}
                        onChange={(e) =>
                          handleCostFieldChange(cost.id, 'invoiceNumber', e.target.value)
                        }
                        className="input-cell w-full px-2 py-1 font-mono text-xs"
                      />
                    </td>

                    {/* Invoice Currency */}
                    <td className="py-1.5 px-2">
                      <select
                        value={cost.invoiceCurrency}
                        onChange={(e) =>
                          handleCostFieldChange(cost.id, 'invoiceCurrency', e.target.value)
                        }
                        className="input-cell w-full px-2 py-1 font-mono font-bold text-xs text-[#051C2C]"
                      >
                        {params.fxRates.map((f) => (
                          <option key={f.currency} value={f.currency}>
                            {f.currency}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Invoice Amount */}
                    <td className="py-1.5 px-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={cost.invoiceAmount}
                        onChange={(e) =>
                          handleCostFieldChange(
                            cost.id,
                            'invoiceAmount',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="input-cell w-full px-2 py-1 font-mono text-right text-xs font-semibold text-[#051C2C]"
                      />
                    </td>

                    {/* Auto FX Rate */}
                    <td className="py-2 px-3 text-right font-mono text-[#888888] bg-[#051C2C]/5">
                      {formatNumber(fxRate, 4)}
                    </td>

                    {/* Auto Cost Amount in USD */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/5">
                      {formatCurrency(costUsd)}
                    </td>

                    {/* Allocation Basis */}
                    <td className="py-1.5 px-2.5">
                      <select
                        value={cost.allocationBasis}
                        onChange={(e) =>
                          handleCostFieldChange(
                            cost.id,
                            'allocationBasis',
                            e.target.value as AllocationBasis
                          )
                        }
                        className="input-cell w-full px-2 py-1 text-xs font-medium text-[#051C2C]"
                      >
                        {basisList.map((basis) => (
                          <option key={basis} value={basis}>
                            {basis}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Accounting Treatment */}
                    <td className="py-1.5 px-2.5">
                      <select
                        value={cost.accountingTreatment}
                        onChange={(e) =>
                          handleCostFieldChange(
                            cost.id,
                            'accountingTreatment',
                            e.target.value as AccountingTreatment
                          )
                        }
                        className={`input-cell w-full px-2 py-1 text-xs font-semibold ${
                          isCapitalized
                            ? 'text-[#051C2C]'
                            : 'text-[#888888] bg-[#F5F5F2]'
                        }`}
                      >
                        {treatmentList.map((tr) => (
                          <option key={tr} value={tr}>
                            {tr}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateCost(cost)}
                          className="p-1 text-[#888888] hover:text-[#2251FF] hover:bg-[#2251FF]/10 rounded"
                          title="Duplicate Cost"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {costPool.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCost(cost.id)}
                            className="p-1 text-[#888888] hover:text-[#D32F2F] hover:bg-[#D32F2F]/10 rounded"
                            title="Delete Cost"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer */}
            <tfoot>
              <tr className="bg-[#F5F5F2] font-semibold text-[#051C2C] border-t-2 border-[#E8E8E6]">
                <td colSpan={7} className="py-2.5 px-3 text-right uppercase text-[11px] tracking-wider text-[#888888]">
                  Total All Invoices (USD):
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold bg-[#051C2C]/10 text-[#051C2C]" colSpan={2}>
                  {formatCurrency(totalAllInvoicesUsd)}
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-left text-[11px] text-[#888888]">
                  ({formatCurrency(totalCapitalizedUsd)} Capitalized to Landed Cost)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
