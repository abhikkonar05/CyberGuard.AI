"""
Feature Pipeline & Preprocessing.
Defines canonical CSE-CIC-IDS2018 feature schema, validates inputs,
handles infinite values and nulls, and strictly enforces zero data leakage.
"""

import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)

# The 26 canonical feature columns matching the PySpark VectorAssembler schema
CANONICAL_FEATURES = [
    'DstPort', 'Protocol', 'FlowDuration', 'TotFwdPkts', 'TotBwdPkts',
    'TotLenFwdPkts', 'TotLenBwdPkts', 'FwdPktLenMax', 'FwdPktLenMin', 'FwdPktLenMean',
    'BwdPktLenMax', 'BwdPktLenMin', 'BwdPktLenMean', 'FlowBytsPerSec', 'FlowPktsPerSec',
    'FlowIATMean', 'FlowIATStd', 'FwdIATTot', 'BwdIATTot', 'FwdHeaderLen',
    'BwdHeaderLen', 'SYNFlagCnt', 'RSTFlagCnt', 'ACKFlagCnt', 'DownUpRatio',
    'InitFwdWinByts'
]

# Aliases to handle common CSE-CIC-IDS2018 CSV naming differences
COLUMN_ALIASES = {
    'dst port': 'DstPort',
    'destination port': 'DstPort',
    'dport': 'DstPort',
    'flow duration': 'FlowDuration',
    'tot fwd pkts': 'TotFwdPkts',
    'total fwd packets': 'TotFwdPkts',
    'tot bwd pkts': 'TotBwdPkts',
    'total backward packets': 'TotBwdPkts',
    'totlen fwd pkts': 'TotLenFwdPkts',
    'totlen bwd pkts': 'TotLenBwdPkts',
    'fwd pkt len max': 'FwdPktLenMax',
    'fwd pkt len min': 'FwdPktLenMin',
    'fwd pkt len mean': 'FwdPktLenMean',
    'bwd pkt len max': 'BwdPktLenMax',
    'bwd pkt len min': 'BwdPktLenMin',
    'bwd pkt len mean': 'BwdPktLenMean',
    'flow byts/s': 'FlowBytsPerSec',
    'flow bytes/s': 'FlowBytsPerSec',
    'flow pkts/s': 'FlowPktsPerSec',
    'flow packets/s': 'FlowPktsPerSec',
    'flow iat mean': 'FlowIATMean',
    'flow iat std': 'FlowIATStd',
    'fwd iat tot': 'FwdIATTot',
    'bwd iat tot': 'BwdIATTot',
    'fwd header len': 'FwdHeaderLen',
    'bwd header len': 'BwdHeaderLen',
    'syn flag cnt': 'SYNFlagCnt',
    'rst flag cnt': 'RSTFlagCnt',
    'ack flag cnt': 'ACKFlagCnt',
    'down/up ratio': 'DownUpRatio',
    'init fwd win byts': 'InitFwdWinByts',
}

def clean_and_normalize_row(data_dict: dict) -> dict:
    """
    Sanitize and extract the 26 canonical features from a raw input dictionary.
    Guarantees that target labels (Label/Class) are excluded (zero data leakage).
    """
    # 1. Normalize dictionary keys
    normalized = {}
    for k, v in data_dict.items():
        clean_key = k.strip().lower()
        if clean_key in ('label', 'class', 'target', 'attack'):
            # STRICT DATA LEAKAGE PREVENTION: Drop target labels!
            continue
            
        canonical_key = COLUMN_ALIASES.get(clean_key, None)
        if not canonical_key:
            # Check direct match against CANONICAL_FEATURES (case-insensitive)
            for feat in CANONICAL_FEATURES:
                if feat.lower() == clean_key:
                    canonical_key = feat
                    break
                    
        target_name = canonical_key if canonical_key else k
        normalized[target_name] = v

    # 2. Extract 26 features with default 0 if missing, cast to float, scrub inf/nan
    cleaned_row = {}
    for feat in CANONICAL_FEATURES:
        raw_val = normalized.get(feat, 0.0)
        try:
            val = float(raw_val)
            if np.isnan(val) or np.isinf(val):
                val = 0.0
        except (ValueError, TypeError):
            val = 0.0
        cleaned_row[feat] = val

    return cleaned_row

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Sanitize a pandas DataFrame uploaded via CSV.
    Strips label columns and ensures all 26 canonical features exist with clean numeric values.
    """
    # Drop any label column
    cols_to_drop = [c for c in df.columns if c.strip().lower() in ('label', 'class', 'target')]
    if cols_to_drop:
        df = df.drop(columns=cols_to_drop)

    # Rename alias columns
    rename_map = {}
    for c in df.columns:
        clean_name = c.strip().lower()
        if clean_name in COLUMN_ALIASES:
            rename_map[c] = COLUMN_ALIASES[clean_name]
    df = df.rename(columns=rename_map)

    # Ensure all canonical columns exist
    for feat in CANONICAL_FEATURES:
        if feat not in df.columns:
            df[feat] = 0.0
        else:
            df[feat] = pd.to_numeric(df[feat], errors='coerce').fillna(0.0)

    # Replace infinite values with max bounds
    df = df.replace([np.inf, -np.inf], 0.0)

    return df[CANONICAL_FEATURES]

