import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Layers, 
  BookOpen, 
  CheckCircle, 
  ShieldCheck, 
  Code2, 
  Lock,
  Database
} from 'lucide-react';
import { getModelInfo } from '../services/api';

export default function ModelInfoPage() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getModelInfo().then(setInfo);
  }, []);

  const features = [
    { name: 'DstPort', type: 'Integer', desc: 'Target destination port (e.g., 80 HTTP, 443 HTTPS, 22 SSH)' },
    { name: 'Protocol', type: 'Integer', desc: 'Transport layer protocol code (6 = TCP, 17 = UDP)' },
    { name: 'FlowDuration', type: 'Integer', desc: 'Total microseconds elapsed from initial SYN/flow start to teardown' },
    { name: 'TotFwdPkts', type: 'Integer', desc: 'Total number of packets transmitted in forward (initiator) direction' },
    { name: 'TotBwdPkts', type: 'Integer', desc: 'Total number of packets transmitted in backward (responder) direction' },
    { name: 'TotLenFwdPkts', type: 'Float', desc: 'Total bytes of data payloads sent in the forward direction' },
    { name: 'TotLenBwdPkts', type: 'Float', desc: 'Total bytes of data payloads sent in backward direction' },
    { name: 'FwdPktLenMax', type: 'Float', desc: 'Maximum payload length observed among forward packets' },
    { name: 'FwdPktLenMin', type: 'Float', desc: 'Minimum payload length observed among forward packets' },
    { name: 'FwdPktLenMean', type: 'Float', desc: 'Average payload length across forward packets' },
    { name: 'BwdPktLenMax', type: 'Float', desc: 'Maximum payload length observed among backward packets' },
    { name: 'BwdPktLenMin', type: 'Float', desc: 'Minimum payload length observed among backward packets' },
    { name: 'BwdPktLenMean', type: 'Float', desc: 'Average payload length across backward packets' },
    { name: 'FlowBytsPerSec', type: 'Float', desc: 'Total flow bytes divided by flow duration in seconds' },
    { name: 'FlowPktsPerSec', type: 'Float', desc: 'Total packets divided by flow duration in seconds' },
    { name: 'FlowIATMean', type: 'Float', desc: 'Mean Inter-Arrival Time between consecutive packets in microseconds' },
    { name: 'FlowIATStd', type: 'Float', desc: 'Standard deviation of packet inter-arrival time' },
    { name: 'FwdIATTot', type: 'Float', desc: 'Total inter-arrival time across all forward packets' },
    { name: 'BwdIATTot', type: 'Float', desc: 'Total inter-arrival time across all backward packets' },
    { name: 'FwdHeaderLen', type: 'Integer', desc: 'Total header length in bytes for forward packets' },
    { name: 'BwdHeaderLen', type: 'Integer', desc: 'Total header length in bytes for backward packets' },
    { name: 'SYNFlagCnt', type: 'Integer', desc: 'Number of TCP packets with SYN flag asserted in flow' },
    { name: 'RSTFlagCnt', type: 'Integer', desc: 'Number of TCP packets with RST (reset connection) flag' },
    { name: 'ACKFlagCnt', type: 'Integer', desc: 'Number of TCP packets with ACK flag acknowledged' },
    { name: 'DownUpRatio', type: 'Float', desc: 'Download / Upload packet ratio (backward packets / forward packets)' },
    { name: 'InitFwdWinByts', type: 'Integer', desc: 'Initial TCP window advertised by forward initiator' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Model Specifications &amp; Feature Dictionary
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Technical specifications of the PySpark MLlib ensemble and the CSE-CIC-IDS2018 dataset.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
            <Layers className="w-4 h-4" />
            <span>ALGORITHM ARCHITECTURE</span>
          </div>
          <h3 className="text-base font-bold text-white">Random Forest Classifier</h3>
          <p className="text-xs text-gray-400 mt-1 font-mono">PySpark MLlib Pipeline with VectorAssembler</p>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Inference: ~18ms / packet
          </div>
        </div>

        <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-2">
            <Database className="w-4 h-4" />
            <span>TRAINING BENCHMARK</span>
          </div>
          <h3 className="text-base font-bold text-white">CSE-CIC-IDS2018</h3>
          <p className="text-xs text-gray-400 mt-1 font-mono">Canadian Institute for Cybersecurity</p>
          <div className="mt-3 text-[11px] font-mono text-gray-400">
            16+ Million labeled flows across 10 CSV days
          </div>
        </div>

        <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
            <Lock className="w-4 h-4" />
            <span>PREVENTION OF DATA LEAKAGE</span>
          </div>
          <h3 className="text-base font-bold text-white">Zero Target Leakage</h3>
          <p className="text-xs text-gray-400 mt-1 font-mono">Strict feature isolation protocol</p>
          <div className="mt-3 text-[11px] font-mono text-gray-400">
            Target <code>Label</code> is never provided as an input feature during inference.
          </div>
        </div>
      </div>

      {/* Feature Dictionary */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-gray-800 bg-gray-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Network Traffic Feature Dictionary (26 Vector Features)
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-md">
            VectorAssembler Schema
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 font-mono">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4 w-44">FEATURE COLUMN</th>
                <th className="py-3 px-4 w-28">TYPE</th>
                <th className="py-3 px-4">CYBERSECURITY DESCRIPTION &amp; ROLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {features.map((f, i) => (
                <tr key={f.name} className="hover:bg-gray-800/30 transition">
                  <td className="py-2.5 px-4 text-gray-500">{i + 1}</td>
                  <td className="py-2.5 px-4 font-bold text-cyan-400">{f.name}</td>
                  <td className="py-2.5 px-4 text-purple-400">{f.type}</td>
                  <td className="py-2.5 px-4 text-gray-300 font-sans text-xs">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

