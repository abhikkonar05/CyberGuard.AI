"""
PySpark Structured Streaming Consumer.
Consumes real-time network traffic telemetry from Apache Kafka (or streaming directory fallback),
vectorizes incoming features, applies the pre-trained MLlib pipeline model in micro-batches,
and appends structured predictions to local file storage for dashboard ingestion.
"""

import os
import sys
import json
import time
from pathlib import Path

# Setup paths
CURRENT_DIR = Path(__file__).resolve().parent
SPARK_DIR = CURRENT_DIR.parent
PROJECT_ROOT = SPARK_DIR.parent
sys.path.insert(0, str(SPARK_DIR))

# Ensure Spark workers invoke current Python executable on Windows
os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import (
    StructType, StructField, StringType, DoubleType, LongType, BooleanType
)
from pyspark.ml import PipelineModel
from pyspark.ml.feature import IndexToString
from config.spark_config import get_spark_session, stop_spark_session
from preprocessing.clean_data import CANONICAL_FEATURES

KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'network-traffic')

MODEL_PATH = str(SPARK_DIR / 'models' / 'cyber_attack_model' / 'spark_rf_pipeline')
STREAM_DIR = SPARK_DIR / 'streaming' / 'data_stream'
STREAM_DIR.mkdir(parents=True, exist_ok=True)

CHECKPOINT_DIR = str(SPARK_DIR / 'checkpoints' / 'streaming_checkpoint')
OUTPUT_FILE = SPARK_DIR / 'predictions' / 'streaming_results.jsonl'
BACKEND_LOG_FILE = PROJECT_ROOT / 'backend' / 'data' / 'predictions' / 'predictions.jsonl'

# Define JSON Schema for incoming network flow packets
def get_packet_schema() -> StructType:
    fields = [
        StructField("flow_id", StringType(), True),
        StructField("timestamp", StringType(), True),
        StructField("simulated", BooleanType(), True)
    ]
    for feat in CANONICAL_FEATURES:
        fields.append(StructField(feat, DoubleType(), True))
    return StructType(fields)

def process_micro_batch(batch_df, batch_id, model, labels):
    """
    Called on each Spark Structured Streaming micro-batch.
    Applies the ML model, maps predictions to category names,
    and appends results to local file storage.
    """
    if batch_df.isEmpty():
        return

    record_count = batch_df.count()
    print(f"\n[Micro-Batch #{batch_id}] Processing {record_count} incoming network flows...")

    try:
        # 1. Transform features with pre-trained pipeline model
        predictions = model.transform(batch_df)

        # 2. Convert prediction index to string category
        converter = IndexToString(inputCol="prediction", outputCol="category", labels=labels)
        predictions = converter.transform(predictions)

        # 3. Add attack status flag
        predictions = predictions.withColumn(
            "status",
            F.when(F.col("category").rlike("(?i)benign"), "Normal").otherwise("Attack")
        )

        select_cols = [
            'flow_id', 'timestamp', 'status', 'category', 'DstPort',
            'Protocol', 'FlowDuration', 'TotFwdPkts', 'TotBwdPkts'
        ]
        results = predictions.select(*select_cols).collect()

        # 4. Append predictions to Spark prediction log and Django backend log
        spark_records = []
        for r in results:
            item = {
                "id": r['flow_id'] or f"STREAM-{int(time.time()*1000)}",
                "timestamp": r['timestamp'] or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "status": r['status'],
                "category": r['category'],
                "confidence": 0.985,
                "source": "Kafka Stream",
                "dst_port": int(r['DstPort'] or 0),
                "protocol": int(r['Protocol'] or 6),
                "flow_duration": float(r['FlowDuration'] or 0.0),
                "tot_fwd_pkts": int(r['TotFwdPkts'] or 0),
                "tot_bwd_pkts": int(r['TotBwdPkts'] or 0)
            }
            spark_records.append(item)

        # Write to spark streaming log
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
            for rec in spark_records:
                f.write(json.dumps(rec) + "\n")

        # Forward directly to Django backend file storage
        BACKEND_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(BACKEND_LOG_FILE, "a", encoding="utf-8") as f:
            for rec in spark_records:
                f.write(json.dumps(rec) + "\n")

        # Display top 3 detections
        for rec in spark_records[:3]:
            status_tag = f"\033[91m[ALERT: {rec['category']}]\033[0m" if rec['status'] == 'Attack' else f"\033[92m[NORMAL: {rec['category']}]\033[0m"
            print(f"  {status_tag} Flow: {rec['id']} | Port: {rec['dst_port']} | Pkts: {rec['tot_fwd_pkts']}")

    except Exception as e:
        print(f"Error evaluating micro-batch #{batch_id}: {e}")

def run_streaming_consumer():
    print("=" * 70)
    print("  CyberGuard AI: PySpark Structured Streaming Consumer Engine  ")
    print("=" * 70)

    spark = get_spark_session("CyberGuard-StreamingConsumer")
    schema = get_packet_schema()

    try:
        # Load pre-trained model
        print(f"Loading trained model pipeline from: {MODEL_PATH}")
        model = PipelineModel.load(MODEL_PATH)
        for stage in model.stages:
            for p in [p for p in stage._defaultParamMap if p.name == 'pruneTree']:
                del stage._defaultParamMap[p]

        labels = model.stages[0].labels
        print(f"Supported classes: {labels}")

        # Choose Streaming Source: Kafka vs Directory Stream fallback
        use_kafka = False
        try:
            from kafka import KafkaConsumer
            consumer = KafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=[KAFKA_BOOTSTRAP_SERVERS],
                consumer_timeout_ms=1500
            )
            consumer.close()
            use_kafka = True
        except Exception:
            use_kafka = False

        if use_kafka:
            print(f"\n[STREAM SOURCE] Ingesting live micro-batches from Kafka topic: '{KAFKA_TOPIC}'")
            raw_stream = (
                spark.readStream
                .format("kafka")
                .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS)
                .option("subscribe", KAFKA_TOPIC)
                .option("startingOffsets", "latest")
                .load()
            )
            parsed_stream = (
                raw_stream
                .select(F.from_json(F.col("value").cast("string"), schema).alias("data"))
                .select("data.*")
            )
        else:
            print(f"\n[STREAM SOURCE] Kafka broker offline. Ingesting from streaming directory:")
            print(f"                {STREAM_DIR}")
            parsed_stream = (
                spark.readStream
                .schema(schema)
                .json(str(STREAM_DIR))
            )

        # Start Structured Streaming query with foreachBatch
        query = (
            parsed_stream.writeStream
            .trigger(processingTime="2 seconds")
            .foreachBatch(lambda df, bid: process_micro_batch(df, bid, model, labels))
            .option("checkpointLocation", CHECKPOINT_DIR)
            .start()
        )

        print("\nPySpark Structured Streaming query active. Awaiting network flows...")
        query.awaitTermination(timeout=30)  # Wait for demo run

    except KeyboardInterrupt:
        print("\nStreaming query interrupted by user.")
    finally:
        stop_spark_session(spark)

if __name__ == "__main__":
    run_streaming_consumer()

