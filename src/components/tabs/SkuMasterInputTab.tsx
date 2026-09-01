import React, { useState } from 'react';
import { SkuItem } from '../../types';
import { calculateSkuTotals, formatCurrency, formatNumber } from '../../utils/calcEngine';
import { Plus, Trash2, Copy, FileSpreadsheet, Info, Database } from 'lucide-react';
import { exportSkusToCsv, downloadFile } from '../../utils/csvHelper';

interface SkuMasterInputTabProps {
  skus: SkuItem[];
  onUpdateSkus: (skus: SkuItem[]) => void;
  onOpenCsvModal: () => void;
}

export const SkuMasterInputTab: React.FC<SkuMasterInputTabProps> = ({
  skus,
  onUpdateSkus,
  onOpenCsvModal,
}) => {
  const handleSkuFieldChange = (
    id: string,
    field: keyof SkuItem,
    value: string | number
  ) => {
    const updated = skus.map((sku) => {
      if (sku.id !== id) return sku;
      return {
        ...sku,
        [field]: value,
      };
    });
    onUpdateSkus(updated);
  };

  const handleAddSku = () => {
    const newId = `sku-${Date.now()}`;
    const nextNum = skus.length + 1;
    const newSku: SkuItem = {
      id: newId,
      poNumber: `PO-2026-08${nextNum}`,
      ciNumber: `CI-US-89${nextNum}`,
      customsEntryLine: `Line ${String(nextNum).padStart(3, '0')}`,
      skuCode: `SKU-D${nextNum}0${nextNum}`,
      skuDescription: 'New Product Specification',
      hsCode: '8471.60',
      qtyUnits: 100,
      unitPriceFob: 20.0,
      netWeightKg: 0.5,
      grossWeightKg: 0.6,
      volumeCbm: 0.005,
      customsUnitValue: 20.0,
    };
    onUpdateSkus([...skus, newSku]);
  };

  const handleDuplicateSku = (sku: SkuItem) => {
    const newSku: SkuItem = {
      ...sku,
      id: `sku-${Date.now()}`,
      skuCode: `${sku.skuCode}-COPY`,
      skuDescription: `${sku.skuDescription} (Copy)`,
    };
    onUpdateSkus([...skus, newSku]);
  };

  const handleDeleteSku = (id: string) => {
    if (skus.length <= 1) return; // keep at least 1 row
    onUpdateSkus(skus.filter((s) => s.id !== id));
  };

  const handleExportCsv = () => {
    const csv = exportSkusToCsv(skus);
    downloadFile(csv, 'SKU_Master_Data.csv', 'text/csv;charset=utf-8;');
  };

  // Aggregated totals
  const totalUnits = skus.reduce((sum, s) => sum + (Number(s.qtyUnits) || 0), 0);
  const totalFobValue = skus.reduce(
    (sum, s) => sum + (Number(s.qtyUnits) || 0) * (Number(s.unitPriceFob) || 0),
    0
  );
  const totalGrossWeight = skus.reduce(
    (sum, s) => sum + (Number(s.qtyUnits) || 0) * (Number(s.grossWeightKg) || 0),
    0
  );
  const totalVolume = skus.reduce(
    (sum, s) => sum + (Number(s.qtyUnits) || 0) * (Number(s.volumeCbm) || 0),
    0
  );
  const totalCustomsValue = skus.reduce(
    (sum, s) => sum + (Number(s.qtyUnits) || 0) * (Number(s.customsUnitValue) || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-1">
            Layer 01 • Master Shipment &amp; SKU Attribute Layer
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-[28px] text-[#051C2C] tracking-tight">
            Freight &amp; SKU Master Input
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
            onClick={handleAddSku}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2251FF] rounded-lg hover:bg-[#2251FF]/90 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add SKU Row
          </button>
        </div>
      </div>

      {/* KPI Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="card-elevated p-3.5">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Total Import Units
          </div>
          <div className="font-heading font-bold text-xl text-[#051C2C] mt-1">
            {formatNumber(totalUnits, 0)} <span className="text-xs font-normal text-[#888888]">PCS</span>
          </div>
        </div>

        <div className="card-elevated p-3.5">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Total Commercial FOB
          </div>
          <div className="font-heading font-bold text-xl text-[#051C2C] mt-1">
            {formatCurrency(totalFobValue)}
          </div>
        </div>

        <div className="card-elevated p-3.5">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Total Gross Weight
          </div>
          <div className="font-heading font-bold text-xl text-[#051C2C] mt-1">
            {formatNumber(totalGrossWeight, 3)} <span className="text-xs font-normal text-[#888888]">KG</span>
          </div>
        </div>

        <div className="card-elevated p-3.5">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Total Volume
          </div>
          <div className="font-heading font-bold text-xl text-[#051C2C] mt-1">
            {formatNumber(totalVolume, 4)} <span className="text-xs font-normal text-[#888888]">CBM</span>
          </div>
        </div>

        <div className="card-elevated p-3.5">
          <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">
            Customs Declared Value
          </div>
          <div className="font-heading font-bold text-xl text-[#051C2C] mt-1">
            {formatCurrency(totalCustomsValue)}
          </div>
        </div>
      </div>

      {/* Visual Partitioning Insight Callout */}
      <div className="insight-block">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1A1A2E] leading-relaxed">
            <span className="font-semibold text-[#051C2C]">Visual Partitioning Spec: </span>
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#FFFDE7] text-[#051C2C] border border-[#E8E8E6] text-[11px] font-mono mr-1">
              Columns A~L (Pale Yellow #FFFDE7)
            </span>
            represent editable document inputs (PO, invoice weights, unit values).
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#F5F5F2] text-[#051C2C] border border-[#E8E8E6] text-[11px] font-mono mx-1">
              Columns M~P (Gray #F5F5F2)
            </span>
            are dynamic formulas ($SKU\_Commercial\_Value$, $SKU\_Total\_Weight$, $SKU\_Total\_Volume$, $SKU\_Total\_Customs\_Value$)
            that auto-propagate to all downstream allocation pools.
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="table-header border-b border-[#E8E8E6]">
                <th className="py-2.5 px-2 text-center w-8">#</th>
                <th className="py-2.5 px-2.5">PO Number (A)</th>
                <th className="py-2.5 px-2.5">CI Number (B)</th>
                <th className="py-2.5 px-2.5">Entry Line (C)</th>
                <th className="py-2.5 px-2.5">SKU Code (D)</th>
                <th className="py-2.5 px-3 min-w-[160px]">Description (E)</th>
                <th className="py-2.5 px-2 w-20">HS Code (F)</th>
                <th className="py-2.5 px-2.5 text-right w-24">Qty (G)</th>
                <th className="py-2.5 px-2.5 text-right w-24">FOB Price (H)</th>
                <th className="py-2.5 px-2.5 text-right w-24">Net Wt KG (I)</th>
                <th className="py-2.5 px-2.5 text-right w-24">Gross Wt (J)</th>
                <th className="py-2.5 px-2.5 text-right w-24">Vol CBM (K)</th>
                <th className="py-2.5 px-2.5 text-right w-28">Customs Val (L)</th>
                {/* Calculated Columns */}
                <th className="py-2.5 px-3 text-right bg-[#051C2C]/5 text-[#051C2C] font-bold">
                  Tot FOB Val (M)
                </th>
                <th className="py-2.5 px-3 text-right bg-[#051C2C]/5 text-[#051C2C] font-bold">
                  Tot Gross Wt (N)
                </th>
                <th className="py-2.5 px-3 text-right bg-[#051C2C]/5 text-[#051C2C] font-bold">
                  Tot Vol CBM (O)
                </th>
                <th className="py-2.5 px-3 text-right bg-[#051C2C]/5 text-[#051C2C] font-bold">
                  Tot Cust Val (P)
                </th>
                <th className="py-2.5 px-2 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E6]">
              {skus.map((sku, idx) => {
                const totals = calculateSkuTotals(sku);
                return (
                  <tr
                    key={sku.id}
                    className="hover:bg-[#F5F5F2]/40 transition-colors"
                  >
                    <td className="py-2 px-2 text-center font-mono text-[#888888] text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Column A: PO Number */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        value={sku.poNumber}
                        onChange={(e) => handleSkuFieldChange(sku.id, 'poNumber', e.target.value)}
                        className="input-cell w-full px-2 py-1 font-mono text-xs"
                      />
                    </td>

                    {/* Column B: CI Number */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        value={sku.ciNumber}
                        onChange={(e) => handleSkuFieldChange(sku.id, 'ciNumber', e.target.value)}
                        className="input-cell w-full px-2 py-1 font-mono text-xs"
                      />
                    </td>

                    {/* Column C: Customs Entry Line */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        value={sku.customsEntryLine}
                        onChange={(e) => handleSkuFieldChange(sku.id, 'customsEntryLine', e.target.value)}
                        className="input-cell w-full px-2 py-1 font-mono text-xs"
                      />
                    </td>

                    {/* Column D: SKU Code */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        value={sku.skuCode}
                        onChange={(e) => handleSkuFieldChange(sku.id, 'skuCode', e.target.value)}
                        className="input-cell w-full px-2 py-1 font-bold text-xs text-[#051C2C]"
                      />
                    </td>

                    {/* Column E: Description */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        value={sku.skuDescription}
                        onChange={(e) => handleSkuFieldChange(sku.id, 'skuDescription', e.target.value)}
                        className="input-cell w-full px-2 py-1 text-xs"
                      />
                    </td>

                    {/* Column F: HS Code */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="text"
                        value={sku.hsCode}
                        onChange={(e) => handleSkuFieldChange(sku.id, 'hsCode', e.target.value)}
                        className="input-cell w-full px-2 py-1 font-mono text-xs"
                      />
                    </td>

                    {/* Column G: Qty Units */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="number"
                        min="1"
                        value={sku.qtyUnits}
                        onChange={(e) =>
                          handleSkuFieldChange(
                            sku.id,
                            'qtyUnits',
                            Math.max(1, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="input-cell w-full px-2 py-1 font-mono text-right text-xs font-semibold"
                      />
                    </td>

                    {/* Column H: Unit Price FOB */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sku.unitPriceFob}
                        onChange={(e) =>
                          handleSkuFieldChange(
                            sku.id,
                            'unitPriceFob',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="input-cell w-full px-2 py-1 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Column I: Net Weight KG */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={sku.netWeightKg}
                        onChange={(e) =>
                          handleSkuFieldChange(
                            sku.id,
                            'netWeightKg',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="input-cell w-full px-2 py-1 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Column J: Gross Weight KG */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={sku.grossWeightKg}
                        onChange={(e) =>
                          handleSkuFieldChange(
                            sku.id,
                            'grossWeightKg',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="input-cell w-full px-2 py-1 font-mono text-right text-xs font-semibold"
                      />
                    </td>

                    {/* Column K: Volume CBM */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={sku.volumeCbm}
                        onChange={(e) =>
                          handleSkuFieldChange(
                            sku.id,
                            'volumeCbm',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="input-cell w-full px-2 py-1 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Column L: Customs Unit Value */}
                    <td className="py-1.5 px-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sku.customsUnitValue}
                        onChange={(e) =>
                          handleSkuFieldChange(
                            sku.id,
                            'customsUnitValue',
                            Math.max(0, parseFloat(e.target.value) || 0)
                          )
                        }
                        className="input-cell w-full px-2 py-1 font-mono text-right text-xs"
                      />
                    </td>

                    {/* Column M: Calculated SKU Commercial Value */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#051C2C] bg-[#051C2C]/5">
                      {formatCurrency(totals.commercialValue)}
                    </td>

                    {/* Column N: Calculated SKU Total Weight */}
                    <td className="py-2 px-3 text-right font-mono text-[#051C2C] bg-[#051C2C]/5">
                      {formatNumber(totals.totalGrossWeight, 3)}
                    </td>

                    {/* Column O: Calculated SKU Total Volume */}
                    <td className="py-2 px-3 text-right font-mono text-[#051C2C] bg-[#051C2C]/5">
                      {formatNumber(totals.totalVolume, 4)}
                    </td>

                    {/* Column P: Calculated SKU Total Customs Value */}
                    <td className="py-2 px-3 text-right font-mono text-[#051C2C] bg-[#051C2C]/5">
                      {formatCurrency(totals.totalCustomsValue)}
                    </td>

                    {/* Actions */}
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateSku(sku)}
                          className="p-1 text-[#888888] hover:text-[#2251FF] hover:bg-[#2251FF]/10 rounded"
                          title="Duplicate SKU"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {skus.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSku(sku.id)}
                            className="p-1 text-[#888888] hover:text-[#D32F2F] hover:bg-[#D32F2F]/10 rounded"
                            title="Delete SKU Row"
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
            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-[#F5F5F2] font-semibold text-[#051C2C] border-t-2 border-[#E8E8E6]">
                <td colSpan={7} className="py-2.5 px-3 text-right uppercase text-[11px] tracking-wider text-[#888888]">
                  Shipment Aggregate Totals:
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono">{formatNumber(totalUnits, 0)}</td>
                <td colSpan={4}></td>
                <td className="py-2.5 px-3 text-right font-mono font-bold bg-[#051C2C]/10 text-[#051C2C]">
                  {formatCurrency(totalFobValue)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold bg-[#051C2C]/10 text-[#051C2C]">
                  {formatNumber(totalGrossWeight, 3)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold bg-[#051C2C]/10 text-[#051C2C]">
                  {formatNumber(totalVolume, 4)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold bg-[#051C2C]/10 text-[#051C2C]">
                  {formatCurrency(totalCustomsValue)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
