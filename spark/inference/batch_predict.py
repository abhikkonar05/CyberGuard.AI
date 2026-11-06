"""
Spark Batch Inference Module.
Loads the trained PySpark MLlib model pipeline and predicts cyber attack categories
on new large network traffic CSV datasets, outputting results to CSV/Parquet.
"""

import os
import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
SPARK_DIR = CURRENT_DIR.parent
PROJECT_ROOT = SPARK_DIR.parent
sys.path.insert(0, str(SPARK_DIR))

# Ensure Spark workers invoke current Python executable on Windows
os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

from pyspark.ml import PipelineModel
from pyspark.sql import functions as F
from config.spark_config import get_spark_session, stop_spark_session
from preprocessing.clean_data import clean_and_standardize_df, CANONICAL_FEATURES

PREDICTIONS_DIR = SPARK_DIR / 'predictions'
PREDICTIONS_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = str(SPARK_DIR / 'models' / 'cyber_attack_model' / 'spark_rf_pipeline')

def run_batch_prediction(input_csv_path: str, output_csv_path: str = None):
    spark = get_spark_session("CyberGuard-BatchPredictor")
    try:
        print(f"Loading input traffic from: {input_csv_path}")
        raw_df = spark.read.option("header", "true").option("inferSchema", "true").csv(input_csv_path)

        print(f"Standardizing schema (ensuring strict zero data leakage)...")
        cleaned_df = clean_and_standardize_df(raw_df)

        print(f"Loading Spark MLlib Pipeline Model from: {MODEL_PATH}")
        model = PipelineModel.load(MODEL_PATH)
        for stage in model.stages:
            for p in [p for p in stage._defaultParamMap if p.name == 'pruneTree']:
                del stage._defaultParamMap[p]

        # Predict
        predictions = model.transform(cleaned_df)

        # Retrieve string labels from pipeline stage
        labels = model.stages[0].labels

        from pyspark.ml.feature import IndexToString
        converter = IndexToString(inputCol="prediction", outputCol="predicted_attack_category", labels=labels)
        result_df = converter.transform(predictions)

        result_df = result_df.withColumn(
            "attack_status",
            F.when(F.col("predicted_attack_category").rlike("(?i)benign"), "Normal").otherwise("Attack")
        )

        select_cols = ['DstPort', 'Protocol', 'FlowDuration', 'TotFwdPkts', 'TotBwdPkts', 'attack_status', 'predicted_attack_category']
        preview_df = result_df.select(*select_cols)

        print("\nPrediction Results Preview (Top 10):")
        preview_df.show(10, truncate=False)

        if not output_csv_path:
            output_csv_path = str(PREDICTIONS_DIR / "batch_predictions.csv")

        # Save output to CSV
        print(f"Saving predictions to: {output_csv_path}")
        preview_df.toPandas().to_csv(output_csv_path, index=False)
        print("Batch inference completed successfully.")

    finally:
        stop_spark_session(spark)

if __name__ == "__main__":
    sample_file = SPARK_DIR / 'data' / 'sample' / 'traffic_sample.csv'
    if sample_file.exists():
        run_batch_prediction(str(sample_file))
    else:
        csv_files = list((PROJECT_ROOT / 'dataset').glob("*.csv"))
        if csv_files:
            run_batch_prediction(str(csv_files[0]))
