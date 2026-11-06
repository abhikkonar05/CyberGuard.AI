import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Filter, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { predictCsv } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function CsvUploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [filterAttackOnly, setFilterAttackOnly] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await predictCsv(formData);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate and download a sample CSE-CIC-IDS2018 compatible CSV for testing
  const downloadSampleCsv = () => {
    const headers = "DstPort,Protocol,FlowDuration,TotFwdPkts,TotBwdPkts,TotLenFwdPkts,TotLenBwdPkts,FwdPktLenMax,FwdPktLenMin,FwdPktLenMean,BwdPktLenMax,BwdPktLenMin,BwdPktLenMean,FlowBytsPerSec,FlowPktsPerSec,FlowIATMean,FlowIATStd,FwdIATTot,BwdIATTot,FwdHeaderLen,BwdHeaderLen,SYNFlagCnt,RSTFlagCnt,ACKFlagCnt,DownUpRatio,InitFwdWinByts\n";
    const rows = [
      "443,6,120540,12,14,820,14200,420,0,68.3,1460,0,1014.2,124500.5,215.7,4636.1,11200.4,118000,119500,392,456,1,0,24,1.16,29200",
      "80,6,2840,85,0,24500,0,850,220,288.2,0,0,0,8626760.5,29929.5,33.8,12.1,2840,0,2720,0,0,0,85,0,8192",
      "22,6,945200,38,42,2680,4890,640,0,70.5,980,0,116.4,8008.8,84.6,11964.5,18400.2,940000,942000,1240,1360,1,1,78,1.1,14600",
      "8080,6,62000000,6,5,450,280,120,0,75,90,0,56,11.7,0.17,6200000,1450000,61800000,61500000,192,160,1,0,10,0.83,64240",
      "53,17,45000,2,2,80,160,40,40,40,80,80,80,5333.3,88.8,15000,2000,30000,30000,64,64,0,0,0,1,0",
      "80,6,1500,120,0,32000,0,900,200,266.6,0,0,0,21333333,80000,12.5,4.2,1500,0,3840,0,0,0,120,0,8192"
    ].join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sample_ids2018_traffic.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const records = result?.sample_records || [];
  const displayedRecords = filterAttackOnly ? records.filter(r => r.status === 'Attack') : records;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Batch Network Traffic CSV Analysis
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Upload large CSV network telemetry captures and process multi-row attack detection simultaneously.
          </p>
        </div>
        <button
          onClick={downloadSampleCsv}
          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-mono flex items-center gap-2 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Download Sample CSV
        </button>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-800 hover:border-cyan-500/50 rounded-2xl p-8 bg-[#0D121F] text-center transition-all duration-300 relative group cursor-pointer"
        onClick={() => document.getElementById('csv-file-input').click()}
      >
        <input 
          id="csv-file-input"
          type="file" 
          accept=".csv"
          onChange={handleFileChange}
          className="hidden" 
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {file ? file.name : "Drag and drop your network traffic CSV here"}
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Supports CSE-CIC-IDS2018 feature columns &bull; Maximum recommended size: 50MB
            </p>
          </div>
          {file && (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <FileText className="w-3.5 h-3.5" />
              <span>{(file.size / 1024).toFixed(1)} KB &bull; Ready to classify</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {file && (
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing Batch Rows...
              </>
            ) : (
              <>
                <span>Run Batch Classification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Batch Results View */}
      {result && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0D121F] border border-gray-800 rounded-xl p-4">
              <p className="text-xs font-mono text-gray-400 uppercase">Total Records</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-mono">{result.total_rows}</h3>
              <p className="text-[11px] text-gray-500 mt-1">Processed from CSV</p>
            </div>
            <div className="bg-[#0D121F] border border-emerald-500/30 rounded-xl p-4 bg-emerald-500/5">
              <p className="text-xs font-mono text-emerald-400 uppercase">Benign Flows</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{result.normal_detected}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Clean network traffic</p>
            </div>
            <div className="bg-[#0D121F] border border-red-500/30 rounded-xl p-4 bg-red-500/5">
              <p className="text-xs font-mono text-red-400 uppercase">Malicious Threats</p>
              <h3 className="text-2xl font-bold text-red-400 mt-1 font-mono">{result.attacks_detected}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Threat rate: {((result.attacks_detected / result.total_rows) * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0D121F] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white font-mono">Row-by-Row Inference Results</h3>
                <p className="text-xs text-gray-500">Each flow evaluated against the PySpark MLlib model pipeline</p>
              </div>
              <button
                onClick={() => setFilterAttackOnly(!filterAttackOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 border transition ${
                  filterAttackOnly 
                    ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {filterAttackOnly ? 'Showing Threats Only' : 'Filter Attacks Only'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-400 font-mono">
                    <th className="py-3 px-4">ROW #</th>
                    <th className="py-3 px-4">DST PORT</th>
                    <th className="py-3 px-4">PROTOCOL</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">CONFIDENCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-mono">
                  {displayedRecords.map((r) => (
                    <tr key={r.row} className="hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4 text-cyan-400 font-semibold">Row #{r.row}</td>
                      <td className="py-3 px-4 text-gray-300">{r.dst_port}</td>
                      <td className="py-3 px-4 text-gray-400">{r.protocol === 6 ? 'TCP (6)' : r.protocol === 17 ? 'UDP (17)' : r.protocol}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} category={r.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-gray-200">{r.category}</td>
                      <td className="py-3 px-4 text-gray-300">{(r.confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

