"""
Apache Spark Configuration Builder.
Initializes and tunes SparkSession for Big Data processing and PySpark MLlib.
"""

import os
import sys
from pathlib import Path
from pyspark.sql import SparkSession

# Ensure Spark workers invoke the active Python executable on Windows
os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

BASE_DIR = Path(__file__).resolve().parent.parent
CHECKPOINTS_DIR = BASE_DIR / 'checkpoints'
CHECKPOINTS_DIR.mkdir(parents=True, exist_ok=True)

def get_spark_session(app_name: str = "CyberAttackDetectionEngine") -> SparkSession:
    """
    Builds an optimized local SparkSession with Kryo serialization
    and memory configurations suitable for Windows 11.
    """
    builder = (
        SparkSession.builder
        .appName(app_name)
        .master("local[*]")
        .config("spark.driver.memory", "4g")
        .config("spark.executor.memory", "4g")
        .config("spark.sql.shuffle.partitions", "8")
        .config("spark.default.parallelism", "8")
        .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        .config("spark.sql.streaming.checkpointLocation", str(CHECKPOINTS_DIR))
        .config("spark.ui.enabled", "false")  # Avoid port conflicts in tests
    )

    spark = builder.getOrCreate()
    spark.sparkContext.setLogLevel("WARN")
    return spark

def stop_spark_session(spark: SparkSession):
    """Safely terminate SparkSession."""
    if spark:
        spark.stop()

