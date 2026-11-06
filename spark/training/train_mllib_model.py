"""
PySpark MLlib Machine Learning Training Module.
Trains a Multi-Class Cyber Attack Detection Model on CSE-CIC-IDS2018 using Random Forest.
Evaluates accuracy, precision, recall, and saves the trained model pipeline to disk.
"""

import os
import sys
import json
import time
from pathlib import Path

# Add project root and spark dir to PYTHONPATH
CURRENT_DIR = Path(__file__).resolve().parent
SPARK_DIR = CURRENT_DIR.parent
PROJECT_ROOT = SPARK_DIR.parent
sys.path.insert(0, str(SPARK_DIR))

# Ensure Spark workers invoke current Python executable on Windows
os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

from pyspark.ml.classification import RandomForestClassifier, LogisticRegression
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
from pyspark.ml import PipelineModel, Pipeline
from config.spark_config import get_spark_session, stop_spark_session
from preprocessing.clean_data import (
    clean_and_standardize_df,
    get_preprocessing_stages,
    CANONICAL_FEATURES
)

MODELS_DIR = SPARK_DIR / 'models' / 'cyber_attack_model'
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def train_model(sample_per_file: int = 8000):
    """
    Execute end-to-end PySpark MLlib training workflow.
    Reads dataset files individually, extracts canonical features,
    and trains a robust multi-class Random Forest classifier.
    """
    print("=" * 70)
    print("  PySpark MLlib: Cyber Attack Detection Model Training Engine  ")
    print("=" * 70)
    
    spark = get_spark_session("CyberGuard-MLlib-Trainer")
    start_time = time.time()

    try:
        # 1. Dataset Loading
        dataset_path = PROJECT_ROOT / 'dataset'
        csv_files = list(dataset_path.glob("*.csv"))
        
        if not csv_files:
            raise FileNotFoundError(f"No CSV dataset files found in {dataset_path}")

        print(f"\n[1/6] Discovered {len(csv_files)} CSE-CIC-IDS2018 CSV capture files.")
        
        # Select representative files covering major attack families
        selected_files = [
            f for f in csv_files 
            if any(name in f.name for name in [
                'Thursday-01-03', 'Friday-02-03', 'Thuesday-20-02', 
                'Wednesday-14-02', 'Thursday-15-02'
            ])
        ]
        if not selected_files:
            selected_files = csv_files[:4]

        print(f"      Reading and standardizing partitions from:")
        combined_df = None

        for file_path in selected_files:
            file_name = file_path.name
            print(f"      &bull; Processing {file_name}...")
            # Read individual CSV
            file_df = spark.read.option("header", "true").csv(str(file_path))
            
            # Clean and standardize columns
            clean_file_df = clean_and_standardize_df(file_df)
            
            # Select only the 26 canonical features + target_label
            required_cols = CANONICAL_FEATURES + ['target_label']
            clean_file_df = clean_file_df.select(*required_cols)
            
            # Subsample per file to build balanced representation
            sampled_df = clean_file_df.limit(sample_per_file)

            if combined_df is None:
                combined_df = sampled_df
            else:
                combined_df = combined_df.unionByName(sampled_df, allowMissingColumns=True)

        total_sampled = combined_df.count()
        print(f"\n[2/6] Total balanced dataset partitions assembled: {total_sampled:,} records")

        print("\n      Class Distribution in Training Sample:")
        combined_df.groupBy("target_label").count().show(truncate=False)

        # 3. Feature Pipeline Construction
        print("[3/6] Building PySpark MLlib feature pipeline stages...")
        prep_stages = get_preprocessing_stages()

        # 4. Train/Test Split (80% Train, 20% Test)
        print("\n[4/6] Splitting dataset: 80% Training, 20% Testing...")
        train_df, test_df = combined_df.randomSplit([0.8, 0.2], seed=42)
        train_count = train_df.count()
        test_count = test_df.count()
        print(f"      Training set count: {train_count:,}")
        print(f"      Testing set count:  {test_count:,}")

        # 5. Model Training: Random Forest Classifier
        print("\n[5/6] Training Random Forest Classifier (numTrees=50, maxDepth=10)...")
        rf = RandomForestClassifier(
            featuresCol="features",
            labelCol="label",
            predictionCol="prediction",
            probabilityCol="probability",
            numTrees=50,
            maxDepth=10,
            seed=42
        )

        # Remove mismatched parameters if running on hybrid PySpark/JAR environments
        bad_params = [p for p in rf._defaultParamMap if p.name == 'pruneTree']
        for p in bad_params:
            del rf._defaultParamMap[p]

        all_stages = prep_stages + [rf]
        full_pipeline = Pipeline(stages=all_stages)
        
        model_fit_start = time.time()
        pipeline_model = full_pipeline.fit(train_df)
        print(f"      Model training completed in {time.time() - model_fit_start:.2f} seconds.")

        # Strip pruneTree from all fitted stages to maintain PySpark 4.3 / Spark 4.2 JAR parity
        for stage in pipeline_model.stages:
            for p in [p for p in stage._defaultParamMap if p.name == 'pruneTree']:
                del stage._defaultParamMap[p]

        # 6. Evaluation on Unseen Test Set
        print("\n[6/6] Evaluating model on testing set...")
        predictions = pipeline_model.transform(test_df)

        evaluator_acc = MulticlassClassificationEvaluator(labelCol="label", predictionCol="prediction", metricName="accuracy")
        evaluator_f1 = MulticlassClassificationEvaluator(labelCol="label", predictionCol="prediction", metricName="f1")
        evaluator_prec = MulticlassClassificationEvaluator(labelCol="label", predictionCol="prediction", metricName="weightedPrecision")
        evaluator_rec = MulticlassClassificationEvaluator(labelCol="label", predictionCol="prediction", metricName="weightedRecall")

        accuracy = evaluator_acc.evaluate(predictions)
        f1 = evaluator_f1.evaluate(predictions)
        precision = evaluator_prec.evaluate(predictions)
        recall = evaluator_rec.evaluate(predictions)

        print("-" * 50)
        print(f"  Accuracy:           {accuracy * 100:.2f}%")
        print(f"  Weighted Precision: {precision * 100:.2f}%")
        print(f"  Weighted Recall:    {recall * 100:.2f}%")
        print(f"  F1-Score:           {f1 * 100:.2f}%")
        print("-" * 50)

        # 7. Model Serialization and Metadata Export
        save_path = str(MODELS_DIR / "spark_rf_pipeline")
        print(f"\nSaving trained pipeline model to: {save_path}")
        pipeline_model.write().overwrite().save(save_path)

        # Extract label mapping
        string_indexer_model = pipeline_model.stages[0]
        labels = string_indexer_model.labels

        metadata = {
            "model_type": "PySpark MLlib RandomForestClassifier",
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "num_trees": 50,
            "max_depth": 10,
            "features_count": len(CANONICAL_FEATURES),
            "features": CANONICAL_FEATURES,
            "labels": labels,
            "training_duration_seconds": round(time.time() - start_time, 2),
            "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        meta_path = MODELS_DIR / "model_metadata.json"
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        print(f"Model metadata exported successfully to: {meta_path}")
        print("\nAll Spark MLlib training stages finished successfully!")

    finally:
        stop_spark_session(spark)

if __name__ == "__main__":
    train_model(sample_per_file=8000)
