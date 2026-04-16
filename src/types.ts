export type MeasurementStatus = '정상' | '요주의' | '이상';
export type ReportType = '수변전실' | '분전반';
export type VoltageType = '22.9kv' | '380v' | '220v';

export interface ThermalMeasurementItem {
  id: string;
  targetName: string; // 측정대상
  voltage: VoltageType;
  point1: number;
  point2: number;
  point3: number;
  maxDiff: number;
  status: MeasurementStatus;
  visualImage?: string; // base64
  thermalImage?: string; // base64
  opinion?: string; // 개별 의견
}

export interface ThermalReport {
  id: string;
  type: ReportType;
  projectName: string;
  inspectionDate: string;
  inspector: string;
  location: string;
  items: ThermalMeasurementItem[];
}
