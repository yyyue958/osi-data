export type ActiveView = 'modern-suite' | 'ux-audit' | 'legacy-comparison' | 'python-code';

export type AppSuiteModule = 
  | 'suite-data-prep'        // App 1: UnifiedDataProcessingApp (Clean Accessory, Merge Knee, Clean States)
  | 'suite-location-master'  // App 2: UnifiedMasterLocationApp (Procedure Hosp, IB Hosp, Acc Hosp, Master Combiner)
  | 'suite-waterfall-match'  // App 3: ProcedureWaterfallMatcherApp (9-Step Waterfall Address Matcher)
  | 'suite-tam-mapper'       // App 4: DefinitiveIDMapperApp (TAM Market Report VLOOKUP Mapper)
  | 'suite-master-batch';    // All 4 In 1 Master Batch Runner

export type DataPrepTab = 'accessory-clean' | 'merge-knee' | 'state-clean';
export type LocationMasterTab = 'proc-hosp' | 'ib-hosp' | 'acc-hosp' | 'master-combiner';

// ------------------------------------
// APP 1: DATA PREP MODELS
// ------------------------------------
export interface AccessoryOrderRow {
  'Billing Date': string;
  'Billing Year': number;
  'Order Type': string;
  'ShipTo Country': string;
  'Order Reason': string;
  'Total Actuals': number | string;
  'Material': string;
  'Material Description': string;
  'Billing Qty': number;
  'ShipToID': string;
  'ShipTo Name': string;
  'ShipTo Street': string;
  'ShipTo City': string;
  'ShipTo Region': string;
  'ShipTo PostalCode': string;
}

export interface KneeProcedureRow {
  'Matl Availability Date': string;
  'Ship Year': number;
  'Order Type': string;
  'Material': string;
  'Material Description': string;
  'Billing Qty': number;
  'Total Actuals': number | string;
  'ShipToID': string;
  'ShipTo Name': string;
  'ShipTo Street': string;
  'ShipTo City': string;
  'ShipTo Region': string;
  'ShipTo PostalCode': string;
}

export interface InstalledBaseRow {
  'Equipment_ID': string;
  'Model': string;
  'Location State': string;
  'IB_Shipped_Year': string | number;
  'Facility_Name': string;
  'Serial_Number': string;
  'Status': string;
}

// ------------------------------------
// APP 2: LOCATION CONSOLIDATION MODELS
// ------------------------------------
export interface ProcedureHospitalRawRow {
  HOSPITAL_NAME: string;
  ADDRESSLINE1: string;
  ADDRESSLINE2: string;
  CITY: string;
  STATE: string;
  ZIP_CODE: string | number;
  DEFINITIVE_ID: string | number;
  Report_Year?: number;
}

export interface ConsolidatedHospitalRow {
  'Hospital + Address': string;
  'Location Name': string;
  'Location Street': string;
  'City': string;
  'State': string;
  'Zip': string;
  'ID'?: string;
  'ID 2'?: string;
  'ID 3'?: string;
  'ID 4'?: string;
  'All_IDs'?: string[];
  [key: string]: any;
}

// ------------------------------------
// APP 3: WATERFALL MATCHER MODELS
// ------------------------------------
export interface WaterfallProcedureRow {
  'street address': string;
  'HOSPITAL_NAME': string;
  'CITY': string;
  'STATE': string;
  'ZIP_CODE': string;
  'Total_Knee_Procedures'?: number;
  'Total_Hip_Procedures'?: number;
  'DEFINITIVE_ID'?: string;
}

export interface WaterfallMatchedResultRow {
  'Location Name': string;
  'Location Street': string;
  'City': string;
  'State': string;
  'Zip': string;
  'Combined_ID': string;
  'HOSPITAL_NAME'?: string;
  'street address'?: string;
  'Procedure_Match_Status': string;
  'exact_match'?: string | null;
  'loose_match'?: string | null;
  [key: string]: any;
}

// ------------------------------------
// APP 4: DEFINITIVE ID MAPPER MODELS
// ------------------------------------
export interface MarketReportRow {
  DEFINITIVE_ID: string;
  HOSPITAL_NAME: string;
  CITY: string;
  STATE: string;
  TOTAL_BEDS?: number;
  ANNUAL_PROCEDURE_VOLUME?: number;
  CATEGORY?: string;
  Combined_ID?: string;
  'ID'?: string;
  'ID 2'?: string;
  'ID 3'?: string;
  [key: string]: any;
}

// ------------------------------------
// LOGS & STATS
// ------------------------------------
export interface PipelineExecutionLog {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface PipelineStats {
  originalRows: number;
  filteredRows: number;
  droppedRows: number;
  warningsCount: number;
  executionTimeMs: number;
  details?: Record<string, number | string>;
}

export interface CleanAccessoryConfig {
  validTypes: string[];
  excludeReasons: string[];
  targetCountry: string;
  removeZeroActuals: boolean;
}

export interface MergeKneeConfig {
  targetYears: number[];
  targetCountry: string;
}

export interface CleanInstalledStateConfig {
  stateStandardization: boolean;
  dropIncompleteYears: boolean;
}

export interface UXFrictionPoint {
  id: string;
  appSource: 'App 1: Data Cleaning' | 'App 2: Location Combiner' | 'App 3: Waterfall Matcher' | 'App 4: TAM ID Mapper' | 'General Architecture';
  title: string;
  category: 'Cognitive Load' | 'Visual Hierarchy' | 'Error Prevention' | 'Feedback & Status' | 'Workflow Friction';
  severity: 'Critical' | 'High' | 'Medium';
  legacyDescription: string;
  whyItHurts: string;
  modernSolution: string;
  heuristic: string;
  targetComponent: string;
}

