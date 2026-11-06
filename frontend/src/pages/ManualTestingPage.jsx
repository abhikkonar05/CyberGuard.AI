import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon,
  Copy,
  Info
} from 'lucide-react';
import { PRESET_TRAFFIC_SAMPLES, ATTACK_CATEGORIES } from '../utils/constants';
import { predictManual } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ManualTestingPage() {
  const [formData, setFormData] = useState(PRESET_TRAFFIC_SAMPLES[0].data);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSelectPreset = (index) => {
    setSelectedPreset(index);
    setFormData(PRESET_TRAFFIC_SAMPLES[index].data);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await predictManual(formData);
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyResultJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Manual Network Flow Classifier
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Test individual network telemetry records directly against the trained PySpark MLlib model pipeline.
        </p>
      </div>

      {/* Preset Badges Selector */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
          <Sparkles className="w-4 h-4" />
          <span>LOAD PRESET ATTACK OR NORMAL SCENARIOS:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_TRAFFIC_SAMPLES.map((preset, idx) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(idx)}
              className={`p-3 rounded-lg text-left text-xs transition border flex flex-col justify-between ${
                selectedPreset === idx
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
              }`}
            >
              <span className="font-semibold">{preset.label}</span>
              <span className="text-[10px] font-mono mt-1 opacity-70">Port {preset.data.DstPort} &bull; {preset.data.TotFwdPkts} pkts</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: 2-column on left */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-[#0D121F] border border-gray-800 rounded-xl p-5 shadow-xl">
          {/* Section 1: Socket & Volume */}
          <div>
            <h3 className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              1. Socket Connection &amp; Protocol
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1">DstPort (Target Port)</label>
                <input
                  type="number"
                  name="DstPort"
                  value={formData.DstPort}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">Protocol (6=TCP, 17=UDP)</label>
                <input
                  type="number"
                  name="Protocol"
                  value={formData.Protocol}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">FlowDuration (&mu;s)</label>
                <input
                  type="number"
                  name="FlowDuration"
                  value={formData.FlowDuration}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Packet Counts & Lengths */}
          <div className="pt-4 border-t border-gray-800/80">
            <h3 className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              2. Packet Volume &amp; Payloads (Bytes)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1">TotFwdPkts</label>
                <input
                  type="number"
                  name="TotFwdPkts"
                  value={formData.TotFwdPkts}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">TotBwdPkts</label>
                <input
                  type="number"
                  name="TotBwdPkts"
                  value={formData.TotBwdPkts}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">TotLenFwdPkts</label>
                <input
                  type="number"
                  name="TotLenFwdPkts"
                  value={formData.TotLenFwdPkts}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">TotLenBwdPkts</label>
                <input
                  type="number"
                  name="TotLenBwdPkts"
                  value={formData.TotLenBwdPkts}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">FwdPktLenMax</label>
                <input
                  type="number"
                  name="FwdPktLenMax"
                  value={formData.FwdPktLenMax}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">FwdPktLenMean</label>
                <input
                  type="number"
                  step="any"
                  name="FwdPktLenMean"
                  value={formData.FwdPktLenMean}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">BwdPktLenMax</label>
                <input
                  type="number"
                  name="BwdPktLenMax"
                  value={formData.BwdPktLenMax}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">BwdPktLenMean</label>
                <input
                  type="number"
                  step="any"
                  name="BwdPktLenMean"
                  value={formData.BwdPktLenMean}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Flow Rates & Flags */}
          <div className="pt-4 border-t border-gray-800/80">
            <h3 className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              3. Rates, Inter-Arrival &amp; TCP Flags
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 font-mono mb-1">FlowBytsPerSec</label>
                <input
                  type="number"
                  step="any"
                  name="FlowBytsPerSec"
                  value={formData.FlowBytsPerSec}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">FlowPktsPerSec</label>
                <input
                  type="number"
                  step="any"
                  name="FlowPktsPerSec"
                  value={formData.FlowPktsPerSec}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">SYNFlagCnt</label>
                <input
                  type="number"
                  name="SYNFlagCnt"
                  value={formData.SYNFlagCnt}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">ACKFlagCnt</label>
                <input
                  type="number"
                  name="ACKFlagCnt"
                  value={formData.ACKFlagCnt}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">RSTFlagCnt</label>
                <input
                  type="number"
                  name="RSTFlagCnt"
                  value={formData.RSTFlagCnt}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">DownUpRatio</label>
                <input
                  type="number"
                  step="any"
                  name="DownUpRatio"
                  value={formData.DownUpRatio}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">InitFwdWinByts</label>
                <input
                  type="number"
                  name="InitFwdWinByts"
                  value={formData.InitFwdWinByts}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-mono mb-1">FwdHeaderLen</label>
                <input
                  type="number"
                  name="FwdHeaderLen"
                  value={formData.FwdHeaderLen}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => handleSelectPreset(selectedPreset)}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 rounded-lg text-xs font-mono flex items-center gap-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Values
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Inferencing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Classify Network Flow
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prediction Result Display */}
        <div className="space-y-4">
          <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h2 className="text-sm font-mono font-semibold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Inference Verdict
              </h2>
              {result && (
                <button
                  onClick={copyResultJSON}
                  className="text-gray-400 hover:text-cyan-400 transition"
                  title="Copy result JSON"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            {!result ? (
              <div className="py-12 text-center text-gray-500 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center text-gray-400">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                <p className="text-xs font-mono">Fill out the features or choose a preset and click "Classify Network Flow".</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl border text-center ${
                  result.status === 'Attack' 
                    ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                }`}>
                  <div className="inline-flex p-3 rounded-full bg-black/40 mb-2">
                    {result.status === 'Attack' ? (
                      <AlertOctagon className="w-8 h-8 text-red-500 animate-bounce" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-mono font-extrabold uppercase tracking-wider">
                    {result.status === 'Attack' ? 'MALICIOUS ATTACK' : 'BENIGN TRAFFIC'}
                  </h3>
                  <p className="text-sm font-semibold mt-1">
                    {result.category}
                  </p>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Model Confidence</span>
                    <span className="font-bold text-white">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${result.status === 'Attack' ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
                    />
                  </div>
                </div>

                {/* Details list */}
                <div className="bg-gray-900/60 rounded-lg p-3 space-y-2 text-xs font-mono border border-gray-800">
                  <div className="flex justify-between text-gray-400">
                    <span>Prediction ID:</span>
                    <span className="text-cyan-400">{result.prediction_id}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Target Port:</span>
                    <span className="text-gray-200">{formData.DstPort}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Inference Latency:</span>
                    <span className="text-emerald-400">&lt; 25 ms</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Storage Engine:</span>
                    <span className="text-gray-300">File-based JSON Log</span>
                  </div>
                </div>

                {/* Threat Mitigation Guidance */}
                <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/60 text-xs text-gray-300">
                  <p className="font-semibold text-cyan-400 mb-1 font-mono">Recommended Security Action:</p>
                  <p className="text-[11px] leading-relaxed">
                    {result.status === 'Attack' 
                      ? 'Drop connection at perimeter edge firewall, blacklist source IP, and apply rate limiting on target port.'
                      : 'Flow complies with RFC protocol baselines. Allow passage through firewall.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

