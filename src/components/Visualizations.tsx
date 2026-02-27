/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { motion } from 'motion/react';
import { ORGAN_SYSTEMS } from '../constants';

interface OrganRadarProps {
  data: Record<string, number>;
}

export const OrganRadar: React.FC<OrganRadarProps> = ({ data }) => {
  const chartData = ORGAN_SYSTEMS.map(system => ({
    subject: system.name,
    A: data[system.id] || 100,
    fullMark: 100,
  }));

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#1A1A1A', fontSize: 10, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Health"
            dataKey="A"
            stroke="#FF6B00"
            fill="#FF6B00"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BodyHeatMap: React.FC<{ organHealth: Record<string, number> }> = ({ organHealth }) => {
  // Simplified 2D Body Map using SVG
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 200 400" className="h-full max-h-[400px]">
        {/* Head */}
        <circle cx="100" cy="40" r="30" fill="#E5E7EB" />
        {/* Torso */}
        <rect x="60" y="75" width="80" height="150" rx="10" fill="#E5E7EB" />
        {/* Arms */}
        <rect x="30" y="80" width="25" height="140" rx="5" fill="#E5E7EB" />
        <rect x="145" y="80" width="25" height="140" rx="5" fill="#E5E7EB" />
        {/* Legs */}
        <rect x="65" y="230" width="30" height="150" rx="5" fill="#E5E7EB" />
        <rect x="105" y="230" width="30" height="150" rx="5" fill="#E5E7EB" />

        {/* Highlights */}
        {/* Heart (Cardiovascular) */}
        <circle 
          cx="100" cy="110" r="12" 
          fill={organHealth.cardiovascular < 80 ? '#FF3B30' : '#34C759'} 
          className={organHealth.cardiovascular < 60 ? 'animate-pulse' : ''}
          opacity={0.8}
        />
        {/* Liver (Hepatic) */}
        <path 
          d="M105,130 Q130,130 130,150 Q130,170 105,170 Z" 
          fill={organHealth.hepatic < 80 ? '#FF3B30' : '#34C759'} 
          opacity={0.8}
        />
        {/* Kidneys (Renal) */}
        <circle cx="85" cy="160" r="8" fill={organHealth.renal < 80 ? '#FF3B30' : '#34C759'} opacity={0.8} />
        <circle cx="115" cy="160" r="8" fill={organHealth.renal < 80 ? '#FF3B30' : '#34C759'} opacity={0.8} />
      </svg>
      
      <div className="absolute top-0 right-0 space-y-2">
        {Object.entries(organHealth).map(([key, value]) => {
          const val = value as number;
          return (
            <div key={key} className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-line/10 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${val < 60 ? 'bg-critical' : val < 85 ? 'bg-warn' : 'bg-safe'}`} />
              <span className="text-[10px] font-bold uppercase opacity-60">{key}</span>
              <span className="text-[10px] font-mono font-bold">{val}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
