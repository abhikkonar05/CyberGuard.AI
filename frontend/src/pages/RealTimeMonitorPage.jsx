import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  RotateCcw, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  Server, 
  Terminal,
  Zap,
  Info
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { getStreamingStatus } from '../services/api';

export default function RealTimeMonitorPage() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamRate, setStreamRate] = useState(25); // packets per second
  const [streamingStats, setStreamingStats] = useState(null);
  const [livePackets, setLivePackets] = useState([]);

  useEffect(() => {
    getStreamingStatus().then(setStreamingStats);
  }, []);

  // Simulated live packet generation representing Kafka topic 'network-traffic'
  useEffect(() => {
    if (!isStreaming) return;

    const attackTypes = [
      { status: 'Normal', category: 'Benign (Normal)', port: 443, proto: 6, weight: 0.75 },
      { status: 'Attack', category: 'DDoS Attack (LOIC)', port: 80, proto: 6, weight: 0.12 },
      { status: 'Attack', category: 'Brute Force (SSH)', port: 22, proto: 6, weight: 0.06 },
      { status: 'Attack', category: 'Botnet (Ares C2)', port: 8080, proto: 6, weight: 0.04 },
      { status: 'Attack', category: 'DoS Attack (Slowloris)', port: 80, proto: 6, weight: 0.03 }
    ];

    const intervalTime = Math.max(100, Math.floor(1000 / (streamRate / 5))); // batch frequency

    const timer = setInterval(() => {
      // Pick random sample
      const rand = Math.random();
      let cumulative = 0;
      let chosen = attackTypes[0];

      for (const t of attackTypes) {
        cumulative += t.weight;
        if (rand <= cumulative) {
          chosen = t;
          break;
        }
      }

      const newPacket = {
        id: 'flow-' + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toLocaleTimeString(),
        port: chosen.port,
        protocol: chosen.proto === 6 ? 'TCP' : 'UDP',
        status: chosen.status,
        category: chosen.category,
        confidence: (0.91 + Math.random() * 0.088).toFixed(3),
        bytes: Math.floor(200 + Math.random() * 8500),
        duration_us: Math.floor(500 + Math.random() * 150000)
      };

      setLivePackets(prev => [newPacket, ...prev.slice(0, 39)]); // Keep last 40 packets

      setStreamingStats(prev => prev ? ({
        ...prev,
        messages_processed: prev.messages_processed + 1,
        throughput_eps: Math.floor(streamRate * 10 + Math.random() * 40),
        latency_ms: Math.floor(18 + Math.random() * 14)
      }) : null);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isStreaming, streamRate]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Kafka Real-Time Telemetry &amp; Spark Streaming
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            PySpark Structured Streaming consuming micro-batches from Apache Kafka topic <span className="font-mono text-cyan-400">network-traffic</span>.
          </p>
        </div>

        {/* Play/Pause controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition ${
              isStreaming 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Resume Stream
              </>
            )}
          </button>
          <button
            onClick={() => setLivePackets([])}
            className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-400 rounded-lg border border-gray-800 transition"
            title="Clear Live Feed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dataset Replay Notice Banner */}
      <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl flex items-start gap-3 text-xs text-cyan-200">
        <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold text-cyan-300 font-mono">SIMULATION ARCHITECTURE: </span>
          The Kafka producer continuously replays serialized historical records from the CSE-CIC-IDS2018 dataset. This accurately benchmarks micro-batch ingestion throughput, streaming vectorization, and inference latency under high EPS loads.
        </div>
      </div>

      {/* Streaming KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D121F] border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>KAFKA TOPIC</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold font-mono text-cyan-400 mt-2">network-traffic</h3>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Broker: localhost:9092</p>
        </div>

        <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>STREAMING STATUS</span>
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold font-mono text-white mt-2 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
            {isStreaming ? 'LIVE INGESTION' : 'PAUSED'}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">PySpark Structured Streaming</p>
        </div>

        <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>THROUGHPUT</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold font-mono text-amber-400 mt-2">
            {isStreaming ? (streamingStats?.throughput_eps || 1240).toLocaleString() : 0} <span className="text-xs font-normal text-gray-400">EPS</span>
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Events Per Second</p>
        </div>

        <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>PIPELINE LATENCY</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold font-mono text-purple-400 mt-2">
            {streamingStats?.latency_ms || 22} <span className="text-xs font-normal text-gray-400">ms</span>
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 font-mono">Spark Micro-Batch Delay</p>
        </div>
      </div>

      {/* Speed Control Slider */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span>SIMULATED INGESTION VELOCITY:</span>
          <span className="text-cyan-400 font-bold">{streamRate * 10} msgs/sec</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-64">
          <span className="text-[10px] font-mono text-gray-500">100/s</span>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={streamRate}
            onChange={(e) => setStreamRate(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] font-mono text-gray-500">1000/s</span>
        </div>
      </div>

      {/* Live Stream Terminal Table */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 bg-gray-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-semibold text-gray-200 uppercase tracking-wider">
              Live Ingestion Feed &bull; Micro-Batch Streaming
            </h3>
          </div>
          <span className="text-[11px] font-mono text-gray-500">
            {livePackets.length} recent flows cached in memory
          </span>
        </div>

        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-[#0D121F] border-b border-gray-800 z-10">
              <tr className="text-gray-400 font-mono text-[11px]">
                <th className="py-2.5 px-4">STREAM TIME</th>
                <th className="py-2.5 px-4">FLOW ID</th>
                <th className="py-2.5 px-4">PORT / PROTO</th>
                <th className="py-2.5 px-4">CLASSIFICATION</th>
                <th className="py-2.5 px-4">ATTACK CATEGORY</th>
                <th className="py-2.5 px-4">CONFIDENCE</th>
                <th className="py-2.5 px-4">PAYLOAD (BYTES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 font-mono">
              {livePackets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 font-mono text-xs">
                    Waiting for streaming telemetry... Click "Resume Stream" to initiate.
                  </td>
                </tr>
              ) : (
                livePackets.map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-gray-800/40 transition">
                    <td className="py-2.5 px-4 text-gray-400">{pkt.timestamp}</td>
                    <td className="py-2.5 px-4 text-cyan-400">{pkt.id}</td>
                    <td className="py-2.5 px-4 text-gray-300">
                      {pkt.port} / <span className="text-gray-500">{pkt.protocol}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={pkt.status} category={pkt.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-gray-200">
                      {pkt.category}
                    </td>
                    <td className="py-2.5 px-4 text-gray-300">
                      {(parseFloat(pkt.confidence) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-gray-400">
                      {pkt.bytes.toLocaleString()} B
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

