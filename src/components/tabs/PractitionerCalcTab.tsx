import React from 'react';
import { PractitionerSkuResult } from '../../types';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/calcEngine';
import { Calculator, Download, Info, TrendingUp, CheckCircle, Percent } from 'lucide-react';
import { downloadFile } from '../../utils/csvHelper';

interface PractitionerCalcTabProps {
  practResults: PractitionerSkuResult[];
}

export const PractitionerCalcTab: React.FC<PractitionerCalcTabProps> = ({
  practResults,
}) => {
  const totalLandedCost = practResults.reduce(
    (sum, r) => sum + r.practTotalLanded,
    0
  );
  const totalFobCommercial = practResults.reduce(
    (sum, r) => sum + r.skuCommercialValue,
    0
  );
  const totalFreightAllocated = practResults.reduce(
    (sum, r) => sum + r.allocFreight,
    0
  );
  const totalDutyAllocated = practResults.reduce(
    (sum, r) => sum + r.allocDuty,
    0
  );
  const totalHandlingAllocated = practResults.reduce(
    (sum, r) => sum + r.allocHandling,
    0
  );
  const totalOtherAllocated = practResults.reduce(
    (sum, r) => sum + r.allocOther,
    0
  );

  const avgMultiplier =
    totalFobCommercial > 0 ? totalLandedCost / totalFobCommercial : 1.0;

  const maxLandedValue = Math.max(
    ...practResults.map((r) => r.practTotalLanded),
    1
  );

  const handleExportCsv = () => {
    const headers = [
      'SKU_Code',
      'SKU_Description',
      'Qty_Units',
      'Commercial_Value_FOB',
      'Alloc_Freight_USD',
      'Alloc_Duty_USD',
      'Alloc_Handling_USD',
      'Alloc_Other_USD',
      'Pract_Total_Landed_USD',
      'Pract_Unit_Landed_USD',
      'Landed_Cost_Multiplier',
    ];

    const rows = practResults.map((r) => [
      `"${r.skuCode}"`,
      `"${r.skuDescription}"`,
      r.qtyUnits,
      r.skuCommercialValue.toFixed(2),
      r.allocFreight.toFixed(2),
      r.allocDuty.toFixed(2),
      r.allocHandling.toFixed(2),
      r.allocOther.toFixed(2),
      r.practTotalLanded.toFixed(2),
      r.practUnitLanded.toFixed(2),
      r.landedMultiplier.toFixed(4),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadFile(csv, 'Practitioner_Benchmark_Calculations.csv', 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
            Layer 03 • Authoritative Practitioner Benchmark Calculation Engine
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-[28px] text-[#051C2C] tracking-tight">
            Practitioner Benchmark Landed Cost
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#051C2C] bg-white border border-[#E8E8E6] rounded-lg hover:bg-[#F5F5F2] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#051C2C]" />
            Export Benchmark CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Total Landed Value (Inventory Cost)
          </div>
          <div className="font-heading font-bold text-2xl text-[#051C2C] mt-1">
            {formatCurrency(totalLandedCost)}
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            FOB Value ({formatCurrency(totalFobCommercial)}) + Allocated ({formatCurrency(totalLandedCost - totalFobCommercial)})
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Average Landed Multiplier
          </div>
          <div className="font-heading font-bold text-2xl text-[#2251FF] mt-1">
            {avgMultiplier.toFixed(2)}x{' '}
            <span className="text-xs font-normal text-[#888888]">
              (+{((avgMultiplier - 1) * 100).toFixed(2)}% on FOB)
            </span>
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            Total logistics &amp; duty markup ratio
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Freight &amp; Duty Absorbed
          </div>
          <div className="font-heading font-bold text-2xl text-[#051C2C] mt-1">
            {formatCurrency(totalFreightAllocated + totalDutyAllocated)}
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            Freight: {formatCurrency(totalFreightAllocated)} | Duty: {formatCurrency(totalDutyAllocated)}
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Handling &amp; Surcharges
          </div>
          <div className="font-heading font-bold text-2xl text-[#051C2C] mt-1">
            {formatCurrency(totalHandlingAllocated + totalOtherAllocated)}
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            Port THC: {formatCurrency(totalHandlingAllocated)} | Ins/Other: {formatCurrency(totalOtherAllocated)}
          </div>
        </div>
      </div>

      {/* Insight & Math Explanation Box */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1A1A2E] leading-relaxed">
            <span className="font-semibold text-[#051C2C]">Mathematical Benchmark Formulation: </span>
            For each cost item k with capitalized amount C(k) and allocation basis B, the weight assigned to SKU i is
            w(i,k) = Measure(i,B) / Sum(Measure(j,B)). The total landed cost is calculated as
            Total Landed Cost(i) = Commercial Value(i) + Sum(w(i,k) × C(k)), and
            Unit Landed Cost(i) = Total Landed Cost(i) / Qty(i).
            Period expenses are strictly excluded in compliance with ASC 330.
          </div>
        </div>
      </div>

      {/* Main Benchmark Output Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="table-header border-b border-[#E8E8E6]">
                <th className="py-2.5 px-3">SKU Code (A)</th>
                <th className="py-2.5 px-3 min-w-[170px]">Description (B)</th>
                <th className="py-2.5 px-2.5 text-right w-20">Qty (C)</th>
                <th className="py-2.5 px-3 text-right w-28">FOB Value (D)</th>
                <th className="py-2.5 px-2.5 text-right w-28">Alloc Freight (E)</th>
                <th className="py-2.5 px-2.5 text-right w-28">Alloc Duty (F)</th>
                <th className="py-2.5 px-2.5 text-right w-24">Alloc Port (G)</th>
                <th className="py-2.5 px-2.5 text-right w-24">Alloc Other (H)</th>
                <th className="py-2.5 px-3 text-right w-44 bg-[#051C2C]/5 font-bold">
                  Total Landed Cost (I)
                </th>
                <th className="py-2.5 px-3 text-right w-28 bg-[#051C2C]/5 font-bold">
                  Unit Cost (J)
                </th>
                <th className="py-2.5 px-3 text-right w-28 bg-[#2251FF]/5 text-[#2251FF] font-bold">
                  Multiplier (K)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {practResults.map((row) => {
                const barWidthPct = Math.min(
                  100,
                  Math.max(5, (row.practTotalLanded / maxLandedValue) * 100)
                );
                return (
                  <tr
                    key={row.skuCode}
                    className="hover:bg-[#F5F5F2]/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-[#051C2C] font-mono">
                      {row.skuCode}
                    </td>
                    <td className="py-2.5 px-3 text-[#1A1A2E]">{row.skuDescription}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono">{formatNumber(row.qtyUnits, 0)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#051C2C]">
                      {formatCurrency(row.skuCommercialValue)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-[#051C2C]">
                      {formatCurrency(row.allocFreight)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-[#051C2C]">
                      {formatCurrency(row.allocDuty)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-[#051C2C]">
                      {formatCurrency(row.allocHandling)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-[#051C2C]">
                      {formatCurrency(row.allocOther)}
                    </td>

                    {/* Column I: Total Landed Cost with Inline Data Bar */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/5">
                      <div>{formatCurrency(row.practTotalLanded)}</div>
                      {/* Inline Data Bar */}
                      <div className="w-full h-1 bg-[#051C2C]/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#2251FF] rounded-full transition-all duration-300"
                          style={{ width: `${barWidthPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Column J: Unit Landed Cost */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/5">
                      {formatCurrency(row.practUnitLanded)}
                    </td>

                    {/* Column K: Multiplier */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#2251FF] bg-[#2251FF]/5">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-white shadow-xs border border-[#2251FF]/20">
                        {row.landedMultiplier.toFixed(2)}x
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer */}
            <tfoot>
              <tr className="bg-[#F5F5F2] font-semibold text-[#051C2C] border-t-2 border-[#E8E8E6]">
                <td colSpan={3} className="py-3 px-3 text-right uppercase text-[11px] tracking-wider text-[#888888]">
                  Benchmark Grand Totals:
                </td>
                <td className="py-3 px-3 text-right font-mono">{formatCurrency(totalFobCommercial)}</td>
                <td className="py-3 px-2.5 text-right font-mono">{formatCurrency(totalFreightAllocated)}</td>
                <td className="py-3 px-2.5 text-right font-mono">{formatCurrency(totalDutyAllocated)}</td>
                <td className="py-3 px-2.5 text-right font-mono">{formatCurrency(totalHandlingAllocated)}</td>
                <td className="py-3 px-2.5 text-right font-mono">{formatCurrency(totalOtherAllocated)}</td>
                <td className="py-3 px-3 text-right font-mono font-bold bg-[#051C2C]/10 text-[#051C2C]">
                  {formatCurrency(totalLandedCost)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#888888] bg-[#051C2C]/10">—</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-[#2251FF] bg-[#2251FF]/10">
                  {avgMultiplier.toFixed(2)}x
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
