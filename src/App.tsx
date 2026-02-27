/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertCircle, 
  ChevronRight, 
  Download, 
  FileText, 
  Globe, 
  LayoutDashboard, 
  Plus, 
  Search, 
  TrendingUp, 
  User,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import { LabReport, LabTest, Language, Severity, ClinicalTrial, ChatMessage } from './types';
import { TRANSLATIONS, AI_MODELS as MODELS_LIST, LANGUAGES } from './constants';
import { extractLabData, generateSummary, generatePrognosis, findClinicalTrials, translateUI } from './services/geminiService';
import { AIChat } from './components/AIChat';
import { OrganRadar, BodyHeatMap } from './components/Visualizations';
import { TrialContactModal } from './components/TrialContactModal';

// --- Components ---

const RiskGauge = ({ score }: { score: number }) => {
  const data = [
    { value: score },
    { value: 100 - score }
  ];
  
  const COLORS = [
    score > 70 ? '#EF4444' : score > 40 ? '#F59E0B' : '#10B981',
    '#E5E7EB'
  ];

  return (
    <div className="relative h-48 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 text-center">
        <span className="text-4xl font-bold font-mono">{score}</span>
        <p className="text-[10px] uppercase opacity-50 font-semibold">Risk Index</p>
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const styles = {
    normal: 'bg-safe/10 text-safe border-safe/20',
    low: 'bg-warn/10 text-warn border-warn/20',
    high: 'bg-warn/10 text-warn border-warn/20',
    critical: 'bg-critical/10 text-critical border-critical/20 animate-pulse'
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[severity]}`}>
      {severity}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [report, setReport] = useState<LabReport | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAI, setSelectedAI] = useState(MODELS_LIST[0].id);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [customTranslations, setCustomTranslations] = useState<Record<string, any>>({});

  const t = customTranslations[lang] || TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleLanguageChange = async (newLang: string) => {
    setLang(newLang as Language);
    if (!TRANSLATIONS[newLang] && !customTranslations[newLang]) {
      setIsTranslating(true);
      try {
        const translated = await translateUI(newLang, TRANSLATIONS.en);
        setCustomTranslations(prev => ({ ...prev, [newLang]: translated }));
      } catch (error) {
        console.error("Translation failed", error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const sampleText = `Patient: John Doe, Age: 45, Gender: Male. Results: Glucose 115 mg/dL, Hemoglobin 11.2 g/dL, Cholesterol 245 mg/dL, Creatinine 1.2 mg/dL.`;
      
      const extractedData = await extractLabData(sampleText, 'male', 45);
      const summary = await generateSummary(extractedData);
      const prognosis = await generatePrognosis(extractedData);
      
      const newReport: LabReport = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        patientName: 'John Doe',
        age: 45,
        gender: 'male',
        tests: extractedData.tests || [],
        riskScore: extractedData.riskScore || 0,
        summary,
        detectedPatterns: extractedData.detectedPatterns || [],
        prognosis,
        organHealth: extractedData.organHealth
      };

      setReport(newReport);
      setChatMessages([
        { role: 'assistant', content: `Hello! I'm your LabIntel AI assistant. I've analyzed your report from ${newReport.date}. How can I help you understand your results today?` }
      ]);
      const clinicalTrials = await findClinicalTrials(newReport);
      setTrials(clinicalTrials);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const exportToPdf = () => {
    if (!report) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Medical Lab Intelligence Report', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Patient: ${report.patientName} | Age: ${report.age} | Gender: ${report.gender}`, 14, 32);
    doc.text(`Date: ${report.date} | Risk Score: ${report.riskScore}/100`, 14, 38);

    const tableData = report.tests.map(t => [
      t.name,
      `${t.value} ${t.unit}`,
      `${t.range.min} - ${t.range.max}`,
      t.severity.toUpperCase(),
      t.category
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [['Test Name', 'Result', 'Reference Range', 'Status', 'Category']],
      body: tableData,
    });

    doc.save(`LabReport_${report.patientName}_${report.date}.pdf`);
  };

  const exportToCsv = () => {
    if (!report) return;
    const headers = ['Test Name', 'Value', 'Unit', 'Min Range', 'Max Range', 'Severity', 'Category'];
    const rows = report.tests.map(t => [
      t.name,
      t.value,
      t.unit,
      t.range.min,
      t.range.max,
      t.severity,
      t.category
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `LabReport_${report.patientName}_${report.date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTests = useMemo(() => {
    if (!report) return [];
    return report.tests.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [report, searchQuery]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside className="w-64 border-r border-line/10 flex flex-col bg-white/30 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
            <Activity size={20} />
          </div>
          <h1 className="font-bold tracking-tighter text-xl">LABINTEL</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'visuals', icon: Activity, label: 'Body Map' },
            { id: 'chat_tab', icon: Bot, label: 'AI Assistant' },
            { id: 'reports', icon: FileText, label: 'Reports' },
            { id: 'trends', icon: TrendingUp, label: 'Trends' },
            { id: 'trials', icon: ShieldAlert, label: 'Clinical Trials' },
            { id: 'settings', icon: Globe, label: 'Language' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-accent text-white shadow-lg' 
                  : 'hover:bg-accent/5 opacity-60 hover:opacity-100'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-4">
          <div className="px-4 py-3 bg-accent/5 rounded-xl border border-accent/10">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-2">Active AI Model</p>
            <select 
              value={selectedAI}
              onChange={(e) => setSelectedAI(e.target.value)}
              className="w-full bg-transparent text-xs font-bold outline-none cursor-pointer"
            >
              {MODELS_LIST.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 bg-white/50 rounded-xl border border-line/5">
            <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Dr. Sarah Smith</p>
              <p className="text-[10px] opacity-50 uppercase font-bold">Hematologist</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.title}</h2>
            <p className="opacity-50 text-sm font-medium">Welcome back, analyze your patient data with AI precision.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/50 rounded-lg p-1 border border-line/10">
              {(['en', 'hi', 'es', 'ar'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${
                    lang === l ? 'bg-ink text-bg shadow-sm' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <label className="cursor-pointer bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-accent/20 flex items-center gap-2 transition-all active:scale-95">
              <Plus size={18} />
              {isUploading ? 'Processing...' : t.upload}
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.png" />
            </label>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {!report ? (
                <div className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-accent/20 rounded-3xl bg-white shadow-sm">
                  <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-6">
                    <FileText size={40} className="text-accent opacity-40" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Report Analyzed</h3>
                  <p className="opacity-50 max-w-xs text-center text-sm font-medium">
                    Upload a medical lab report (PDF or Image) to start the AI-powered diagnostic analysis.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-6">
                  {/* Critical Alerts Banner */}
                  {report.tests.some(t => t.severity === 'critical') && (
                    <div className="col-span-12 bg-critical/10 border border-critical/20 p-4 rounded-2xl flex items-center gap-4 text-critical shadow-sm">
                      <ShieldAlert size={24} className="animate-bounce" />
                      <div>
                        <h4 className="font-bold uppercase text-xs tracking-widest">{t.critical}</h4>
                        <p className="text-sm font-medium">Multiple critical values detected. Immediate clinical intervention may be required.</p>
                      </div>
                    </div>
                  )}

                  {/* Top Row: Stats */}
                  <div className="col-span-12 lg:col-span-4 glass-card p-6 bg-white shadow-md border-accent/10">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold uppercase text-[11px] text-accent tracking-widest">{t.riskScore}</h3>
                      <AlertCircle size={16} className="text-accent opacity-30" />
                    </div>
                    <RiskGauge score={report.riskScore} />
                    <div className="mt-4 p-4 bg-accent/5 rounded-xl border border-accent/10">
                      <p className="text-xs font-medium text-ink/70 leading-relaxed">
                        {report.riskScore > 60 
                          ? "High risk index suggests systemic physiological stress. Clinical correlation recommended."
                          : "Risk index is within manageable parameters. Continue routine monitoring."}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4 glass-card p-6 flex flex-col bg-white shadow-md border-accent/10">
                    <h3 className="font-bold uppercase text-[11px] text-accent tracking-widest mb-6">{t.summary}</h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-sm font-medium leading-relaxed text-ink/80 italic font-serif">
                        "{report.summary}"
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {report.detectedPatterns.map(pattern => (
                        <div key={pattern.id} className="px-3 py-1.5 bg-accent text-white rounded-lg flex items-center gap-2 shadow-sm">
                          <AlertTriangle size={12} />
                          <span className="text-[10px] font-bold uppercase">{pattern.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4 glass-card p-6 bg-white shadow-md border-accent/10">
                    <h3 className="font-bold uppercase text-[11px] text-accent tracking-widest mb-6">{t.prognosis}</h3>
                    {report.prognosis && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                            <p className="text-[10px] uppercase opacity-50 font-bold mb-1">Diabetes Risk</p>
                            <p className="text-xs font-bold text-accent">{report.prognosis.diabetesRisk}</p>
                          </div>
                          <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                            <p className="text-[10px] uppercase opacity-50 font-bold mb-1">Heart Disease</p>
                            <p className="text-xs font-bold text-accent">{report.prognosis.heartDiseaseRisk}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
                          <p className="text-[10px] uppercase opacity-50 font-bold mb-2">Recommended Interventions</p>
                          <ul className="space-y-1">
                            {report.prognosis.interventions.map((int, i) => (
                              <li key={i} className="text-[10px] font-medium flex items-center gap-2">
                                <div className="w-1 h-1 bg-accent rounded-full" />
                                {int}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Middle Row: Data Grid */}
                  <div className="col-span-12 glass-card overflow-hidden bg-white shadow-md border-accent/10">
                    <div className="p-6 border-b border-line/10 flex justify-between items-center">
                      <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-accent opacity-40" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search tests or categories..."
                          className="w-full bg-accent/5 border border-accent/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 ring-accent/20 outline-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-4 text-[10px] font-bold uppercase opacity-60">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-safe" /> Normal</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-warn" /> Abnormal</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-critical" /> Critical</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="min-w-[800px]">
                        <div className="grid grid-cols-[40px_1.5fr_1fr_1fr_1fr] p-4 border-b border-line/10 bg-accent/5">
                          <div className="col-header text-accent">#</div>
                          <div className="col-header text-accent">Test Parameter</div>
                          <div className="col-header text-accent">Result</div>
                          <div className="col-header text-accent">Ref. Range</div>
                          <div className="col-header text-accent">Status</div>
                        </div>
                        {filteredTests.map((test, idx) => (
                          <div key={test.id} className="data-row group hover:bg-accent hover:text-white border-accent/5">
                            <div className="text-[10px] font-mono opacity-30 flex items-center group-hover:text-white/50">{idx + 1}</div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{test.name}</span>
                              <span className="text-[10px] uppercase opacity-50 font-bold group-hover:text-white/70">{test.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="data-value text-lg font-bold">{test.value}</span>
                              <span className="text-[10px] opacity-40 font-bold uppercase group-hover:text-white/50">{test.unit}</span>
                            </div>
                            <div className="flex items-center text-xs font-mono opacity-60 group-hover:text-white/70">
                              {test.range.min} - {test.range.max}
                            </div>
                            <div className="flex items-center">
                              <SeverityBadge severity={test.severity} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Trends & Knowledge */}
                  <div className="col-span-12 lg:col-span-7 glass-card p-6 bg-white shadow-md border-accent/10">
                    <h3 className="font-bold uppercase text-[11px] text-accent tracking-widest mb-6">Historical Trends</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { date: 'Jan', value: 85 },
                          { date: 'Feb', value: 92 },
                          { date: 'Mar', value: 88 },
                          { date: 'Apr', value: 115 },
                        ]}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', opacity: 0.4 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', opacity: 0.4 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#FF6B00', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-5 glass-card p-6 bg-white shadow-md border-accent/10">
                    <h3 className="font-bold uppercase text-[11px] text-accent tracking-widest mb-6">Medical Knowledge Base</h3>
                    <div className="space-y-4">
                      {report.tests.slice(0, 3).map(test => (
                        <div key={test.id} className="p-4 bg-accent/5 rounded-xl border border-accent/10 hover:border-accent transition-all cursor-help group">
                          <div className="flex items-center gap-2 mb-2">
                            <Info size={14} className="text-accent opacity-50 group-hover:opacity-100" />
                            <h4 className="text-xs font-bold uppercase tracking-tight text-accent">{test.name}</h4>
                          </div>
                          <p className="text-xs opacity-70 leading-relaxed font-medium">
                            {test.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'visuals' && (
            <motion.div 
              key="visuals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              <div className="col-span-12 lg:col-span-6 glass-card p-8 bg-white shadow-lg border-accent/10">
                <h3 className="text-xl font-bold mb-6 text-accent flex items-center gap-2">
                  <Activity size={20} />
                  {t.bodyMap}
                </h3>
                <div className="h-[500px]">
                  <BodyHeatMap organHealth={report?.organHealth || {}} />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 glass-card p-8 bg-white shadow-lg border-accent/10">
                <h3 className="text-xl font-bold mb-6 text-accent flex items-center gap-2">
                  <TrendingUp size={20} />
                  {t.organRadar}
                </h3>
                <div className="h-[500px]">
                  <OrganRadar data={report?.organHealth || {}} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'trials' && (
            <motion.div 
              key="trials"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 bg-white shadow-lg border-accent/10"
            >
              <h3 className="text-2xl font-bold mb-8 text-accent flex items-center gap-3">
                <ShieldAlert size={24} />
                {t.clinicalTrials}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trials.map((trial, i) => (
                  <div key={i} className="p-6 bg-accent/5 rounded-3xl border border-accent/10 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center mb-4">
                      <Search size={20} />
                    </div>
                    <h4 className="font-bold text-sm mb-2">{trial.name}</h4>
                    <div className="space-y-2 mb-4">
                      <p className="text-[10px] font-bold uppercase opacity-40">Phase: {trial.phase}</p>
                      <p className="text-xs opacity-60">{trial.location}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-line/5 mb-4">
                      <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Eligibility</p>
                      <p className="text-[10px] font-medium leading-relaxed">{trial.eligibility}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedTrial(trial)}
                      className="w-full py-2 bg-accent text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all"
                    >
                      Contact: {trial.contact}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'chat_tab' && (
            <motion.div 
              key="chat_tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center h-[calc(100vh-200px)]"
            >
              {report ? (
                <AIChat 
                  report={report} 
                  messages={chatMessages} 
                  setMessages={setChatMessages} 
                  onClose={() => setActiveTab('dashboard')} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center opacity-40">
                  <Bot size={64} className="mb-4" />
                  <p className="font-bold uppercase tracking-widest">Upload a report to chat</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 bg-white shadow-lg border-accent/10"
            >
              <h3 className="text-2xl font-bold mb-6 text-accent">Patient Reports History</h3>
              <div className="space-y-4">
                {[
                  { id: '1', date: '2024-04-15', patient: 'John Doe', status: 'High Risk' },
                  { id: '2', date: '2024-03-10', patient: 'John Doe', status: 'Normal' },
                  { id: '3', date: '2024-02-05', patient: 'John Doe', status: 'Low Risk' },
                ].map((rep) => (
                  <div key={rep.id} className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-accent/10 hover:bg-accent/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{rep.patient}</p>
                        <p className="text-xs opacity-50">{rep.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        rep.status === 'High Risk' ? 'bg-critical/10 text-critical' : 'bg-safe/10 text-safe'
                      }`}>
                        {rep.status}
                      </span>
                      <ChevronRight size={18} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div 
              key="trends"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 bg-white shadow-lg border-accent/10"
            >
              <h3 className="text-2xl font-bold mb-6 text-accent">Longitudinal Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-80 bg-accent/5 p-6 rounded-3xl border border-accent/10">
                  <h4 className="text-sm font-bold uppercase mb-4 opacity-50">Glucose Trends (6 Months)</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { m: 'Nov', v: 95 }, { m: 'Dec', v: 98 }, { m: 'Jan', v: 102 },
                      { m: 'Feb', v: 110 }, { m: 'Mar', v: 105 }, { m: 'Apr', v: 115 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                      <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="v" stroke="#FF6B00" strokeWidth={3} dot={{ fill: '#FF6B00', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80 bg-accent/5 p-6 rounded-3xl border border-accent/10">
                  <h4 className="text-sm font-bold uppercase mb-4 opacity-50">Cholesterol Levels</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { m: 'Nov', v: 180 }, { m: 'Dec', v: 190 }, { m: 'Jan', v: 210 },
                      { m: 'Feb', v: 205 }, { m: 'Mar', v: 230 }, { m: 'Apr', v: 245 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                      <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="v" stroke="#FF6B00" fill="#FF6B0020" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8 bg-white shadow-lg border-accent/10 max-w-4xl mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-accent mb-2">Select Language</h3>
                  <p className="text-sm opacity-60">Choose your preferred language for the dashboard.</p>
                </div>
                {isTranslating && (
                  <div className="flex items-center gap-2 text-accent animate-pulse">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-bold uppercase">AI Translating...</span>
                  </div>
                )}
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-40" size={20} />
                <input 
                  type="text" 
                  placeholder="Search languages (e.g. French, Japanese...)"
                  className="w-full bg-accent/5 border border-accent/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-4 ring-accent/10 outline-none transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {LANGUAGES.filter(l => 
                  l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  l.native.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className={`p-4 rounded-2xl text-left transition-all border ${
                      lang === l.code 
                        ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' 
                        : 'bg-white border-line/5 hover:border-accent/30 hover:bg-accent/5'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase opacity-60 mb-1">{l.name}</p>
                    <p className="text-lg font-bold">{l.native}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Chat Button */}
      {report && (
        <div className="fixed bottom-8 right-8 z-50">
          <AnimatePresence>
            {showChat ? (
              <div className="fixed inset-0 bg-ink/20 backdrop-blur-sm flex items-center justify-center p-4">
                <AIChat 
                  report={report} 
                  messages={chatMessages} 
                  setMessages={setChatMessages} 
                  onClose={() => setShowChat(false)} 
                />
              </div>
            ) : (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowChat(true)}
                className="w-16 h-16 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-accent/90 transition-all"
              >
                <Bot size={32} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Trial Contact Modal */}
      <AnimatePresence>
        {selectedTrial && (
          <TrialContactModal 
            trial={selectedTrial} 
            onClose={() => setSelectedTrial(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
