import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  X,
  FileCode,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { getPredictionsHistory } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function PredictionsHistoryPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    const data = await getPredictionsHistory();
    setPredictions(data.predictions || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = predictions.filter(item => {
    const matchesSearch = 
      item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.dst_port).includes(searchTerm);

    if (selectedFilter === 'NORMAL') {
      return matchesSearch && item.status === 'Normal';
    }
    if (selectedFilter === 'ATTACK') {
      return matchesSearch && item.status === 'Attack';
    }
    return matchesSearch;
  });

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `cyber_predictions_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            File-Based Detection Logs &amp; History
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Persisted locally in structured JSON &amp; CSV files without database dependency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-xs font-mono flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Log
          </button>
          <button
            onClick={exportAsJSON}
            className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/40 rounded-lg text-xs font-mono flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search flow ID, port number, or attack family..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'NORMAL', 'ATTACK'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                selectedFilter === f
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 font-semibold'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 font-mono">
                <th className="py-3 px-4">PREDICTION ID</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">SOURCE</th>
                <th className="py-3 px-4">TARGET PORT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">ATTACK CATEGORY</th>
                <th className="py-3 px-4">CONFIDENCE</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 font-mono text-xs">
                    No prediction records found matching the active filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition">
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{item.id}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-400">{item.source || 'Manual Input'}</td>
                    <td className="py-3 px-4 text-gray-300">Port {item.dst_port}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} category={item.category} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-gray-200">{item.category}</td>
                    <td className="py-3 px-4 text-gray-300">{(item.confidence * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D121F] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold text-white">
                  Telemetry Flow Payload #{selectedItem.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-950 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-80 border border-gray-800 text-emerald-400">
              <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

