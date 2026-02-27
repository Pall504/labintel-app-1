/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Severity = 'normal' | 'low' | 'high' | 'critical';

export interface LabTest {
  id: string;
  name: string;
  value: number;
  unit: string;
  range: {
    min: number;
    max: number;
    criticalMin?: number;
    criticalMax?: number;
  };
  severity: Severity;
  category: string;
  explanation: string;
}

export interface MedicalPattern {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  tests: string[];
}

export interface Prognosis {
  diabetesRisk: string;
  heartDiseaseRisk: string;
  kidneyDeclineRate: string;
  interventions: string[];
}

export interface ClinicalTrial {
  name: string;
  phase: string;
  location: string;
  eligibility: string;
  contact: string;
}

export interface DrugInteraction {
  drug: string;
  effect: string;
  severity: 'mild' | 'moderate' | 'severe';
  recommendation: string;
}

export interface LabReport {
  id: string;
  date: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female';
  tests: LabTest[];
  riskScore: number;
  summary: string;
  detectedPatterns: MedicalPattern[];
  prognosis?: Prognosis;
  organHealth?: Record<string, number>;
}

export type Language = 'en' | 'hi' | 'ar' | 'es';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
