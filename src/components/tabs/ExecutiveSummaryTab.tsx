import React from 'react';
import {
  AuditorAssessment,
  PractitionerSkuResult,
  SetupParams,
  SkuReconRow,
  VarianceDiagnosisLog,
} from '../../types';
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
  formatNumber,
} from '../../utils/calcEngine';
import {
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldCheck,
  TrendingUp,
  Scale,
  Sparkles,
} from 'lucide-react';

interface ExecutiveSummaryTabProps {
  params: SetupParams;
  reconRows: SkuReconRow[];
  practResults: PractitionerSkuResult[];
  diagnosisLogs: VarianceDiagnosisLog[];
  assessment: AuditorAssessment;
  onUpdateAssessment: (newAssessment: AuditorAssessment) => void;
}

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({
  params,
  reconRows,
  practResults,
  diagnosisLogs,
  assessment,
  onUpdateAssessment,
}) => {
  const validRows = reconRows.filter((r) => r.status !== 'PENDING_INPUT');
  const matchedCount = validRows.filter((r) => r.status === 'MATCH').length;
  const matchRate = validRows.length > 0 ? matchedCount / validRows.length : 1.0;

  const totalPractLanded = practResults.reduce(
    (sum, r) => sum + r.practTotalLanded,
    0
  );
  const totalWsLanded = reconRows.reduce(
    (sum, r) => sum + (r.wsTotalCost || 0),
    0
  );
  const netVariance = totalPractLanded - totalWsLanded;

  // Max Outlier
  let maxOutlierText = 'None';
  if (reconRows.length > 0) {
    let maxAbs = -1;
    let maxRow: SkuReconRow | null = null;
    reconRows.forEach((r) => {
      if (r.wsTotalCost !== null) {
        const abs = Math.abs(r.varianceTotal);
        if (abs > maxAbs) {
          maxAbs = abs;
          maxRow = r;
        }
      }
    });
    if (maxRow) {
      maxOutlierText = `${(maxRow as SkuReconRow).skuCode} (${formatSignedCurrency(
        (maxRow as SkuReconRow).varianceTotal
      )})`;
    }
  }

  // Group root causes
  const causeCounts: Record<string, { count: number; totalAbsVar: number }> = {};
  diagnosisLogs.forEach((l) => {
    const key = l.primaryRootCause;
    if (!causeCounts[key]) {
      causeCounts[key] = { count: 0, totalAbsVar: 0 };
    }
    causeCounts[key].count += 1;
    causeCounts[key].totalAbsVar += Math.abs(l.varianceTotal);
  });

  const causeList = Object.entries(causeCounts).map(([cause, data]) => ({
    cause,
    count: data.count,
    totalAbsVar: data.totalAbsVar,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-up print:space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
            Layer 06 • Executive Benchmark Audit &amp; Handover Certificate
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-[28px] text-[#051C2C] tracking-tight">
            Executive Audit &amp; Delivery Summary
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#051C2C] bg-white border border-[#E8E8E6] rounded-lg hover:bg-[#F5F5F2] transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#2251FF]" />
            Print / Save Audit PDF
          </button>
        </div>
      </div>

      {/* Case Header Card (Executive Overview) */}
      <div className="card-elevated p-5 bg-white border-l-4 border-[#051C2C]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E8E6] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2251FF]" />
            <div>
              <span className="text-xs font-bold text-[#051C2C]">Case Reference: </span>
              <span className="text-xs font-mono font-semibold text-[#2251FF]">
                {params.caseId}
              </span>
            </div>
          </div>
          <div className="text-xs text-[#888888]">
            <span>Shipment ID: </span>
            <span className="font-mono font-semibold text-[#051C2C]">{params.shipmentId}</span>
            <span className="mx-2">•</span>
            <span>Accounting Standard: </span>
            <span className="font-semibold text-[#051C2C]">{params.accountingStandard}</span>
          </div>
        </div>

        {/* 4 Hero KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-3 bg-[#F5F5F2] rounded-lg">
            <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
              Overall Match Rate
            </div>
            <div
              className="font-heading font-bold text-3xl text-[#051C2C] mt-1"
              style={{ letterSpacing: 'var(--tracking-display)' }}
            >
              {(matchRate * 100).toFixed(1)}%
            </div>
            <div className="text-[11px] text-[#888888] mt-0.5">
              {matchedCount} of {validRows.length} SKUs within tolerance
            </div>
          </div>

          <div className="p-3 bg-[#F5F5F2] rounded-lg">
            <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
              Shipment Net Variance
            </div>
            <div
              className="font-heading font-bold text-3xl text-[#051C2C] mt-1"
              style={{ letterSpacing: 'var(--tracking-display)' }}
            >
              {formatSignedCurrency(netVariance)}
            </div>
            <div className="text-[11px] text-[#888888] mt-0.5">
              Net unabsorbed divergence on batch
            </div>
          </div>

          <div className="p-3 bg-[#F5F5F2] rounded-lg">
            <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
              Benchmark Batch Total
            </div>
            <div
              className="font-heading font-bold text-3xl text-[#051C2C] mt-1"
              style={{ letterSpacing: 'var(--tracking-display)' }}
            >
              {formatCurrency(totalPractLanded)}
            </div>
            <div className="text-[11px] text-[#888888] mt-0.5">
              Total inventory landed asset value
            </div>
          </div>

          <div className="p-3 bg-[#F5F5F2] rounded-lg">
            <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
              Max Variance Outlier
            </div>
            <div
              className="font-heading font-bold text-xl text-[#2251FF] mt-1 truncate"
              style={{ letterSpacing: 'var(--tracking-display)' }}
            >
              {maxOutlierText}
            </div>
            <div className="text-[11px] text-[#888888] mt-0.5">
              Peak single-item deviation point
            </div>
          </div>
        </div>
      </div>

      {/* Root Cause Distribution Table */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#051C2C]" />
            <h2 className="font-heading font-bold text-base text-[#051C2C]">
              Structural Root Cause Breakdown (Variance Taxonomy Distribution)
            </h2>
          </div>
          <span className="text-[11px] text-[#888888] font-mono">06_EXECUTIVE_SUMMARY!B7:D12</span>
        </div>

        {causeList.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#888888]">
            No root causes recorded. Full benchmark alignment confirmed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="table-header border-b border-[#E8E8E6]">
                  <th className="py-2.5 px-3">Root Cause Category</th>
                  <th className="py-2.5 px-3 text-right w-36">Affected SKUs</th>
                  <th className="py-2.5 px-3 text-right w-44">Cumulative Absolute Variance (USD)</th>
                  <th className="py-2.5 px-3 w-48">Impact Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {causeList.map((item) => (
                  <tr key={item.cause} className="hover:bg-[#F5F5F2]/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#051C2C]">{item.cause}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{item.count}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#051C2C]">
                      {formatCurrency(item.totalAbsVar)}
                    </td>
                    <td className="py-2.5 px-3 text-[#888888]">
                      {item.totalAbsVar > 500 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D32F2F]/10 text-[#D32F2F]">
                          High Margin Impact
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2251FF]/10 text-[#2251FF]">
                          Moderate Impact
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Professional Auditor Assessment & Strategic Advice Card */}
      <div className="card-elevated p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#2251FF]" />
            <h2 className="font-heading font-bold text-base text-[#051C2C]">
              Professional Auditor Assessment &amp; R&amp;D Recommendations
            </h2>
          </div>
          <span className="text-[11px] text-[#888888]">Advisory Summary</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider">
              Auditor Final Verdict &amp; Core Finding
            </label>
            <textarea
              rows={4}
              value={assessment.verdict}
              onChange={(e) =>
                onUpdateAssessment({ ...assessment, verdict: e.target.value })
              }
              className="input-cell w-full p-2.5 text-xs text-[#1A1A2E] leading-relaxed resize-y"
              placeholder="Enter official auditor verdict and summary of findings..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider">
              Strategic R&amp;D Recommendations (System Optimization Steps)
            </label>
            <textarea
              rows={4}
              value={assessment.recommendation}
              onChange={(e) =>
                onUpdateAssessment({
                  ...assessment,
                  recommendation: e.target.value,
                })
              }
              className="input-cell w-full p-2.5 text-xs text-[#1A1A2E] leading-relaxed resize-y"
              placeholder="Enter actionable next-steps for software development engineers..."
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#E8E8E6] text-xs text-[#888888]">
          <div className="flex items-center gap-3">
            <span>Auditor Sign-off:</span>
            <input
              type="text"
              value={assessment.auditorName}
              onChange={(e) =>
                onUpdateAssessment({ ...assessment, auditorName: e.target.value })
              }
              className="input-cell px-2 py-0.5 text-xs font-semibold text-[#051C2C] w-56"
            />
          </div>
          <div>
            <span>Audit Date: </span>
            <input
              type="date"
              value={assessment.auditDate}
              onChange={(e) =>
                onUpdateAssessment({ ...assessment, auditDate: e.target.value })
              }
              className="input-cell px-2 py-0.5 text-xs font-mono text-[#051C2C]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
