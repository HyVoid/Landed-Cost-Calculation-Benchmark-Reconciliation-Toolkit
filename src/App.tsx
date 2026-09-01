import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ActiveTab,
  AppDataState,
  CostPoolItem,
  SetupParams,
  SkuItem,
  AuditorAssessment,
} from './types';
import { INITIAL_DEFAULT_DATA } from './data/defaultData';
import {
  computePractitionerLandedCosts,
  computeSkuReconciliation,
  computeCategoryReconciliation,
  computeDiagnosisLogs,
} from './utils/calcEngine';
import { downloadFile } from './utils/csvHelper';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CsvImportModal } from './components/CsvImportModal';
import { SetupParamsTab } from './components/tabs/SetupParamsTab';
import { SkuMasterInputTab } from './components/tabs/SkuMasterInputTab';
import { CostPoolInputTab } from './components/tabs/CostPoolInputTab';
import { PractitionerCalcTab } from './components/tabs/PractitionerCalcTab';
import { WebServiceReconTab } from './components/tabs/WebServiceReconTab';
import { VarianceDiagnosisTab } from './components/tabs/VarianceDiagnosisTab';
import { ExecutiveSummaryTab } from './components/tabs/ExecutiveSummaryTab';
import { Footer } from './components/Footer';

const STORAGE_KEY = 'LANDED_COST_BENCHMARK_STATE_v1';

export default function App() {
  // Load state from localStorage or initialize with standard default benchmark case
  const [dataState, setDataState] = useState<AppDataState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.params && parsed.skus && parsed.costPool) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load existing localStorage state, using default:', e);
    }
    return INITIAL_DEFAULT_DATA;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('00_SETUP_PARAMS');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Save Effect
  useEffect(() => {
    try {
      const updatedState: AppDataState = {
        ...dataState,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [dataState]);

  // Derived Calculations
  const practResults = useMemo(() => {
    return computePractitionerLandedCosts(
      dataState.skus,
      dataState.costPool,
      dataState.params
    );
  }, [dataState.skus, dataState.costPool, dataState.params]);

  const reconRows = useMemo(() => {
    return computeSkuReconciliation(
      practResults,
      dataState.webServiceOutputs,
      dataState.params
    );
  }, [practResults, dataState.webServiceOutputs, dataState.params]);

  const categoryRecon = useMemo(() => {
    return computeCategoryReconciliation(
      dataState.costPool,
      dataState.params,
      practResults
    );
  }, [dataState.costPool, dataState.params, practResults]);

  const diagnosisLogs = useMemo(() => {
    return computeDiagnosisLogs(reconRows, dataState.diagnosisOverrides);
  }, [reconRows, dataState.diagnosisOverrides]);

  // State Mutation Handlers
  const handleUpdateParams = (newParams: SetupParams) => {
    setDataState((prev) => ({
      ...prev,
      params: newParams,
      lastSaved: new Date().toISOString(),
    }));
  };

  const handleUpdateSkus = (newSkus: SkuItem[]) => {
    setDataState((prev) => ({
      ...prev,
      skus: newSkus,
      lastSaved: new Date().toISOString(),
    }));
  };

  const handleUpdateCostPool = (newCosts: CostPoolItem[]) => {
    setDataState((prev) => ({
      ...prev,
      costPool: newCosts,
      lastSaved: new Date().toISOString(),
    }));
  };

  const handleUpdateWsOutput = (skuCode: string, value: number | null) => {
    setDataState((prev) => ({
      ...prev,
      webServiceOutputs: {
        ...prev.webServiceOutputs,
        [skuCode]: value,
      },
      lastSaved: new Date().toISOString(),
    }));
  };

  const handleBatchUpdateWsOutputs = (outputs: Record<string, number | null>) => {
    setDataState((prev) => ({
      ...prev,
      webServiceOutputs: outputs,
      lastSaved: new Date().toISOString(),
    }));
  };

  const handleUpdateDiagnosisLog = (
    skuCode: string,
    cause: string,
    detail: string
  ) => {
    setDataState((prev) => ({
      ...prev,
      diagnosisOverrides: {
        ...prev.diagnosisOverrides,
        [skuCode]: {
          primaryRootCause: cause,
          attributionDetail: detail,
        },
      },
      lastSaved: new Date().toISOString(),
    }));
  };

  const handleUpdateAssessment = (newAssessment: AuditorAssessment) => {
    setDataState((prev) => ({
      ...prev,
      executiveAssessment: newAssessment,
      lastSaved: new Date().toISOString(),
    }));
  };

  // CSV Import Handlers
  const handleImportSkus = (importedSkus: SkuItem[], replace: boolean) => {
    setDataState((prev) => ({
      ...prev,
      skus: replace ? importedSkus : [...prev.skus, ...importedSkus],
      lastSaved: new Date().toISOString(),
    }));
  };

  const handleImportCosts = (importedCosts: CostPoolItem[], replace: boolean) => {
    setDataState((prev) => ({
      ...prev,
      costPool: replace ? importedCosts : [...prev.costPool, ...importedCosts],
      lastSaved: new Date().toISOString(),
    }));
  };

  // Backup Import & Export
  const handleExportBackup = () => {
    const json = JSON.stringify(dataState, null, 2);
    const filename = `Landed_Cost_Benchmark_${dataState.params.caseId}_${
      new Date().toISOString().split('T')[0]
    }.json`;
    downloadFile(json, filename, 'application/json');
  };

  const handleTriggerImportBackup = () => {
    fileInputRef.current?.click();
  };

  const handleFileBackupSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && parsed.params && parsed.skus && parsed.costPool) {
          setDataState(parsed);
          alert('Backup data successfully imported!');
        } else {
          alert('Invalid backup JSON structure.');
        }
      } catch (err: any) {
        alert(`Failed to import JSON backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    setDataState({
      ...INITIAL_DEFAULT_DATA,
      lastSaved: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F5F2] text-[#1A1A2E]">
      {/* Hidden File Input for Backup Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileBackupSelected}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Left Dedicated Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lastSaved={dataState.lastSaved}
        caseId={dataState.params.caseId}
        anomalyCount={diagnosisLogs.length}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleTriggerImportBackup}
        onResetData={handleResetData}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          params={dataState.params}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCsvModal={() => setIsCsvModalOpen(true)}
          onExportBackup={handleExportBackup}
        />

        {/* Dynamic Sheet Content */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 py-7">
          {activeTab === '00_SETUP_PARAMS' && (
            <SetupParamsTab
              params={dataState.params}
              onUpdateParams={handleUpdateParams}
            />
          )}

          {activeTab === '01_SKU_MASTER_INPUT' && (
            <SkuMasterInputTab
              skus={dataState.skus}
              onUpdateSkus={handleUpdateSkus}
              onOpenCsvModal={() => setIsCsvModalOpen(true)}
            />
          )}

          {activeTab === '02_COST_POOL_INPUT' && (
            <CostPoolInputTab
              costPool={dataState.costPool}
              params={dataState.params}
              onUpdateCostPool={handleUpdateCostPool}
              onOpenCsvModal={() => setIsCsvModalOpen(true)}
            />
          )}

          {activeTab === '03_PRACTITIONER_CALC' && (
            <PractitionerCalcTab practResults={practResults} />
          )}

          {activeTab === '04_WEBSERVICE_RECON' && (
            <WebServiceReconTab
              reconRows={reconRows}
              categoryRecon={categoryRecon}
              practResults={practResults}
              wsOutputs={dataState.webServiceOutputs}
              params={dataState.params}
              onUpdateWsOutput={handleUpdateWsOutput}
              onBatchUpdateWsOutputs={handleBatchUpdateWsOutputs}
            />
          )}

          {activeTab === '05_VARIANCE_DIAGNOSIS' && (
            <VarianceDiagnosisTab
              diagnosisLogs={diagnosisLogs}
              onUpdateLog={handleUpdateDiagnosisLog}
            />
          )}

          {activeTab === '06_EXECUTIVE_SUMMARY' && (
            <ExecutiveSummaryTab
              params={dataState.params}
              reconRows={reconRows}
              practResults={practResults}
              diagnosisLogs={diagnosisLogs}
              assessment={dataState.executiveAssessment}
              onUpdateAssessment={handleUpdateAssessment}
            />
          )}
        </main>

        {/* Page Footer */}
        <Footer caseId={dataState.params.caseId} />
      </div>

      {/* Bulk CSV Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportSkus={handleImportSkus}
        onImportCosts={handleImportCosts}
        currentSkus={dataState.skus}
        currentCosts={dataState.costPool}
      />
    </div>
  );
}
