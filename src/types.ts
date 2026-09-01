export type AllocationBasis =
  | 'Gross Weight'
  | 'Volume'
  | 'Commercial Value'
  | 'Customs Value'
  | 'Quantity Units';

export type CostCategory =
  | 'Freight'
  | 'Duty'
  | 'Surcharge'
  | 'Insurance'
  | 'Brokerage'
  | 'Other';

export type AccountingTreatment =
  | 'Capitalize to Inventory'
  | 'Period Expense';

export type ReconStatus =
  | 'MATCH'
  | 'VARIANCE'
  | 'CRITICAL_ERROR'
  | 'PENDING_INPUT';

export interface FxRateEntry {
  currency: string;
  rate: number;
  description: string;
}

export interface AllocationBasisMapping {
  name: AllocationBasis;
  mappedField: string;
  suitableCosts: string;
}

export interface SetupParams {
  caseId: string;
  shipmentId: string;
  baseCurrency: string;
  accountingStandard: string;
  toleranceAbs: number;
  tolerancePct: number;
  fxRates: FxRateEntry[];
  allocationBases: AllocationBasisMapping[];
}

export interface SkuItem {
  id: string;
  poNumber: string;
  ciNumber: string;
  customsEntryLine: string;
  skuCode: string;
  skuDescription: string;
  hsCode: string;
  qtyUnits: number;
  unitPriceFob: number;
  netWeightKg: number;
  grossWeightKg: number;
  volumeCbm: number;
  customsUnitValue: number;
}

export interface CostPoolItem {
  id: string;
  costId: string;
  costCategory: CostCategory;
  costSubcategory: string;
  invoiceNumber: string;
  invoiceCurrency: string;
  invoiceAmount: number;
  allocationBasis: AllocationBasis;
  accountingTreatment: AccountingTreatment;
}

export interface SkuCalculatedTotals {
  commercialValue: number;
  totalGrossWeight: number;
  totalVolume: number;
  totalCustomsValue: number;
}

export interface PractitionerSkuResult {
  skuCode: string;
  skuDescription: string;
  qtyUnits: number;
  unitPriceFob: number;
  skuCommercialValue: number;
  allocFreight: number;
  allocDuty: number;
  allocHandling: number;
  allocOther: number;
  practTotalLanded: number;
  practUnitLanded: number;
  landedMultiplier: number;
}

export interface SkuReconRow {
  skuCode: string;
  skuDescription: string;
  qtyUnits: number;
  practTotalCost: number;
  wsTotalCost: number | null;
  varianceTotal: number;
  variancePct: number;
  practUnitCost: number;
  wsUnitCost: number | null;
  varianceUnit: number;
  status: ReconStatus;
}

export interface CategoryReconSummary {
  category: string;
  practAmount: number;
  wsAmount: number;
  varianceAmount: number;
  variancePct: number;
  status: 'MATCH' | 'VARIANCE';
}

export interface VarianceDiagnosisLog {
  logId: string;
  skuCode: string;
  skuDescription: string;
  varianceTotal: number;
  variancePct: number;
  primaryRootCause: string;
  attributionDetail: string;
}

export interface AuditorAssessment {
  verdict: string;
  recommendation: string;
  auditorName: string;
  auditDate: string;
}

export interface AppDataState {
  params: SetupParams;
  skus: SkuItem[];
  costPool: CostPoolItem[];
  webServiceOutputs: Record<string, number | null>;
  diagnosisOverrides: Record<string, { primaryRootCause: string; attributionDetail: string }>;
  executiveAssessment: AuditorAssessment;
  lastSaved: string;
}

export type ActiveTab =
  | '00_SETUP_PARAMS'
  | '01_SKU_MASTER_INPUT'
  | '02_COST_POOL_INPUT'
  | '03_PRACTITIONER_CALC'
  | '04_WEBSERVICE_RECON'
  | '05_VARIANCE_DIAGNOSIS'
  | '06_EXECUTIVE_SUMMARY';
