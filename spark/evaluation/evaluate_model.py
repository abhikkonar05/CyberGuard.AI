"""
Spark Model Evaluation Module.
Loads the serialized Spark MLlib model, evaluates multiclass metrics,
generates a confusion matrix, and saves comprehensive evaluation benchmarks to JSON.
"""

import os
import sys
import json
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
SPARK_DIR = CURRENT_DIR.parent
PROJECT_ROOT = SPARK_DIR.parent
sys.path.insert(0, str(SPARK_DIR))

# Ensure Spark workers invoke current Python executable on Windows
os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

from pyspark.ml import PipelineModel
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
from pyspark.sql import functions as F
from config.spark_config import get_spark_session, stop_spark_session
from preprocessing.clean_data import clean_and_standardize_df

MODELS_DIR = SPARK_DIR / 'models' / 'cyber_attack_model'
MODEL_PATH = str(MODELS_DIR / 'spark_rf_pipeline')

def evaluate_saved_model(sample_size: int = 15000):
    spark = get_spark_session("CyberGuard-Evaluator")
    try:
        if not Path(MODEL_PATH).exists():
            raise FileNotFoundError(f"Model path does not exist: {MODEL_PATH}. Run train_mllib_model.py first.")

        print(f"Loading trained model pipeline from: {MODEL_PATH}")
        model = PipelineModel.load(MODEL_PATH)

        for stage in model.stages:
            for p in [p for p in stage._defaultParamMap if p.name == 'pruneTree']:
                del stage._defaultParamMap[p]

        # Load evaluation dataset
        dataset_files = list((PROJECT_ROOT / 'dataset').glob("*.csv"))
        test_file = str(dataset_files[0])
        print(f"Loading evaluation sample from: {Path(test_file).name}")
        
        raw_df = spark.read.option("header", "true").csv(test_file)
        cleaned_df = clean_and_standardize_df(raw_df).limit(sample_size)

        # Generate predictions
        predictions = model.transform(cleaned_df)

        evaluator = MulticlassClassificationEvaluator(labelCol="label", predictionCol="prediction")
        accuracy = evaluator.evaluate(predictions, {evaluator.metricName: "accuracy"})
        f1 = evaluator.evaluate(predictions, {evaluator.metricName: "f1"})
        precision = evaluator.evaluate(predictions, {evaluator.metricName: "weightedPrecision"})
        recall = evaluator.evaluate(predictions, {evaluator.metricName: "weightedRecall"})

        # Get labels
        string_indexer_model = model.stages[0]
        labels = string_indexer_model.labels

        from pyspark.ml.feature import IndexToString
        converter = IndexToString(inputCol="prediction", outputCol="predicted_label", labels=labels)
        predictions = converter.transform(predictions)

        print("\nConfusion Matrix (Actual vs Predicted):")
        confusion_df = predictions.crosstab("target_label", "predicted_label")
        confusion_df.show(truncate=False)

        metrics = {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "sample_size": sample_size,
            "classes": labels
        }

        output_path = MODELS_DIR / "evaluation_metrics.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

        print(f"Evaluation metrics written to: {output_path}")
        return metrics

    finally:
        stop_spark_session(spark)

if __name__ == "__main__":
    evaluate_saved_model()
