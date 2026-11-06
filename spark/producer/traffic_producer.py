"""
Apache Kafka Traffic Producer.
Simulates real-time network flow telemetry by replaying historical records
from the CSE-CIC-IDS2018 dataset to the Kafka topic 'network-traffic'.
Includes standalone fallback mode if a local Kafka broker is not active.
"""

import os
import sys
import json
import time
import uuid
from pathlib import Path
import pandas as pd

# Paths
CURRENT_DIR = Path(__file__).resolve().parent
SPARK_DIR = CURRENT_DIR.parent
PROJECT_ROOT = SPARK_DIR.parent
STREAM_DIR = SPARK_DIR / 'streaming' / 'data_stream'
STREAM_DIR.mkdir(parents=True, exist_ok=True)

KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'network-traffic')

# 26 Canonical features matching project specification
CANONICAL_FEATURES = [
    'DstPort', 'Protocol', 'FlowDuration', 'TotFwdPkts', 'TotBwdPkts',
    'TotLenFwdPkts', 'TotLenBwdPkts', 'FwdPktLenMax', 'FwdPktLenMin', 'FwdPktLenMean',
    'BwdPktLenMax', 'BwdPktLenMin', 'BwdPktLenMean', 'FlowBytsPerSec', 'FlowPktsPerSec',
    'FlowIATMean', 'FlowIATStd', 'FwdIATTot', 'BwdIATTot', 'FwdHeaderLen',
    'BwdHeaderLen', 'SYNFlagCnt', 'RSTFlagCnt', 'ACKFlagCnt', 'DownUpRatio',
    'InitFwdWinByts'
]

COLUMN_MAP = {
    'Dst Port': 'DstPort',
    'Destination Port': 'DstPort',
    'Protocol': 'Protocol',
    'Flow Duration': 'FlowDuration',
    'Tot Fwd Pkts': 'TotFwdPkts',
    'Tot Bwd Pkts': 'TotBwdPkts',
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
    'Init Fwd Win Byts': 'InitFwdWinByts'
}

def get_kafka_producer():
    """Attempt connection to local Kafka broker; return None if unavailable."""
    try:
        from kafka import KafkaProducer
        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_BOOTSTRAP_SERVERS],
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            request_timeout_ms=3000,
            max_block_ms=3000
        )
        print(f"[OK] Connected to Apache Kafka Broker at {KAFKA_BOOTSTRAP_SERVERS}")
        return producer
    except Exception as e:
        print(f"[STANDALONE] Kafka Broker not reachable at {KAFKA_BOOTSTRAP_SERVERS}. ({e})")
        print(f"[STANDALONE] Activating Zero-Broker File-Stream Simulation Mode.")
        return None

def run_producer(messages_per_second: int = 25, max_records: int = None):
    print("=" * 70)
    print("  CyberGuard AI: Real-Time Network Telemetry Replay Producer  ")
    print("=" * 70)
    print(f"Target Kafka Topic: {KAFKA_TOPIC}")
    print(f"Simulated Ingestion Rate: {messages_per_second} flows/second")
    print("Notice: Replaying historical CSE-CIC-IDS2018 records simulates live network traffic.")
    print("-" * 70)

    # 1. Locate dataset CSV files
    dataset_files = list((PROJECT_ROOT / 'dataset').glob("*.csv"))
    if not dataset_files:
        sample_file = SPARK_DIR / 'data' / 'sample' / 'traffic_sample.csv'
        dataset_files = [sample_file] if sample_file.exists() else []

    if not dataset_files:
        raise FileNotFoundError("No network traffic dataset files found to stream.")

    producer = get_kafka_producer()
    interval = 1.0 / max(1, messages_per_second)
    sent_count = 0
    t0 = time.time()

    try:
        while True:
            for csv_file in dataset_files:
                print(f"\nStreaming records from file: {csv_file.name}")
                # Read CSV in chunks for memory efficiency
                for chunk in pd.read_csv(csv_file, chunksize=1000, low_memory=False):
                    # Standardize columns
                    chunk = chunk.rename(columns=COLUMN_MAP)
                    
                    # Strictly strip target label to prevent data leakage
                    for lbl_col in ['Label', 'raw_label', 'target_label']:
                        if lbl_col in chunk.columns:
                            chunk = chunk.drop(columns=[lbl_col])

                    # Ensure all canonical features exist
                    for f in CANONICAL_FEATURES:
                        if f not in chunk.columns:
                            chunk[f] = 0.0
                        else:
                            chunk[f] = pd.to_numeric(chunk[f], errors='coerce').fillna(0.0)

                    # Iterate over rows and produce telemetry
                    for _, row in chunk.iterrows():
                        record = {
                            "flow_id": f"FLOW-{uuid.uuid4().hex[:8].upper()}",
                            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                            "simulated": True
                        }
                        for feat in CANONICAL_FEATURES:
                            val = float(row[feat])
                            record[feat] = 0.0 if (pd.isna(val) or val == float('inf') or val == float('-inf')) else val

                        # Send to Kafka or write to file-stream fallback
                        if producer:
                            producer.send(KAFKA_TOPIC, value=record)
                        else:
                            # Standalone fallback: write micro-batch record to streaming directory
                            batch_file = STREAM_DIR / f"packet_{uuid.uuid4().hex[:6]}.json"
                            with open(batch_file, "w", encoding="utf-8") as bf:
                                bf.write(json.dumps(record) + "\n")

                        sent_count += 1
                        if sent_count % 50 == 0:
                            elapsed = time.time() - t0
                            eps = sent_count / elapsed if elapsed > 0 else 0
                            print(f"\r >> Ingested: {sent_count:,} flows | Throughput: {eps:.1f} EPS | Topic: {KAFKA_TOPIC}", end="", flush=True)

                        if max_records and sent_count >= max_records:
                            print(f"\nReached max records limit: {max_records}")
                            return

                        time.sleep(interval)

    except KeyboardInterrupt:
        print("\nProducer stopped by user (Ctrl+C).")
    finally:
        if producer:
            producer.flush()
            producer.close()
        print(f"\nTotal simulated network telemetry records transmitted: {sent_count:,}")

if __name__ == "__main__":
    run_producer(messages_per_second=20, max_records=100)

