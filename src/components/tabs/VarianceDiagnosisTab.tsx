import React from 'react';
import { VarianceDiagnosisLog } from '../../types';
import { ROOT_CAUSE_TAXONOMY } from '../../data/defaultData';
import { formatCurrency, formatPercent, formatSignedCurrency } from '../../utils/calcEngine';
import { AlertTriangle, CheckCircle2, Info, FileText, Sparkles } from 'lucide-react';

interface VarianceDiagnosisTabProps {
  diagnosisLogs: VarianceDiagnosisLog[];
  onUpdateLog: (skuCode: string, cause: string, detail: string) => void;
}

export const VarianceDiagnosisTab: React.FC<VarianceDiagnosisTabProps> = ({
  diagnosisLogs,
  onUpdateLog,
}) => {
  const totalVarianceAmount = diagnosisLogs.reduce(
    (sum, l) => sum + Math.abs(l.varianceTotal),
    0
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
            Layer 05 • Structured Root Cause Attribution &amp; Advisory Log
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-[28px] text-[#051C2C] tracking-tight">
            Variance Diagnosis &amp; Root Cause Log
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2251FF]/10 text-[#2251FF] border border-[#2251FF]/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            {diagnosisLogs.length} Active Anomaly Logs
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-elevated p-4">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Flagged Discrepancies
          </div>
          <div className="font-heading font-bold text-2xl text-[#051C2C] mt-1">
            {diagnosisLogs.length} <span className="text-xs font-normal text-[#888888]">SKUs</span>
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            Exceeding tolerance threshold
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Cumulative Absolute Variance
          </div>
          <div className="font-heading font-bold text-2xl text-[#051C2C] mt-1">
            {formatCurrency(totalVarianceAmount)}
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            Total absolute divergence across all lines
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Primary Driver Pattern
          </div>
          <div className="font-heading font-bold text-lg text-[#2251FF] mt-1 truncate">
            {diagnosisLogs.length > 0
              ? diagnosisLogs[0].primaryRootCause
              : 'None (Full Match)'}
          </div>
          <div className="text-[11px] text-[#888888] mt-1">
            Most prevalent cause taxonomy
          </div>
        </div>
      </div>

      {/* Insight Callout */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1A1A2E] leading-relaxed">
            <span className="font-semibold text-[#051C2C]">Consultative Attribution Taxonomy: </span>
            Merely signaling that a software calculation differs is insufficient. This module maps every
            flagged SKU to an industry-standard root cause taxonomy (e.g. <span className="font-semibold text-[#051C2C]">Weight vs Value bias</span>,
            <span className="font-semibold text-[#051C2C]"> Period Expense inclusion</span>, or <span className="font-semibold text-[#051C2C]">FOB vs CIF duty base</span>)
            and provides an auditor remarks section to directly guide the software engineering team.
          </div>
        </div>
      </div>

      {/* Main Attribution Table or Clean Match State */}
      {diagnosisLogs.length === 0 ? (
        <div className="card-elevated p-8 text-center bg-white border border-[#00C853]/20">
          <div className="w-12 h-12 rounded-full bg-[#00C853]/10 text-[#00C853] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[#051C2C]">
            LOG-000: Zero Active Discrepancies
          </h3>
          <p className="text-xs text-[#888888] max-w-md mx-auto mt-1 leading-relaxed">
            All SKU calculations in the Web Service align with the Practitioner Benchmark engine
            within the prescribed absolute and percentage tolerance limits.
          </p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E8E8E6] bg-white flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-[#051C2C]">
              Structural Discrepancy Attribution Registry
            </h2>
            <span className="text-[11px] text-[#888888] font-mono">05_VARIANCE_DIAGNOSIS!A4:G#</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="table-header border-b border-[#E8E8E6]">
                  <th className="py-2.5 px-3 w-24">Log ID (A)</th>
                  <th className="py-2.5 px-3 w-28">SKU Code (B)</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Description (C)</th>
                  <th className="py-2.5 px-3 text-right w-32 bg-[#051C2C]/5 font-bold">
                    Variance (USD) (D)
                  </th>
                  <th className="py-2.5 px-3 text-right w-28 bg-[#051C2C]/5 font-bold">
                    Variance % (E)
                  </th>
                  <th className="py-2.5 px-3 w-64">Primary Root Cause (F)</th>
                  <th className="py-2.5 px-3 min-w-[300px]">
                    Mechanism Explanation &amp; Dev Recommendation (G)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {diagnosisLogs.map((log) => (
                  <tr
                    key={log.logId}
                    className="hover:bg-[#F5F5F2]/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#2251FF] text-[11px]">
                      {log.logId}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#051C2C]">
                      {log.skuCode}
                    </td>
                    <td className="py-3 px-3 text-[#1A1A2E]">{log.skuDescription}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/5">
                      {formatSignedCurrency(log.varianceTotal)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/5">
                      {formatPercent(log.variancePct, true)}
                    </td>

                    {/* Primary Root Cause Dropdown */}
                    <td className="py-2.5 px-3">
                      <select
                        value={log.primaryRootCause}
                        onChange={(e) =>
                          onUpdateLog(log.skuCode, e.target.value, log.attributionDetail)
                        }
                        className="input-cell w-full px-2.5 py-1 text-xs font-semibold text-[#051C2C]"
                      >
                        {ROOT_CAUSE_TAXONOMY.map((cause) => (
                          <option key={cause} value={cause}>
                            {cause}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Attribution Notes Textarea */}
                    <td className="py-2.5 px-3">
                      <textarea
                        rows={3}
                        value={log.attributionDetail}
                        onChange={(e) =>
                          onUpdateLog(log.skuCode, log.primaryRootCause, e.target.value)
                        }
                        placeholder="Provide detailed breakdown and actionable recommendation for R&D engineers..."
                        className="input-cell w-full p-2 text-xs text-[#1A1A2E] resize-y"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
