export const ATTACK_CATEGORIES = {
  BENIGN: {
    name: 'Benign (Normal)',
    color: '#10B981', // Emerald
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    description: 'Legitimate regular network communications with normal protocol handshakes.'
  },
  DDOS: {
    name: 'DDoS Attack',
    color: '#EF4444', // Red
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    description: 'Distributed Denial of Service flood overwhelming network bandwidth or service queues (e.g. LOIC, HOIC).'
  },
  DOS: {
    name: 'DoS Attack',
    color: '#F97316', // Orange
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    description: 'Denial of Service attack targeting socket exhaustion or resource starvation (Slowloris, Hulk, GoldenEye).'
  },
  BOTNET: {
    name: 'Botnet Activity',
    color: '#8B5CF6', // Purple
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    description: 'Automated compromised host communicating with Command & Control (C2) servers.'
  },
  BRUTE_FORCE: {
    name: 'Brute Force',
    color: '#EC4899', // Pink
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-400',
    description: 'High-frequency credential guessing attack against SSH, FTP, or Web authenticators.'
  },
  INFILTRATION: {
    name: 'Infiltration',
    color: '#EAB308', // Yellow
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    description: 'Exploitation of internal network application or vulnerable software post-compromise.'
  },
  WEB_ATTACK: {
    name: 'Web / SQL Injection',
    color: '#06B6D4', // Cyan
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-400',
    description: 'SQL Injection, Cross-Site Scripting (XSS), or directory traversal payload in HTTP request.'
  }
};

export const PRESET_TRAFFIC_SAMPLES = [
  {
    label: 'Normal HTTPS Browsing (Benign)',
    category: 'BENIGN',
    data: {
      DstPort: 443,
      Protocol: 6,
      FlowDuration: 120540,
      TotFwdPkts: 12,
      TotBwdPkts: 14,
      TotLenFwdPkts: 820,
      TotLenBwdPkts: 14200,
      FwdPktLenMax: 420,
      FwdPktLenMin: 0,
      FwdPktLenMean: 68.3,
      BwdPktLenMax: 1460,
      BwdPktLenMin: 0,
      BwdPktLenMean: 1014.2,
      FlowBytsPerSec: 124500.5,
      FlowPktsPerSec: 215.7,
      FlowIATMean: 4636.1,
      FlowIATStd: 11200.4,
      FwdIATTot: 118000,
      BwdIATTot: 119500,
      FwdHeaderLen: 392,
      BwdHeaderLen: 456,
      SYNFlagCnt: 1,
      RSTFlagCnt: 0,
      ACKFlagCnt: 24,
      DownUpRatio: 1.16,
      InitFwdWinByts: 29200,
      InitBwdWinByts: 65535
    }
  },
  {
    label: 'DDoS LOIC HTTP Flood Attack',
    category: 'DDOS',
    data: {
      DstPort: 80,
      Protocol: 6,
      FlowDuration: 2840,
      TotFwdPkts: 85,
      TotBwdPkts: 0,
      TotLenFwdPkts: 24500,
      TotLenBwdPkts: 0,
      FwdPktLenMax: 850,
      FwdPktLenMin: 220,
      FwdPktLenMean: 288.2,
      BwdPktLenMax: 0,
      BwdPktLenMin: 0,
      BwdPktLenMean: 0.0,
      FlowBytsPerSec: 8626760.5,
      FlowPktsPerSec: 29929.5,
      FlowIATMean: 33.8,
      FlowIATStd: 12.1,
      FwdIATTot: 2840,
      BwdIATTot: 0,
      FwdHeaderLen: 2720,
      BwdHeaderLen: 0,
      SYNFlagCnt: 0,
      RSTFlagCnt: 0,
      ACKFlagCnt: 85,
      DownUpRatio: 0.0,
      InitFwdWinByts: 8192,
      InitBwdWinByts: -1
    }
  },
  {
    label: 'SSH Brute Force Credential Spray',
    category: 'BRUTE_FORCE',
    data: {
      DstPort: 22,
      Protocol: 6,
      FlowDuration: 945200,
      TotFwdPkts: 38,
      TotBwdPkts: 42,
      TotLenFwdPkts: 2680,
      TotLenBwdPkts: 4890,
      FwdPktLenMax: 640,
      FwdPktLenMin: 0,
      FwdPktLenMean: 70.5,
      BwdPktLenMax: 980,
      BwdPktLenMin: 0,
      BwdPktLenMean: 116.4,
      FlowBytsPerSec: 8008.8,
      FlowPktsPerSec: 84.6,
      FlowIATMean: 11964.5,
      FlowIATStd: 18400.2,
      FwdIATTot: 940000,
      BwdIATTot: 942000,
      FwdHeaderLen: 1240,
      BwdHeaderLen: 1360,
      SYNFlagCnt: 1,
      RSTFlagCnt: 1,
      ACKFlagCnt: 78,
      DownUpRatio: 1.1,
      InitFwdWinByts: 14600,
      InitBwdWinByts: 28960
    }
  },
  {
    label: 'Botnet Ares C2 Heartbeat Beacon',
    category: 'BOTNET',
    data: {
      DstPort: 8080,
      Protocol: 6,
      FlowDuration: 62000000,
      TotFwdPkts: 6,
      TotBwdPkts: 5,
      TotLenFwdPkts: 450,
      TotLenBwdPkts: 280,
      FwdPktLenMax: 120,
      FwdPktLenMin: 0,
      FwdPktLenMean: 75.0,
      BwdPktLenMax: 90,
      BwdPktLenMin: 0,
      BwdPktLenMean: 56.0,
      FlowBytsPerSec: 11.7,
      FlowPktsPerSec: 0.17,
      FlowIATMean: 6200000.0,
      FlowIATStd: 1450000.0,
      FwdIATTot: 61800000,
      BwdIATTot: 61500000,
      FwdHeaderLen: 192,
      BwdHeaderLen: 160,
      SYNFlagCnt: 1,
      RSTFlagCnt: 0,
      ACKFlagCnt: 10,
      DownUpRatio: 0.83,
      InitFwdWinByts: 64240,
      InitBwdWinByts: 64240
    }
  }
];

