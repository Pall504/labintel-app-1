/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LabTest, Severity, MedicalPattern, LabReport } from '../types';
import { MEDICAL_BENCHMARKS, MEDICAL_PATTERNS } from '../constants';

export const getSeverity = (name: string, value: number, gender: 'male' | 'female'): Severity => {
  const benchmark = MEDICAL_BENCHMARKS[name.toLowerCase()];
  if (!benchmark) return 'normal';

  const range = benchmark.range[gender];
  if (range.criticalMin !== undefined && value <= range.criticalMin) return 'critical';
  if (range.criticalMax !== undefined && value >= range.criticalMax) return 'critical';
  if (value < range.min) return 'low';
  if (value > range.max) return 'high';
  return 'normal';
};

export const calculateRiskScore = (tests: LabTest[]): number => {
  if (tests.length === 0) return 0;

  let totalWeight = 0;
  let score = 0;

  tests.forEach(test => {
    let weight = 1;
    let testScore = 0;

    // Categories like Metabolic and Renal have higher weights
    if (['Metabolic', 'Renal', 'Liver'].includes(test.category)) weight = 2;

    switch (test.severity) {
      case 'critical': testScore = 100; break;
      case 'high':
      case 'low': testScore = 50; break;
      case 'normal': testScore = 0; break;
    }

    score += testScore * weight;
    totalWeight += weight;
  });

  return Math.min(Math.round(score / totalWeight), 100);
};

export const detectPatterns = (tests: LabTest[]): MedicalPattern[] => {
  const testNames = tests.map(t => t.id.toLowerCase());
  const abnormalTests = tests.filter(t => t.severity !== 'normal').map(t => t.id.toLowerCase());

  return MEDICAL_PATTERNS.filter(pattern => {
    const requiredTests = pattern.tests;
    // A pattern is detected if at least 2 required tests are present and at least one is abnormal
    const presentTests = requiredTests.filter(rt => testNames.includes(rt));
    const hasAbnormal = requiredTests.some(rt => abnormalTests.includes(rt));
    return presentTests.length >= 2 && hasAbnormal;
  });
};
