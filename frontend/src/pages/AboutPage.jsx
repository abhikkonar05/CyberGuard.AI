import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Cloud, 
  Database, 
  FileCode, 
  Layers, 
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div className="pb-2 border-b border-gray-800">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          About CyberGuard AI
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Industrial-grade AI cyber attack detection system built from scratch with Big Data and Machine Learning.
        </p>
      </div>

      {/* Hero Overview */}
      <div className="bg-[#0D121F] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(6,182,212,0.1)] relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/30">
            <ShieldCheck className="w-4 h-4" />
            ENTERPRISE CYBER DEFENSE
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            High-Throughput Threat Classification Without Database Overhead
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">
            CyberGuard AI demonstrates an enterprise-grade intrusion detection system (IDS) trained on the benchmark 
            <strong className="text-cyan-400"> CSE-CIC-IDS2018</strong> dataset. By combining 
            <strong className="text-purple-400"> Apache Spark MLlib</strong> distributed training with an ultra-fast, 
            database-free file storage engine and sub-second REST APIs, the system provides both single-flow manual testing and 
            real-time micro-batch ingestion via <strong className="text-amber-400">Apache Kafka</strong>.
          </p>
        </div>
      </div>

      {/* Zero Database Architecture Callout */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 mb-3">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          Zero-Database Architecture Explained
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          Traditional web applications require heavy relational databases like PostgreSQL or MySQL. In cybersecurity and Big Data telemetry, write bottlenecks and disk contention can slow down throughput. 
          CyberGuard AI is engineered to operate <strong className="text-white">completely without any database</strong>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 font-mono text-xs">
          <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
            <span className="text-cyan-400 font-bold block mb-1">JSON History Store</span>
            <p className="text-gray-400 text-[11px]">Real-time prediction logs are written directly to structured JSON Lines (JSONL) on disk.</p>
          </div>
          <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
            <span className="text-emerald-400 font-bold block mb-1">CSV Batch Files</span>
            <p className="text-gray-400 text-[11px]">Uploaded captures and batch analysis export cleanly to portable CSV files.</p>
          </div>
          <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
            <span className="text-purple-400 font-bold block mb-1">Spark Models</span>
            <p className="text-gray-400 text-[11px]">Pipelines are saved in standard Spark ML model folders loaded into RAM at startup.</p>
          </div>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div>
        <h3 className="text-base font-bold text-white font-mono mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Technical Stack
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4 space-y-2">
            <h4 className="text-cyan-400 font-bold uppercase">Frontend</h4>
            <ul className="text-gray-400 space-y-1">
              <li>&bull; React 18 + Vite</li>
              <li>&bull; Tailwind CSS</li>
              <li>&bull; Recharts Data Viz</li>
              <li>&bull; Axios API Client</li>
              <li>&bull; Lucide React Icons</li>
            </ul>
          </div>

          <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4 space-y-2">
            <h4 className="text-purple-400 font-bold uppercase">Backend API</h4>
            <ul className="text-gray-400 space-y-1">
              <li>&bull; Python 3.11+</li>
              <li>&bull; Django 5.x</li>
              <li>&bull; Django REST Framework</li>
              <li>&bull; Gunicorn HTTP Server</li>
              <li>&bull; WhiteNoise Assets</li>
            </ul>
          </div>

          <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4 space-y-2">
            <h4 className="text-emerald-400 font-bold uppercase">Big Data &amp; ML</h4>
            <ul className="text-gray-400 space-y-1">
              <li>&bull; Apache Spark 3.5</li>
              <li>&bull; PySpark MLlib</li>
              <li>&bull; Spark Structured Streaming</li>
              <li>&bull; Apache Kafka (Topic: network-traffic)</li>
              <li>&bull; VectorAssembler Pipeline</li>
            </ul>
          </div>

          <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4 space-y-2">
            <h4 className="text-amber-400 font-bold uppercase">Deployment</h4>
            <ul className="text-gray-400 space-y-1">
              <li>&bull; Render Web Service</li>
              <li>&bull; Render Static Site</li>
              <li>&bull; Docker &amp; Compose</li>
              <li>&bull; Git / GitHub CI/CD</li>
              <li>&bull; Zero Cloud DB Cost</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

