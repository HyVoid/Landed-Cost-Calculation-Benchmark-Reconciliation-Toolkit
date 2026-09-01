import React from 'react';
import {
  CategoryReconSummary,
  PractitionerSkuResult,
  SetupParams,
  SkuReconRow,
} from '../../types';
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatNumber,
} from '../../utils/calcEngine';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Wand2,
  RotateCcw,
  CheckCheck,
  Info,
} from 'lucide-react';

interface WebServiceReconTabProps {
  reconRows: SkuReconRow[];
  categoryRecon: CategoryReconSummary[];
  practResults: PractitionerSkuResult[];
  wsOutputs: Record<string, number | null>;
  params: SetupParams;
  onUpdateWsOutput: (skuCode: string, value: number | null) => void;
  onBatchUpdateWsOutputs: (outputs: Record<string, number | null>) => void;
}

export const WebServiceReconTab: React.FC<WebServiceReconTabProps> = ({
  reconRows,
  categoryRecon,
  practResults,
  wsOutputs,
  params,
  onUpdateWsOutput,
  onBatchUpdateWsOutputs,
}) => {
  const totalPractLanded = practResults.reduce(
    (sum, r) => sum + r.practTotalLanded,
    0
  );

  const enteredWsRows = reconRows.filter((r) => r.wsTotalCost !== null);
  const totalWsLanded = enteredWsRows.reduce(
    (sum, r) => sum + (r.wsTotalCost || 0),
    0
  );

  const netShipmentVariance = totalPractLanded - totalWsLanded;
  const absShipmentVariance = Math.abs(netShipmentVariance);
  const isShipmentMatch =
    absShipmentVariance <= params.toleranceAbs ||
    (totalPractLanded > 0 && absShipmentVariance / totalPractLanded <= params.tolerancePct);

  // Simulation actions
  const handleFillExactMatch = () => {
    const outputs: Record<string, number | null> = {};
    practResults.forEach((r) => {
      outputs[r.skuCode] = Number(r.practTotalLanded.toFixed(2));
    });
    onBatchUpdateWsOutputs(outputs);
  };

  const handleSimulateDemoDiscrepancy = () => {
    const outputs: Record<string, number | null> = {
      'SKU-A101': 27100.0,
      'SKU-B202': 31210.0,
      'SKU-C303': 9790.0,
    };
    onBatchUpdateWsOutputs(outputs);
  };

  const handleClearAllWs = () => {
    const outputs: Record<string, number | null> = {};
    practResults.forEach((r) => {
      outputs[r.skuCode] = null;
    });
    onBatchUpdateWsOutputs(outputs);
  };

  const renderStatusBadge = (status: SkuReconRow['status']) => {
    switch (status) {
      case 'MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30">
            <CheckCircle2 className="w-3 h-3" />
            MATCH
          </span>
        );
      case 'CRITICAL_ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/30 animate-pulse">
            <AlertOctagon className="w-3 h-3" />
            CRITICAL
          </span>
        );
      case 'VARIANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2251FF]/10 text-[#2251FF] border border-[#2251FF]/30">
            <AlertTriangle className="w-3 h-3" />
            VARIANCE
          </span>
        );
      case 'PENDING_INPUT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#888888]/10 text-[#888888]">
            <HelpCircle className="w-3 h-3" />
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
            Layer 04 • Multi-Tier Progressive Reconciliation &amp; Audit Dashboard
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-[28px] text-[#051C2C] tracking-tight">
            Web Service Multi-Tier Reconciliation
          </h1>
        </div>

        {/* Quick Simulation Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateDemoDiscrepancy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#051C2C] bg-white border border-[#E8E8E6] rounded-lg hover:bg-[#F5F5F2] transition-colors shadow-xs"
            title="Load standard benchmark test case outputs (Weight vs Value bias demo)"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#2251FF]" />
            Simulate Benchmark Case
          </button>

          <button
            type="button"
            onClick={handleFillExactMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#051C2C] bg-white border border-[#E8E8E6] rounded-lg hover:bg-[#F5F5F2] transition-colors shadow-xs"
            title="Populate Web Service outputs with exact benchmark numbers"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#00C853]" />
            Fill 100% Match
          </button>

          <button
            type="button"
            onClick={handleClearAllWs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#888888] bg-white border border-[#E8E8E6] rounded-lg hover:text-[#D32F2F] hover:bg-[#D32F2F]/10 transition-colors"
            title="Clear all entered Web Service values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* TIER 1 & TIER 2 SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tier 1: Shipment Batch Total Reconciliation */}
        <div className="lg:col-span-5 card-elevated p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#051C2C]" />
              <h2 className="font-heading font-bold text-base text-[#051C2C]">
                Tier 1: Shipment Batch Total Level
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#051C2C]/10 text-[#051C2C]">
              Batch Integrity
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F5F2]">
              <span className="text-xs text-[#888888]">Practitioner Benchmark Total:</span>
              <span className="font-mono font-bold text-sm text-[#051C2C]">
                {formatCurrency(totalPractLanded)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F5F2]">
              <span className="text-xs text-[#888888]">Client Web Service Total:</span>
              <span className="font-mono font-bold text-sm text-[#051C2C]">
                {formatCurrency(totalWsLanded)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E8E8E6]">
              <span className="text-xs font-semibold text-[#051C2C]">Shipment Net Variance:</span>
              <span className="font-mono font-bold text-sm text-[#051C2C]">
                {formatSignedCurrency(netShipmentVariance)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#888888]">Tier 1 Reconciliation Status:</span>
              {isShipmentMatch ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  MATCH (Within Tolerances)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#2251FF]/10 text-[#2251FF] border border-[#2251FF]/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  VARIANCE DETECTED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Category Breakdown Reconciliation */}
        <div className="lg:col-span-7 card-elevated p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#051C2C]" />
              <h2 className="font-heading font-bold text-base text-[#051C2C]">
                Tier 2: Cost Category Breakdown Level
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#051C2C]/10 text-[#051C2C]">
              Category Attribution
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="table-header border-b border-[#E8E8E6]">
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Benchmark (USD)</th>
                  <th className="py-2 px-3 text-right">Web Service (USD)</th>
                  <th className="py-2 px-3 text-right">Variance (USD)</th>
                  <th className="py-2 px-3 text-right">Variance %</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {categoryRecon.map((cat) => (
                  <tr key={cat.category} className="hover:bg-[#F5F5F2]/40 transition-colors">
                    <td className="py-2 px-3 font-semibold text-[#051C2C]">{cat.category}</td>
                    <td className="py-2 px-3 text-right font-mono text-[#051C2C]">
                      {formatCurrency(cat.practAmount)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#051C2C]">
                      {formatCurrency(cat.wsAmount)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-[#051C2C]">
                      {formatSignedCurrency(cat.varianceAmount)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[#888888]">
                      {formatPercent(cat.variancePct, true)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {cat.status === 'MATCH' ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C853]/10 text-[#00C853]">
                          MATCH
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2251FF]/10 text-[#2251FF]">
                          VARIANCE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insight Block */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1A1A2E] leading-relaxed">
            <span className="font-semibold text-[#051C2C]">Tier 3 SKU-Level Drilldown: </span>
            Paste or enter your Web Service output values in the pale yellow column (E). The engine
            immediately re-evaluates both absolute (<span className="font-mono">${params.toleranceAbs.toFixed(2)}</span>)
            and percentage (<span className="font-mono">{formatPercent(params.tolerancePct)}</span>) tolerances,
            automatically updating status pills and dynamically generating root-cause entries in Sheet 05.
          </div>
        </div>
      </div>

      {/* TIER 3 MAIN SKU TABLE */}
      <div className="card-elevated overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8E8E6] bg-white flex items-center justify-between">
          <h2 className="font-heading font-bold text-base text-[#051C2C]">
            Tier 3: SKU-Level Drilldown &amp; Penetration Reconciliation Table
          </h2>
          <span className="text-[11px] text-[#888888] font-mono">04_WEBSERVICE_RECON!A11:K#</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="table-header border-b border-[#E8E8E6]">
                <th className="py-2.5 px-3">SKU Code (A)</th>
                <th className="py-2.5 px-3 min-w-[170px]">Description (B)</th>
                <th className="py-2.5 px-2 text-right w-16">Qty (C)</th>
                <th className="py-2.5 px-3 text-right w-36">Pract Total (D)</th>
                <th className="py-2.5 px-3 text-right w-40 bg-[#FFFDE7] text-[#051C2C] font-bold">
                  WS Total Cost (E)
                </th>
                <th className="py-2.5 px-3 text-right w-32 bg-[#051C2C]/5 font-bold">
                  Variance Total (F)
                </th>
                <th className="py-2.5 px-2.5 text-right w-24 bg-[#051C2C]/5 font-bold">
                  Variance % (G)
                </th>
                <th className="py-2.5 px-3 text-right w-28">Pract Unit (H)</th>
                <th className="py-2.5 px-3 text-right w-28">WS Unit (I)</th>
                <th className="py-2.5 px-3 text-right w-28">Unit Var (J)</th>
                <th className="py-2.5 px-3 text-center w-28">Status (K)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {reconRows.map((row) => (
                <tr
                  key={row.skuCode}
                  className="hover:bg-[#F5F5F2]/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-[#051C2C] font-mono">
                    {row.skuCode}
                  </td>
                  <td className="py-2.5 px-3 text-[#1A1A2E]">{row.skuDescription}</td>
                  <td className="py-2.5 px-2 text-right font-mono">{formatNumber(row.qtyUnits, 0)}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-[#051C2C]">
                    {formatCurrency(row.practTotalCost)}
                  </td>

                  {/* Column E: Editable Web Service Input */}
                  <td className="py-1.5 px-2.5 bg-[#FFFDE7]/50">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter WS Total"
                      value={row.wsTotalCost !== null ? row.wsTotalCost : ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseFloat(e.target.value);
                        onUpdateWsOutput(row.skuCode, val);
                      }}
                      className="input-cell w-full px-2.5 py-1 text-right font-mono font-bold text-xs text-[#051C2C]"
                    />
                  </td>

                  {/* Column F: Variance Total */}
                  <td
                    className="py-2.5 px-3 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/5 interactive-cell cursor-pointer"
                    title={`Practitioner: ${formatCurrency(row.practTotalCost)} | WS: ${formatCurrency(row.wsTotalCost)}`}
                  >
                    {row.wsTotalCost !== null ? formatSignedCurrency(row.varianceTotal) : '—'}
                  </td>

                  {/* Column G: Variance % */}
                  <td className="py-2.5 px-2.5 text-right font-mono text-[#051C2C] bg-[#051C2C]/5">
                    {row.wsTotalCost !== null ? formatPercent(row.variancePct, true) : '—'}
                  </td>

                  {/* Column H: Practitioner Unit Cost */}
                  <td className="py-2.5 px-3 text-right font-mono text-[#051C2C]">
                    {formatCurrency(row.practUnitCost)}
                  </td>

                  {/* Column I: WS Unit Cost */}
                  <td className="py-2.5 px-3 text-right font-mono text-[#051C2C]">
                    {row.wsUnitCost !== null ? formatCurrency(row.wsUnitCost) : '—'}
                  </td>

                  {/* Column J: Unit Variance */}
                  <td className="py-2.5 px-3 text-right font-mono text-[#051C2C]">
                    {row.wsTotalCost !== null ? formatSignedCurrency(row.varianceUnit) : '—'}
                  </td>

                  {/* Column K: Status Flag Badge */}
                  <td className="py-2.5 px-3 text-center">
                    {renderStatusBadge(row.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
