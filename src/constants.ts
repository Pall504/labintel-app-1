/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalPattern } from './types';

export const MEDICAL_BENCHMARKS: Record<string, any> = {
  glucose: {
    name: 'Glucose (Fasting)',
    unit: 'mg/dL',
    range: { male: { min: 70, max: 99, criticalMin: 40, criticalMax: 250 }, female: { min: 70, max: 99, criticalMin: 40, criticalMax: 250 } },
    category: 'Metabolic',
    explanation: 'Measures the amount of sugar in your blood. High levels can indicate diabetes or pre-diabetes.'
  },
  hemoglobin: {
    name: 'Hemoglobin',
    unit: 'g/dL',
    range: { male: { min: 13.5, max: 17.5, criticalMin: 7, criticalMax: 20 }, female: { min: 12.0, max: 15.5, criticalMin: 7, criticalMax: 20 } },
    category: 'Hematology',
    explanation: 'A protein in red blood cells that carries oxygen. Low levels indicate anemia.'
  },
  cholesterol: {
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    range: { male: { min: 125, max: 200, criticalMax: 300 }, female: { min: 125, max: 200, criticalMax: 300 } },
    category: 'Lipid Profile',
    explanation: 'A waxy substance found in your blood. High levels increase risk of heart disease.'
  },
  creatinine: {
    name: 'Creatinine',
    unit: 'mg/dL',
    range: { male: { min: 0.7, max: 1.3, criticalMax: 5 }, female: { min: 0.6, max: 1.1, criticalMax: 5 } },
    category: 'Renal',
    explanation: 'A waste product filtered by kidneys. High levels may indicate impaired kidney function.'
  },
  alt: {
    name: 'ALT (Alanine Aminotransferase)',
    unit: 'U/L',
    range: { male: { min: 7, max: 55, criticalMax: 1000 }, female: { min: 7, max: 45, criticalMax: 1000 } },
    category: 'Liver',
    explanation: 'An enzyme found mostly in the liver. High levels suggest liver damage.'
  }
};

export const MEDICAL_PATTERNS: MedicalPattern[] = [
  {
    id: 'anemia',
    name: 'Anemia Pattern',
    description: 'Low hemoglobin and red blood cell counts suggest iron deficiency or other forms of anemia.',
    severity: 'medium',
    tests: ['hemoglobin', 'iron', 'ferritin']
  },
  {
    id: 'diabetes',
    name: 'Hyperglycemic Pattern',
    description: 'Elevated fasting glucose levels indicate potential diabetes or metabolic syndrome.',
    severity: 'high',
    tests: ['glucose', 'hba1c']
  },
  {
    id: 'renal_impairment',
    name: 'Renal Stress Pattern',
    description: 'Elevated creatinine and BUN levels suggest the kidneys are struggling to filter waste.',
    severity: 'high',
    tests: ['creatinine', 'bun']
  },
  {
    id: 'lipid_risk',
    name: 'Dyslipidemia Pattern',
    description: 'High cholesterol and LDL with low HDL indicate increased cardiovascular risk.',
    severity: 'medium',
    tests: ['cholesterol', 'ldl', 'hdl']
  }
];

export const AI_MODELS = [
  { id: 'gemini', name: 'Gemini Pro', provider: 'Google', strength: 'Medical accuracy' },
  { id: 'gpt4', name: 'GPT-4', provider: 'OpenAI', strength: 'Detailed explanations' },
  { id: 'claude', name: 'Claude', provider: 'Anthropic', strength: 'Nuanced understanding' },
  { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek', strength: 'Code & analysis' },
  { id: 'mixtral', name: 'Mixtral', provider: 'Mistral', strength: 'Fast responses' }
];

export const ORGAN_SYSTEMS = [
  { id: 'cardiovascular', name: 'Cardiovascular', icon: 'Heart', tests: ['cholesterol', 'ldl', 'hdl', 'triglycerides'] },
  { id: 'hepatic', name: 'Hepatic', icon: 'Activity', tests: ['alt', 'ast', 'ggt', 'bilirubin'] },
  { id: 'renal', name: 'Renal', icon: 'Shield', tests: ['creatinine', 'bun', 'egfr'] },
  { id: 'endocrine', name: 'Endocrine', icon: 'Zap', tests: ['glucose', 'hba1c', 'tsh'] },
  { id: 'hematologic', name: 'Hematologic', icon: 'Droplets', tests: ['hemoglobin', 'rbc', 'wbc', 'platelets'] }
];

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'fa', name: 'Persian', native: 'فارسی' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' }
];

export const TRANSLATIONS: Record<string, any> = {
  en: {
    title: 'Lab Intel Dashboard',
    upload: 'Upload Report',
    riskScore: 'Risk Score',
    patterns: 'Detected Patterns',
    summary: 'AI Summary',
    exportPdf: 'Export PDF',
    exportCsv: 'Export CSV',
    critical: 'Critical Alert',
    normal: 'Normal',
    abnormal: 'Abnormal',
    prognosis: 'Health Prognosis',
    chat: 'Medical AI Chat',
    bodyMap: 'Body Heat Map',
    organRadar: 'Organ Health Radar',
    clinicalTrials: 'Clinical Trials',
    drugChecker: 'Drug Interactions'
  },
  hi: {
    title: 'लैब इंटेलिजेंस डैशबोर्ड',
    upload: 'रिपोर्ट अपलोड करें',
    riskScore: 'जोखिम स्कोर',
    patterns: 'पाए गए पैटर्न',
    summary: 'एआई सारांश',
    exportPdf: 'पीडीएफ निर्यात',
    exportCsv: 'सीएसवी निर्यात',
    critical: 'गंभीर चेतावनी',
    normal: 'सामान्य',
    abnormal: 'असामान्य',
    prognosis: 'स्वास्थ्य पूर्वानुमान',
    chat: 'मेडिकल एआई चैट',
    bodyMap: 'बॉडी हीट मैप',
    organRadar: 'अंग स्वास्थ्य रडार',
    clinicalTrials: 'क्लिनिकल परीक्षण',
    drugChecker: 'दवाओं का प्रभाव'
  },
  es: {
    title: 'Panel de Inteligencia de Laboratorio',
    upload: 'Subir Informe',
    riskScore: 'Puntuación de Riesgo',
    patterns: 'Patrones Detectados',
    summary: 'Resumen de IA',
    exportPdf: 'Exportar PDF',
    exportCsv: 'Exportar CSV',
    critical: 'Alerta Crítica',
    normal: 'Normal',
    abnormal: 'Anormal',
    prognosis: 'Pronóstico de Salud',
    chat: 'Chat de IA Médica',
    bodyMap: 'Mapa de Calor Corporal',
    organRadar: 'Radar de Salud de Órganos',
    clinicalTrials: 'Ensayos Clínicos',
    drugChecker: 'Interacciones Medicamentosas'
  },
  ar: {
    title: 'لوحة ذكاء المختبر',
    upload: 'تحميل التقرير',
    riskScore: 'درجة المخاطر',
    patterns: 'الأنماط المكتشفة',
    summary: 'ملخص الذكاء الاصطناعي',
    exportPdf: 'تصدير PDF',
    exportCsv: 'تصدير CSV',
    critical: 'تنبيه حرج',
    normal: 'طبيعي',
    abnormal: 'غير طبيعي',
    prognosis: 'توقعات الصحة',
    chat: 'دردشة الذكاء الاصطناعي الطبي',
    bodyMap: 'خريطة حرارة الجسم',
    organRadar: 'رادار صحة الأعضاء',
    clinicalTrials: 'التجارب السريرية',
    drugChecker: 'تفاعلات الأدوية'
  }
};
