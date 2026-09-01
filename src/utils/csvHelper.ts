import { CostPoolItem, SkuItem, AppDataState } from '../types';

export function exportSkusToCsv(skus: SkuItem[]): string {
  const headers = [
    'PO_Number',
    'CI_Number',
    'Customs_Entry_Line',
    'SKU_Code',
    'SKU_Description',
    'HS_Code',
    'Qty_Units',
    'Unit_Price_FOB',
    'Net_Weight_KG',
    'Gross_Weight_KG',
    'Volume_CBM',
    'Customs_Unit_Value',
  ];

  const rows = skus.map((s) => [
    `"${s.poNumber.replace(/"/g, '""')}"`,
    `"${s.ciNumber.replace(/"/g, '""')}"`,
    `"${s.customsEntryLine.replace(/"/g, '""')}"`,
    `"${s.skuCode.replace(/"/g, '""')}"`,
    `"${s.skuDescription.replace(/"/g, '""')}"`,
    `"${s.hsCode.replace(/"/g, '""')}"`,
    s.qtyUnits,
    s.unitPriceFob,
    s.netWeightKg,
    s.grossWeightKg,
    s.volumeCbm,
    s.customsUnitValue,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function parseSkusFromCsv(csvText: string): SkuItem[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parsedRows: SkuItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < 4 || !cells[3]) continue; // at least SKU code must exist

    parsedRows.push({
      id: `sku-import-${Date.now()}-${i}`,
      poNumber: cells[0] || `PO-${i}`,
      ciNumber: cells[1] || `CI-${i}`,
      customsEntryLine: cells[2] || `Line ${String(i).padStart(3, '0')}`,
      skuCode: cells[3] || `SKU-${i}`,
      skuDescription: cells[4] || 'Imported SKU Item',
      hsCode: cells[5] || '0000.00',
      qtyUnits: Math.max(1, parseInt(cells[6], 10) || 100),
      unitPriceFob: Math.max(0, parseFloat(cells[7]) || 10.0),
      netWeightKg: Math.max(0, parseFloat(cells[8]) || 0.5),
      grossWeightKg: Math.max(0, parseFloat(cells[9]) || 0.6),
      volumeCbm: Math.max(0, parseFloat(cells[10]) || 0.005),
      customsUnitValue: Math.max(0, parseFloat(cells[11]) || parseFloat(cells[7]) || 10.0),
    });
  }

  return parsedRows;
}

export function exportCostPoolToCsv(costs: CostPoolItem[]): string {
  const headers = [
    'Cost_ID',
    'Cost_Category',
    'Cost_Subcategory',
    'Invoice_Number',
    'Invoice_Currency',
    'Invoice_Amount',
    'Allocation_Basis',
    'Accounting_Treatment',
  ];

  const rows = costs.map((c) => [
    `"${c.costId.replace(/"/g, '""')}"`,
    `"${c.costCategory.replace(/"/g, '""')}"`,
    `"${c.costSubcategory.replace(/"/g, '""')}"`,
    `"${c.invoiceNumber.replace(/"/g, '""')}"`,
    `"${c.invoiceCurrency.replace(/"/g, '""')}"`,
    c.invoiceAmount,
    `"${c.allocationBasis.replace(/"/g, '""')}"`,
    `"${c.accountingTreatment.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function parseCostPoolFromCsv(csvText: string): CostPoolItem[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const parsedCosts: CostPoolItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < 3 || !cells[0]) continue;

    parsedCosts.push({
      id: `cost-import-${Date.now()}-${i}`,
      costId: cells[0] || `C-${String(i).padStart(3, '0')}`,
      costCategory: (cells[1] as CostPoolItem['costCategory']) || 'Freight',
      costSubcategory: cells[2] || 'Operational Charge',
      invoiceNumber: cells[3] || `INV-${i}`,
      invoiceCurrency: cells[4] || 'USD',
      invoiceAmount: Math.max(0, parseFloat(cells[5]) || 0),
      allocationBasis: (cells[6] as CostPoolItem['allocationBasis']) || 'Gross Weight',
      accountingTreatment:
        (cells[7] as CostPoolItem['accountingTreatment']) ||
        'Capitalize to Inventory',
    });
  }

  return parsedCosts;
}

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
