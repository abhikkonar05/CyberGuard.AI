import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  ArrowUpRight, 
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { getDashboardStats } from '../services/api';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="font-mono text-sm text-cyan-400">Loading Network Telemetry...</p>
      </div>
    );
  }

  const {
    total_traffic = 0,
    normal_traffic = 0,
    attack_traffic = 0,
    attack_percentage = 0,
    model_accuracy = 99.4,
    attack_distribution = [],
    traffic_timeline = [],
    recent_predictions = []
  } = stats || {};

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Threat Intelligence &amp; Traffic Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time inference engine monitoring network telemetry across standard and malicious flows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-xs font-mono flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
          <Link
            to="/manual-test"
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
          >
            New Test
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Flows Analyzed"
          value={total_traffic.toLocaleString()}
          subtitle="Processed via Spark Engine"
          icon={Activity}
          color="cyan"
          change="+12.4% / hr"
        />
        <MetricCard
          title="Benign Traffic"
          value={normal_traffic.toLocaleString()}
          subtitle="Verified clean packets"
          icon={ShieldCheck}
          color="emerald"
          change={`${(100 - parseFloat(attack_percentage)).toFixed(1)}% safe`}
        />
        <MetricCard
          title="Attacks Blocked"
          value={attack_traffic.toLocaleString()}
          subtitle="Identified cyber threats"
          icon={ShieldAlert}
          color="red"
          change={`${attack_percentage}% threat rate`}
          alert={parseFloat(attack_percentage) > 10}
        />
        <MetricCard
          title="PySpark MLlib Accuracy"
          value={`${model_accuracy}%`}
          subtitle="Trained on CSE-CIC-IDS2018"
          icon={Cpu}
          color="purple"
          change="Random Forest"
        />
      </div>

      {/* Charts Grid: Timeline & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Timeline Chart */}
        <div className="lg:col-span-2 bg-[#0D121F] border border-gray-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Network Traffic Dynamics (Last 24 Hours)
              </h2>
              <p className="text-xs text-gray-500">Flow volume split between Benign baseline and flagged attacks</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-cyan-400 border border-gray-700">
              Interval: 4h
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={traffic_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="attackGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#F3F4F6' }}
                  labelStyle={{ color: '#06B6D4', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="normal" name="Benign Traffic" stroke="#10B981" fillOpacity={1} fill="url(#normalGrad)" />
                <Area type="monotone" dataKey="attack" name="Attack Flows" stroke="#EF4444" fillOpacity={1} fill="url(#attackGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Category Breakdown Pie Chart */}
        <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Attack Categorization
            </h2>
            <p className="text-xs text-gray-500">Distribution across detected attack families</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attack_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {attack_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#06B6D4'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] font-mono text-center text-gray-400 pt-2 border-t border-gray-800">
            CSE-CIC-IDS2018 Multi-Class Classification
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Recent AI Inferences
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Sub-second predictions logged to local JSON/CSV file storage</p>
          </div>
          <Link 
            to="/predictions" 
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Full Log
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 font-mono">
                <th className="py-3 px-4">FLOW ID</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">DST PORT</th>
                <th className="py-3 px-4">SOURCE</th>
                <th className="py-3 px-4">CLASSIFICATION</th>
                <th className="py-3 px-4">CONFIDENCE</th>
                <th className="py-3 px-4">PACKETS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {recent_predictions.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-3 px-4 text-cyan-400 font-semibold">{p.id}</td>
                  <td className="py-3 px-4 text-gray-400">{new Date(p.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-4 text-gray-300">
                    <span className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300">
                      {p.dst_port}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{p.source || 'Manual Input'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={p.status} category={p.category} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${p.status === 'Attack' ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${(p.confidence * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-gray-300">{(p.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {p.tot_fwd_pkts + (p.tot_bwd_pkts || 0)} pkts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

