import { AccessoryOrderRow, KneeProcedureRow, InstalledBaseRow } from '../types';

export const SAMPLE_ACCESSORY_DATA: AccessoryOrderRow[] = [
  {
    'Billing Date': '2023-03-15',
    'Billing Year': 2023,
    'Order Type': 'KE',
    'ShipTo Country': 'US',
    'Order Reason': '',
    'Total Actuals': '$1,450.00',
    'Material': 'ACC-30491',
    'Material Description': 'Trios Carbon Frame Extension Adapter',
    'Billing Qty': 2,
    'ShipToID': 'ST-88201',
    'ShipTo Name': 'Mayo Clinic Hospital',
    'ShipTo Street': '200 1st St SW',
    'ShipTo City': 'Rochester',
    'ShipTo Region': 'MN',
    'ShipTo PostalCode': '55905'
  },
  {
    'Billing Date': '2022-11-20',
    'Billing Year': 2022,
    'Order Type': 'RE',
    'ShipTo Country': 'US',
    'Order Reason': 'METECH', // Should be dropped!
    'Total Actuals': 850.00,
    'Material': 'ACC-11029',
    'Material Description': 'Prone View Helmet Insert Set',
    'Billing Qty': 1,
    'ShipToID': 'ST-10394',
    'ShipTo Name': 'Cleveland Clinic Health Center',
    'ShipTo Street': '9500 Euclid Ave',
    'ShipTo City': 'Cleveland',
    'ShipTo Region': 'OH',
    'ShipTo PostalCode': '44195'
  },
  {
    'Billing Date': '2023-05-18',
    'Billing Year': 2023,
    'Order Type': 'ZDOM',
    'ShipTo Country': 'US',
    'Order Reason': '',
    'Total Actuals': 3200.00,
    'Material': 'ACC-99210',
    'Material Description': 'Modular Table Cervical Traction Pulley',
    'Billing Qty': 1,
    'ShipToID': 'ST-55102',
    'ShipTo Name': 'Stanford Healthcare Pavilion',
    'ShipTo Street': '300 Pasteur Dr',
    'ShipTo City': 'Stanford',
    'ShipTo Region': 'CA',
    'ShipTo PostalCode': '94305'
  },
  {
    'Billing Date': '2021-08-04',
    'Billing Year': 2021,
    'Order Type': 'ZRMA',
    'ShipTo Country': 'US',
    'Order Reason': 'TRADE IN', // Should be dropped!
    'Total Actuals': 2100.00,
    'Material': 'ACC-44910',
    'Material Description': 'Wilson Plus Radiolucent Frame',
    'Billing Qty': 1,
    'ShipToID': 'ST-77391',
    'ShipTo Name': 'Johns Hopkins Hospital',
    'ShipTo Street': '1800 Orleans St',
    'ShipTo City': 'Baltimore',
    'ShipTo Region': 'MD',
    'ShipTo PostalCode': '21287'
  },
  {
    'Billing Date': '2023-01-12',
    'Billing Year': 2023,
    'Order Type': 'ZSRV',
    'ShipTo Country': 'CA', // Dropped: not US
    'Order Reason': '',
    'Total Actuals': 980.00,
    'Material': 'ACC-88319',
    'Material Description': 'Lateral Support System Left/Right',
    'Billing Qty': 1,
    'ShipToID': 'ST-99021',
    'ShipTo Name': 'Toronto General Hospital',
    'ShipTo Street': '200 Elizabeth St',
    'ShipTo City': 'Toronto',
    'ShipTo Region': 'ON',
    'ShipTo PostalCode': 'M5G2C4'
  },
  {
    'Billing Date': '2023-09-02',
    'Billing Year': 2023,
    'Order Type': 'ZTOR',
    'ShipTo Country': 'US',
    'Order Reason': '',
    'Total Actuals': 0, // Dropped: 0 actuals
    'Material': 'ACC-22104',
    'Material Description': 'Replacement Fluid Catch Basin',
    'Billing Qty': 4,
    'ShipToID': 'ST-33019',
    'ShipTo Name': 'Cedars-Sinai Medical Center',
    'ShipTo Street': '8700 Beverly Blvd',
    'ShipTo City': 'Los Angeles',
    'ShipTo Region': 'CA',
    'ShipTo PostalCode': '90048'
  },
  {
    'Billing Date': '2022-04-14',
    'Billing Year': 2022,
    'Order Type': 'ZKE',
    'ShipTo Country': 'US',
    'Order Reason': '',
    'Total Actuals': '$4,920.00',
    'Material': 'ACC-70192',
    'Material Description': 'Hana Spine Traction Foot Boot Small',
    'Billing Qty': 2,
    'ShipToID': 'ST-44109',
    'ShipTo Name': 'NYU Langone Orthopedic Hospital',
    'ShipTo Street': '301 E 17th St',
    'ShipTo City': 'New York',
    'ShipTo Region': 'NY',
    'ShipTo PostalCode': '10003'
  },
  {
    'Billing Date': '2023-07-29',
    'Billing Year': 2023,
    'Order Type': 'ZOR',
    'ShipTo Country': 'US',
    'Order Reason': '',
    'Total Actuals': 1850.50,
    'Material': 'ACC-55201',
    'Material Description': 'Perineal Post Radiolucent Carbon Pad',
    'Billing Qty': 1,
    'ShipToID': 'ST-66219',
    'ShipTo Name': 'Northwestern Memorial Hospital',
    'ShipTo Street': '251 E Huron St',
    'ShipTo City': 'Chicago',
    'ShipTo Region': 'IL',
    'ShipTo PostalCode': '60611'
  },
  {
    'Billing Date': '2023-10-11',
    'Billing Year': 2023,
    'Order Type': 'ZRET',
    'ShipTo Country': 'US',
    'Order Reason': '',
    'Total Actuals': 750.00,
    'Material': 'ACC-11928',
    'Material Description': 'Anterior Hip Spar Joint Connector',
    'Billing Qty': 1,
    'ShipToID': 'ST-88129',
    'ShipTo Name': 'Texas Medical Center Methodist',
    'ShipTo Street': '6565 Fannin St',
    'ShipTo City': 'Houston',
    'ShipTo Region': 'TX',
    'ShipTo PostalCode': '77030'
  },
  {
    'Billing Date': '2022-12-05',
    'Billing Year': 2022,
    'Order Type': 'INVALID_TYPE', // Dropped: invalid order type
    'ShipTo Country': 'US',
    'Order Reason': '',
    'Total Actuals': 500.00,
    'Material': 'ACC-99000',
    'Material Description': 'Test Dummy Part',
    'Billing Qty': 1,
    'ShipToID': 'ST-00000',
    'ShipTo Name': 'Test Facility',
    'ShipTo Street': '100 Test St',
    'ShipTo City': 'Dallas',
    'ShipTo Region': 'TX',
    'ShipTo PostalCode': '75001'
  }
];

export const SAMPLE_KNEE_PROCEDURES_DATA: KneeProcedureRow[] = [
  {
    'Matl Availability Date': '2014-06-19',
    'Ship Year': 2014,
    'Order Type': 'KE',
    'Material': 'KN-50190',
    'Material Description': 'Knee Positioner Boot Assembly Legacy',
    'Billing Qty': 1,
    'Total Actuals': 3450.00,
    'ShipToID': 'ST-22910',
    'ShipTo Name': 'UPMC Presbyterian Shadyside',
    'ShipTo Street': '200 Lothrop St',
    'ShipTo City': 'Pittsburgh',
    'ShipTo Region': 'PA',
    'ShipTo PostalCode': '15213'
  },
  {
    'Matl Availability Date': '2015-09-11',
    'Ship Year': 2015,
    'Order Type': 'ZDOM',
    'Material': 'KN-50220',
    'Material Description': 'Femoral Distractor Bracket 2015 Ed',
    'Billing Qty': 2,
    'Total Actuals': 2800.00,
    'ShipToID': 'ST-44912',
    'ShipTo Name': 'Barnes-Jewish Hospital',
    'ShipTo Street': '1 Barnes Jewish Hospital Plaza',
    'ShipTo City': 'St. Louis',
    'ShipTo Region': 'MO',
    'ShipTo PostalCode': '63110'
  },
  {
    'Matl Availability Date': '2016-11-04',
    'Ship Year': 2016,
    'Order Type': 'RE',
    'Material': 'KN-50340',
    'Material Description': 'Total Knee Articulating Flexion Base',
    'Billing Qty': 1,
    'Total Actuals': 4100.00,
    'ShipToID': 'ST-88129',
    'ShipTo Name': 'Texas Medical Center Methodist',
    'ShipTo Street': '6565 Fannin St',
    'ShipTo City': 'Houston',
    'ShipTo Region': 'TX',
    'ShipTo PostalCode': '77030'
  },
  {
    'Matl Availability Date': '2019-02-14', // Dropped: 2019 not in target [2013-2016]
    'Ship Year': 2019,
    'Order Type': 'KE',
    'Material': 'KN-99000',
    'Material Description': 'Post-2017 Knee System (Should Exclude)',
    'Billing Qty': 1,
    'Total Actuals': 5500.00,
    'ShipToID': 'ST-10394',
    'ShipTo Name': 'Cleveland Clinic Health Center',
    'ShipTo Street': '9500 Euclid Ave',
    'ShipTo City': 'Cleveland',
    'ShipTo Region': 'OH',
    'ShipTo PostalCode': '44195'
  }
];

export const SAMPLE_INSTALLED_BASE_DATA: InstalledBaseRow[] = [
  {
    Equipment_ID: 'EQ-800101',
    Model: 'Hana Orthopedic Table',
    'Location State': 'CA',
    'IB_Shipped_Year': 2021,
    Facility_Name: 'UCSF Medical Center at Mission Bay',
    Serial_Number: 'HN-99201',
    Status: 'Active'
  },
  {
    Equipment_ID: 'EQ-800102',
    Model: 'ProAxis Spinal Surgery Table',
    'Location State': 'california', // Will standardize to California
    'IB_Shipped_Year': 2022,
    Facility_Name: 'Cedars-Sinai Surgical Center',
    Serial_Number: 'PA-33910',
    Status: 'Active'
  },
  {
    Equipment_ID: 'EQ-800103',
    Model: 'Trios Spine Top Table System',
    'Location State': 'TEXAS', // Will standardize to Texas
    'IB_Shipped_Year': 2020,
    Facility_Name: 'Baylor St. Luke\'s Medical Center',
    Serial_Number: 'TR-10291',
    Status: 'Active'
  },
  {
    Equipment_ID: 'EQ-800104',
    Model: 'Hana Orthopedic Table',
    'Location State': 'NY',
    'IB_Shipped_Year': '-', // Should be dropped because year = '-'
    Facility_Name: 'Mount Sinai Queens Surgical Hub',
    Serial_Number: 'HN-88401',
    Status: 'Decommissioned'
  },
  {
    Equipment_ID: 'EQ-800105',
    Model: 'Insite Table with Radiolucent Top',
    'Location State': 'FL',
    'IB_Shipped_Year': 2023,
    Facility_Name: 'UF Health Shands Hospital',
    Serial_Number: 'IN-77301',
    Status: 'Active'
  },
  {
    Equipment_ID: 'EQ-800106',
    Model: 'ProAxis Spinal Surgery Table',
    'Location State': 'Unknown Territory / N/A', // Bad state -> Excluded_States sheet
    'IB_Shipped_Year': 2022,
    Facility_Name: 'International Demo Center',
    Serial_Number: 'PA-00019',
    Status: 'Pending Review'
  },
  {
    Equipment_ID: 'EQ-800107',
    Model: 'Hana Orthopedic Table',
    'Location State': 'massachusetts', // Standardize to Massachusetts
    'IB_Shipped_Year': 2019,
    Facility_Name: 'Massachusetts General Hospital',
    Serial_Number: 'HN-44192',
    Status: 'Active'
  },
  {
    Equipment_ID: 'EQ-800108',
    Model: 'Modular Table System 5803',
    'Location State': 'WA',
    'IB_Shipped_Year': 2024,
    Facility_Name: 'UW Medical Center - Montlake',
    Serial_Number: 'MT-55019',
    Status: 'Active'
  }
];

export const US_STATES_MAP: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia'
};

export const POPULAR_ORDER_TYPES = [
  'KE', 'RE', 'ZDOM', 'ZRMA', 'ZSRV', 'ZTOR', 'ZKE', 'ZOR', 'ZRET'
];

export const KNOWN_EXCLUDE_REASONS = [
  'METECH', 'TRADE IN', 'LOANER', 'SCRAP', 'DEMO', 'RETURN_REFUND'
];

// -------------------------------------------------------------
// APP 2: SAMPLE LOCATION CONSOLIDATION DATA
// -------------------------------------------------------------
export const SAMPLE_TAM_PROCEDURE_HOSPITALS = [
  {
    HOSPITAL_NAME: 'MAYO CLINIC HOSPITAL - ROCHESTER',
    ADDRESSLINE1: '200 1ST ST SW',
    ADDRESSLINE2: 'STE 400',
    CITY: 'ROCHESTER',
    STATE: 'MN',
    ZIP_CODE: '55905',
    DEFINITIVE_ID: '109283',
    Report_Year: 2022
  },
  {
    HOSPITAL_NAME: 'MAYO CLINIC ROCHESTER',
    ADDRESSLINE1: '200 1ST STREET SW',
    ADDRESSLINE2: '',
    CITY: 'ROCHESTER',
    STATE: 'MN',
    ZIP_CODE: '55905-0001',
    DEFINITIVE_ID: '109283', // Duplicate across years -> collapses to single unique
    Report_Year: 2023
  },
  {
    HOSPITAL_NAME: 'CLEVELAND CLINIC MAIN CAMPUS',
    ADDRESSLINE1: '9500 EUCLID AVENUE',
    ADDRESSLINE2: 'BLDG A',
    CITY: 'CLEVELAND',
    STATE: 'OH',
    ZIP_CODE: '44195',
    DEFINITIVE_ID: '229104',
    Report_Year: 2022
  },
  {
    HOSPITAL_NAME: 'STANFORD HEALTH CARE',
    ADDRESSLINE1: '300 PASTEUR DRIVE',
    ADDRESSLINE2: 'ROOM 102',
    CITY: 'STANFORD',
    STATE: 'CA',
    ZIP_CODE: '94305',
    DEFINITIVE_ID: '550192',
    Report_Year: 2023
  },
  {
    HOSPITAL_NAME: 'JOHNS HOPKINS HOSPITAL',
    ADDRESSLINE1: '1800 ORLEANS STREET',
    ADDRESSLINE2: '',
    CITY: 'BALTIMORE',
    STATE: 'MD',
    ZIP_CODE: '21287',
    DEFINITIVE_ID: '884102',
    Report_Year: 2024
  },
  {
    HOSPITAL_NAME: 'CEDARS-SINAI MEDICAL CENTER',
    ADDRESSLINE1: '8700 BEVERLY BOULEVARD',
    ADDRESSLINE2: 'SUITE 400',
    CITY: 'LOS ANGELES',
    STATE: 'CA',
    ZIP_CODE: '90048',
    DEFINITIVE_ID: '331908',
    Report_Year: 2024
  },
  {
    HOSPITAL_NAME: 'HOSPITAL FOR SPECIAL SURGERY',
    ADDRESSLINE1: '535 EAST 70TH STREET',
    ADDRESSLINE2: '',
    CITY: 'NEW YORK',
    STATE: 'NY',
    ZIP_CODE: '10021',
    DEFINITIVE_ID: '771029',
    Report_Year: 2023
  },
  {
    HOSPITAL_NAME: 'NORTHWESTERN MEMORIAL HOSPITAL',
    ADDRESSLINE1: '251 EAST HURON STREET',
    ADDRESSLINE2: '',
    CITY: 'CHICAGO',
    STATE: 'IL',
    ZIP_CODE: '60611',
    DEFINITIVE_ID: '441092',
    Report_Year: 2022
  }
];

export const SAMPLE_INSTALLED_BASE_LOCATIONS = [
  {
    'Hospital + Address': 'Mayo Clinic Hospital, 200 1st St SW',
    'Location Name': 'Mayo Clinic Hospital',
    'Location Street': '200 1st St SW',
    'Location City': 'Rochester',
    'Location State': 'MN',
    'Location Zip': '55905',
    'Account Number': 'ACC-9901',
    'Account Number 2': 'ACC-9902'
  },
  {
    'Hospital + Address': 'Cleveland Clinic Health Center, 9500 Euclid Ave',
    'Location Name': 'Cleveland Clinic Health Center',
    'Location Street': '9500 Euclid Ave',
    'Location City': 'Cleveland',
    'Location State': 'OH',
    'Location Zip': '44195',
    'Account Number': 'ACC-4410',
    'Account Number 2': 'ACC-4411'
  },
  {
    'Hospital + Address': 'Stanford Healthcare Pavilion, 300 Pasteur Dr',
    'Location Name': 'Stanford Healthcare Pavilion',
    'Location Street': '300 Pasteur Dr',
    'Location City': 'Stanford',
    'Location State': 'CA',
    'Location Zip': '94305',
    'Account Number': 'ACC-5520'
  },
  {
    'Hospital + Address': 'Johns Hopkins Hospital, 1800 Orleans St',
    'Location Name': 'Johns Hopkins Hospital',
    'Location Street': '1800 Orleans St',
    'Location City': 'Baltimore',
    'Location State': 'MD',
    'Location Zip': '21287',
    'Account Number': 'ACC-1801'
  },
  {
    'Hospital + Address': 'Cedars-Sinai Medical Center, 8700 Beverly Blvd',
    'Location Name': 'Cedars-Sinai Medical Center',
    'Location Street': '8700 Beverly Blvd',
    'Location City': 'Los Angeles',
    'Location State': 'CA',
    'Location Zip': '90048',
    'Account Number': 'ACC-8700'
  }
];

export const SAMPLE_ACCESSORY_LOCATIONS = [
  {
    'Hospital + Address': 'Mayo Clinic Hospital, 200 1st St SW',
    'ShipTo Name': 'Mayo Clinic Hospital',
    'ShipTo Street': '200 1st St SW',
    'ShipTo City': 'Rochester',
    'ShipTo Region': 'MN',
    'ShipTo PostalCode': '55905',
    'ShipToID': 'ST-88201',
    'ShipToID 2': 'ST-88202'
  },
  {
    'Hospital + Address': 'Cleveland Clinic Health Center, 9500 Euclid Ave',
    'ShipTo Name': 'Cleveland Clinic Health Center',
    'ShipTo Street': '9500 Euclid Ave',
    'ShipTo City': 'Cleveland',
    'ShipTo Region': 'OH',
    'ShipTo PostalCode': '44195',
    'ShipToID': 'ST-10394'
  },
  {
    'Hospital + Address': 'Stanford Healthcare Pavilion, 300 Pasteur Dr',
    'ShipTo Name': 'Stanford Healthcare Pavilion',
    'ShipTo Street': '300 Pasteur Dr',
    'ShipTo City': 'Stanford',
    'ShipTo Region': 'CA',
    'ShipTo PostalCode': '94305',
    'ShipToID': 'ST-55102',
    'ShipToID 2': 'ST-55103'
  },
  {
    'Hospital + Address': 'Hospital for Special Surgery, 535 E 70th St',
    'ShipTo Name': 'Hospital for Special Surgery',
    'ShipTo Street': '535 E 70th St',
    'ShipTo City': 'New York',
    'ShipTo Region': 'NY',
    'ShipTo PostalCode': '10021',
    'ShipToID': 'ST-77102'
  }
];

// -------------------------------------------------------------
// APP 3: SAMPLE WATERFALL MATCHER DATA
// -------------------------------------------------------------
export const STANDARD_ADDRESS_REPLACEMENTS: Record<string, string> = {
  STREET: 'ST',
  SUITE: 'STE',
  AVENUE: 'AVE',
  ROAD: 'RD',
  BOULEVARD: 'BLVD',
  DRIVE: 'DR',
  COURT: 'CT',
  PARKWAY: 'PKWY',
  HIGHWAY: 'HWY',
  BUILDING: 'BLDG',
  APARTMENT: 'APT',
  ROOM: 'RM',
  FLOOR: 'FL',
  NORTH: 'N',
  SOUTH: 'S',
  EAST: 'E',
  WEST: 'W'
};

export const WATERFALL_STEPS = [
  { id: 0, label: 'Step 1: Exact Street + Exact City', desc: 'Strict match on normalized street & city string' },
  { id: 1, label: 'Step 2: First 15 Chars Street + City', desc: 'Tolerates suffix variations (e.g. Blvd vs Boulevard)' },
  { id: 2, label: 'Step 3: First 12 Chars Street + City', desc: 'Tolerates suite/room number differences' },
  { id: 3, label: 'Step 4: Exact Street + Exact Zip Code', desc: 'Validates street against 5-digit postal code' },
  { id: 4, label: 'Step 5: First 15 Chars Street + Zip Code', desc: 'Matches street prefix within same postal code' },
  { id: 5, label: 'Step 6: First 12 Chars Street + Zip Code', desc: 'Matches shorter prefix within same postal code' },
  { id: 6, label: 'Step 7: First 2 Words Street + Zip Code', desc: 'Handles numerical street plus root name' },
  { id: 7, label: 'Step 8: Exact Hospital Name + Zip Code', desc: 'Matches canonical facility name in postal zone' },
  { id: 8, label: 'Step 9: First 2 Words Name + Zip Code (Loosest)', desc: 'Fuzzy match on primary facility name tokens' }
];

export const SAMPLE_COMBINED_PROCEDURES_CSV = [
  {
    'street address': '200 1ST ST SW',
    HOSPITAL_NAME: 'MAYO CLINIC HOSPITAL ROCHESTER',
    CITY: 'ROCHESTER',
    STATE: 'MN',
    ZIP_CODE: '55905',
    Total_Knee_Procedures: 1842,
    Total_Hip_Procedures: 2190,
    DEFINITIVE_ID: '109283'
  },
  {
    'street address': '9500 EUCLID AVE BLDG A',
    HOSPITAL_NAME: 'CLEVELAND CLINIC FOUNDATION',
    CITY: 'CLEVELAND',
    STATE: 'OH',
    ZIP_CODE: '44195',
    Total_Knee_Procedures: 2310,
    Total_Hip_Procedures: 2740,
    DEFINITIVE_ID: '229104'
  },
  {
    'street address': '300 PASTEUR DR',
    HOSPITAL_NAME: 'STANFORD HEALTH CARE HOSPITAL',
    CITY: 'STANFORD',
    STATE: 'CA',
    ZIP_CODE: '94305',
    Total_Knee_Procedures: 940,
    Total_Hip_Procedures: 1205,
    DEFINITIVE_ID: '550192'
  },
  {
    'street address': '1800 ORLEANS ST',
    HOSPITAL_NAME: 'THE JOHNS HOPKINS HOSPITAL',
    CITY: 'BALTIMORE',
    STATE: 'MD',
    ZIP_CODE: '21287',
    Total_Knee_Procedures: 1420,
    Total_Hip_Procedures: 1690,
    DEFINITIVE_ID: '884102'
  },
  {
    'street address': '8700 BEVERLY BLVD STE 400',
    HOSPITAL_NAME: 'CEDARS SINAI MEDICAL CTR',
    CITY: 'LOS ANGELES',
    STATE: 'CA',
    ZIP_CODE: '90048',
    Total_Knee_Procedures: 1120,
    Total_Hip_Procedures: 1530,
    DEFINITIVE_ID: '331908'
  },
  {
    'street address': '535 E 70TH ST',
    HOSPITAL_NAME: 'HOSPITAL FOR SPECIAL SURGERY MAIN',
    CITY: 'NEW YORK',
    STATE: 'NY',
    ZIP_CODE: '10021',
    Total_Knee_Procedures: 4890,
    Total_Hip_Procedures: 5420,
    DEFINITIVE_ID: '771029'
  }
];

// -------------------------------------------------------------
// APP 4: SAMPLE TAM MARKET REPORTS (FOR VLOOKUP MAPPER)
// -------------------------------------------------------------
export const SAMPLE_TAM_2022_REPORT = [
  {
    DEFINITIVE_ID: '109283',
    HOSPITAL_NAME: 'Mayo Clinic Hospital Rochester',
    CITY: 'Rochester',
    STATE: 'MN',
    CATEGORY: 'Orthopedics & Spine',
    TOTAL_BEDS: 1265,
    ANNUAL_PROCEDURE_VOLUME: 4032
  },
  {
    DEFINITIVE_ID: '229104',
    HOSPITAL_NAME: 'Cleveland Clinic Main Campus',
    CITY: 'Cleveland',
    STATE: 'OH',
    CATEGORY: 'Orthopedics & Spine',
    TOTAL_BEDS: 1400,
    ANNUAL_PROCEDURE_VOLUME: 5050
  },
  {
    DEFINITIVE_ID: '550192',
    HOSPITAL_NAME: 'Stanford Health Care',
    CITY: 'Stanford',
    STATE: 'CA',
    CATEGORY: 'Orthopedics & Trauma',
    TOTAL_BEDS: 613,
    ANNUAL_PROCEDURE_VOLUME: 2145
  },
  {
    DEFINITIVE_ID: '884102',
    HOSPITAL_NAME: 'Johns Hopkins Hospital',
    CITY: 'Baltimore',
    STATE: 'MD',
    CATEGORY: 'Spine Surgery & Arthroplasty',
    TOTAL_BEDS: 1162,
    ANNUAL_PROCEDURE_VOLUME: 3110
  }
];

export const SAMPLE_TAM_2023_REPORT = [
  {
    DEFINITIVE_ID: '109283',
    HOSPITAL_NAME: 'Mayo Clinic Hospital Rochester',
    CITY: 'Rochester',
    STATE: 'MN',
    CATEGORY: 'Orthopedics & Spine',
    TOTAL_BEDS: 1280,
    ANNUAL_PROCEDURE_VOLUME: 4210
  },
  {
    DEFINITIVE_ID: '331908',
    HOSPITAL_NAME: 'Cedars-Sinai Medical Center',
    CITY: 'Los Angeles',
    STATE: 'CA',
    CATEGORY: 'Orthopedic Robotic Surgery',
    TOTAL_BEDS: 886,
    ANNUAL_PROCEDURE_VOLUME: 2650
  },
  {
    DEFINITIVE_ID: '771029',
    HOSPITAL_NAME: 'Hospital for Special Surgery',
    CITY: 'New York',
    STATE: 'NY',
    CATEGORY: 'Orthopedic Specialty Center',
    TOTAL_BEDS: 215,
    ANNUAL_PROCEDURE_VOLUME: 10310
  }
];

export const SAMPLE_TAM_2024_REPORT = [
  {
    DEFINITIVE_ID: '109283',
    HOSPITAL_NAME: 'Mayo Clinic Hospital Rochester',
    CITY: 'Rochester',
    STATE: 'MN',
    CATEGORY: 'Orthopedics & Spine',
    TOTAL_BEDS: 1300,
    ANNUAL_PROCEDURE_VOLUME: 4400
  },
  {
    DEFINITIVE_ID: '229104',
    HOSPITAL_NAME: 'Cleveland Clinic Main Campus',
    CITY: 'Cleveland',
    STATE: 'OH',
    CATEGORY: 'Orthopedics & Spine',
    TOTAL_BEDS: 1440,
    ANNUAL_PROCEDURE_VOLUME: 5200
  },
  {
    DEFINITIVE_ID: '884102',
    HOSPITAL_NAME: 'Johns Hopkins Hospital',
    CITY: 'Baltimore',
    STATE: 'MD',
    CATEGORY: 'Spine Surgery & Arthroplasty',
    TOTAL_BEDS: 1180,
    ANNUAL_PROCEDURE_VOLUME: 3250
  },
  {
    DEFINITIVE_ID: '771029',
    HOSPITAL_NAME: 'Hospital for Special Surgery',
    CITY: 'New York',
    STATE: 'NY',
    CATEGORY: 'Orthopedic Specialty Center',
    TOTAL_BEDS: 220,
    ANNUAL_PROCEDURE_VOLUME: 10800
  }
];

