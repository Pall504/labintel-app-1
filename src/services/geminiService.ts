/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { LabTest, LabReport, ChatMessage } from "../types";
import { MEDICAL_BENCHMARKS } from "../constants";
import { getSeverity, calculateRiskScore, detectPatterns } from "../utils/medicalLogic";

const API_KEY = process.env.GEMINI_API_KEY;

export const extractLabData = async (text: string, gender: 'male' | 'female', age: number): Promise<Partial<LabReport>> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract medical lab results from this text. Return a JSON array of objects with keys: name (normalized name like 'glucose', 'hemoglobin'), value (number), unit (string). Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.NUMBER },
            unit: { type: Type.STRING }
          },
          required: ["name", "value", "unit"]
        }
      }
    }
  });

  const rawTests = JSON.parse(response.text || "[]");
  
  const tests: LabTest[] = rawTests.map((rt: any) => {
    const benchmark = MEDICAL_BENCHMARKS[rt.name.toLowerCase()] || {
      name: rt.name,
      unit: rt.unit,
      range: { male: { min: 0, max: 100 }, female: { min: 0, max: 100 } },
      category: 'General',
      explanation: 'No detailed explanation available for this test.'
    };

    return {
      id: rt.name.toLowerCase(),
      name: benchmark.name,
      value: rt.value,
      unit: rt.unit,
      range: benchmark.range[gender],
      severity: getSeverity(rt.name, rt.value, gender),
      category: benchmark.category,
      explanation: benchmark.explanation
    };
  });

  // Calculate organ health scores (0-100)
  const organHealth: Record<string, number> = {};
  const systems = ['cardiovascular', 'hepatic', 'renal', 'endocrine', 'hematologic'];
  
  systems.forEach(system => {
    const systemTests = tests.filter(t => t.category.toLowerCase().includes(system) || system.includes(t.category.toLowerCase()));
    if (systemTests.length === 0) {
      organHealth[system] = 100;
    } else {
      const avgSeverity = systemTests.reduce((acc, t) => {
        if (t.severity === 'critical') return acc + 3;
        if (t.severity === 'high' || t.severity === 'low') return acc + 1;
        return acc;
      }, 0) / systemTests.length;
      organHealth[system] = Math.max(0, Math.round(100 - (avgSeverity * 30)));
    }
  });

  return {
    tests,
    riskScore: calculateRiskScore(tests),
    detectedPatterns: detectPatterns(tests),
    organHealth
  };
};

export const generatePrognosis = async (report: Partial<LabReport>): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these lab results, predict health trajectory for 1-5 years. Return JSON with keys: diabetesRisk (string), heartDiseaseRisk (string), kidneyDeclineRate (string), interventions (array of strings). Results: ${JSON.stringify(report.tests)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diabetesRisk: { type: Type.STRING },
          heartDiseaseRisk: { type: Type.STRING },
          kidneyDeclineRate: { type: Type.STRING },
          interventions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const chatWithAI = async (query: string, report: LabReport, history: ChatMessage[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are LabIntel AI, a medical expert. Use the patient's lab report to answer questions. Be concise, professional, and empathetic. Report: ${JSON.stringify(report)}`
    },
    history: history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))
  });
  const response = await chat.sendMessage({ message: query });
  return response.text || "I'm sorry, I couldn't process that request.";
};

export async function* chatWithAIStream(query: string, report: LabReport, history: ChatMessage[]) {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are LabIntel AI, a medical expert. Use the patient's lab report to answer questions. Be concise, professional, and empathetic. Report: ${JSON.stringify(report)}`
    },
    history: history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))
  });
  
  const result = await chat.sendMessageStream({ message: query });
  for await (const chunk of result) {
    yield chunk.text || "";
  }
}

export const findClinicalTrials = async (report: LabReport): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find 3 relevant clinical trials for a patient with these abnormalities: ${JSON.stringify(report.tests.filter(t => t.severity !== 'normal'))}. Return JSON array of objects with keys: name, phase, location, eligibility, contact.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            phase: { type: Type.STRING },
            location: { type: Type.STRING },
            eligibility: { type: Type.STRING },
            contact: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const translateUI = async (targetLang: string, baseTranslations: any): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following UI labels into the language with ISO code "${targetLang}". Return ONLY a JSON object with the same keys. Labels: ${JSON.stringify(baseTranslations)}`,
    config: {
      responseMimeType: "application/json"
    }
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Translation failed", e);
    return baseTranslations;
  }
};

export const generateSummary = async (report: Partial<LabReport>): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `As a professional medical analyst, provide a concise summary of these lab results. 
  Highlight critical issues, explain what the risk score of ${report.riskScore}/100 means, 
  and mention detected patterns: ${report.detectedPatterns?.map(p => p.name).join(', ')}.
  Tests: ${JSON.stringify(report.tests)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "Unable to generate summary.";
};
