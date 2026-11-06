"""
Big Data Cleaning & Preprocessing Module.
Handles CSV dataset loading, schema standardization, missing/infinite value handling,
attack label categorization, and PySpark MLlib VectorAssembler feature pipeline.
"""

import os
import sys
from pathlib import Path
from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType, StringType
from pyspark.ml.feature import VectorAssembler, StringIndexer

# 26 Canonical features matching the project specification
CANONICAL_FEATURES = [
    'DstPort', 'Protocol', 'FlowDuration', 'TotFwdPkts', 'TotBwdPkts',
    'TotLenFwdPkts', 'TotLenBwdPkts', 'FwdPktLenMax', 'FwdPktLenMin', 'FwdPktLenMean',
    'BwdPktLenMax', 'BwdPktLenMin', 'BwdPktLenMean', 'FlowBytsPerSec', 'FlowPktsPerSec',
    'FlowIATMean', 'FlowIATStd', 'FwdIATTot', 'BwdIATTot', 'FwdHeaderLen',
    'BwdHeaderLen', 'SYNFlagCnt', 'RSTFlagCnt', 'ACKFlagCnt', 'DownUpRatio',
    'InitFwdWinByts'
]

# Mapping raw CSV header names in CSE-CIC-IDS2018 to canonical names
COLUMN_MAPPING = {
    'Dst Port': 'DstPort',
    'Destination Port': 'DstPort',
    'Protocol': 'Protocol',
    'Flow Duration': 'FlowDuration',
    'Tot Fwd Pkts': 'TotFwdPkts',
    'Total Fwd Packets': 'TotFwdPkts',
    'Tot Bwd Pkts': 'TotBwdPkts',
    'Total Backward Packets': 'TotBwdPkts',
    'TotLen Fwd Pkts': 'TotLenFwdPkts',
    'TotLen Bwd Pkts': 'TotLenBwdPkts',
    'Fwd Pkt Len Max': 'FwdPktLenMax',
    'Fwd Pkt Len Min': 'FwdPktLenMin',
    'Fwd Pkt Len Mean': 'FwdPktLenMean',
    'Bwd Pkt Len Max': 'BwdPktLenMax',
    'Bwd Pkt Len Min': 'BwdPktLenMin',
    'Bwd Pkt Len Mean': 'BwdPktLenMean',
    'Flow Byts/s': 'FlowBytsPerSec',
    'Flow Pkts/s': 'FlowPktsPerSec',
    'Flow IAT Mean': 'FlowIATMean',
    'Flow IAT Std': 'FlowIATStd',
    'Fwd IAT Tot': 'FwdIATTot',
    'Bwd IAT Tot': 'BwdIATTot',
    'Fwd Header Len': 'FwdHeaderLen',
    'Bwd Header Len': 'BwdHeaderLen',
    'SYN Flag Cnt': 'SYNFlagCnt',
    'RST Flag Cnt': 'RSTFlagCnt',
    'ACK Flag Cnt': 'ACKFlagCnt',
    'Down/Up Ratio': 'DownUpRatio',
    'Init Fwd Win Byts': 'InitFwdWinByts',
    'Label': 'raw_label'
}

def clean_and_standardize_df(df: DataFrame) -> DataFrame:
    """
    Standardize raw CSE-CIC-IDS2018 DataFrame columns, drop corrupt rows,
    sanitize infinite/NaN values, and map labels to primary attack families.
    """
    # 1. Rename columns according to mapping
    current_cols = df.columns
    for raw_name, canonical_name in COLUMN_MAPPING.items():
        if raw_name in current_cols:
            df = df.withColumnRenamed(raw_name, canonical_name)

    # 2. Drop corrupt duplicate headers where raw_label == 'Label'
    if 'raw_label' in df.columns:
        df = df.filter(F.col('raw_label') != 'Label')
    elif 'Label' in df.columns:
        df = df.withColumnRenamed('Label', 'raw_label').filter(F.col('raw_label') != 'Label')

    # 3. Categorize raw attack labels into 6 standard project categories
    if 'raw_label' in df.columns:
        df = df.withColumn(
            'target_label',
            F.when(F.col('raw_label').rlike('(?i)benign'), 'Benign (Normal)')
             .when(F.col('raw_label').rlike('(?i)ddos'), 'DDoS Attack')
             .when(F.col('raw_label').rlike('(?i)dos'), 'DoS Attack')
             .when(F.col('raw_label').rlike('(?i)bot'), 'Botnet Activity')
             .when(F.col('raw_label').rlike('(?i)brute'), 'Brute Force')
             .otherwise('Web Attack / Infiltration')
        )

    # 4. Cast each of the 26 canonical features to Double and sanitize nulls / infinites
    for col_name in CANONICAL_FEATURES:
        if col_name in df.columns:
            # Handle null, NaN, Infinity, -Infinity strings and values safely
            df = df.withColumn(
                col_name,
                F.expr(f"""
                    case 
                        when `{col_name}` is null or lower(trim(cast(`{col_name}` as string))) in ('nan', 'infinity', '-infinity', 'inf', '-inf') 
                        then 0.0 
                        else coalesce(try_cast(`{col_name}` as double), 0.0) 
                    end
                """)
            )
        else:
            # If missing in this specific capture file, default column to 0.0
            df = df.withColumn(col_name, F.lit(0.0))

    return df

def get_preprocessing_stages() -> list:
    """
    Returns pipeline stages list:
    - StringIndexer: Encodes target_label into numeric label index (0, 1, 2, ...).
    - VectorAssembler: Combines 26 features into a single Vector column.
    Guarantees ZERO DATA LEAKAGE: target_label is NEVER included in inputCols!
    """
    label_indexer = (
        StringIndexer(inputCol="target_label", outputCol="label")
        .setHandleInvalid("keep")
    )

    feature_assembler = (
        VectorAssembler(
            inputCols=CANONICAL_FEATURES,
            outputCol="features",
            handleInvalid="keep"
        )
    )

    return [label_indexer, feature_assembler]
