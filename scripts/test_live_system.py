"""
End-to-End Live Verification Script for CyberGuard AI.
Tests every API endpoint, sends custom attack and normal payloads,
uploads sample CSVs, tests file-based persistence, and validates responses.
"""

import os
import sys
import json
from pathlib import Path

# Setup Django environment
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / 'backend'
sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from rest_framework.test import APIClient

client = APIClient()

def print_section(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def test_health():
    print_section("TEST 1: Health Check Endpoint (/api/health/)")
    res = client.get('/api/health/')
    print(f"HTTP Status: {res.status_code}")
    print("Response Body:")
    print(json.dumps(res.json(), indent=2))
    assert res.status_code == 200
    assert res.json().get('status') == 'healthy'
    assert res.json().get('model_status') == 'loaded'
    print("[PASS] Health check verified.")

def test_dashboard():
    print_section("TEST 2: Dashboard Overview Telemetry (/api/dashboard/)")
    res = client.get('/api/dashboard/')
    print(f"HTTP Status: {res.status_code}")
    data = res.json()
    print(f"Total Traffic Analyzed: {data.get('total_traffic'):,}")
    print(f"Normal Flows:           {data.get('normal_traffic'):,}")
    print(f"Attack Flows:           {data.get('attack_traffic'):,}")
    print(f"Attack Threat Rate:     {data.get('attack_percentage')}%")
    print(f"Model Accuracy:         {data.get('model_accuracy')}%")
    print("\nAttack Category Distribution (Sample):")
    for item in data.get('attack_distribution', [])[:4]:
        print(f"  - {item['name']}: {item['count']:,}")
    assert res.status_code == 200
    print("[PASS] Dashboard aggregates verified.")

def test_manual_predictions():
    print_section("TEST 3: Manual Network Flow Inferences (/api/predict/manual/)")

    test_cases = [
        {
            "name": "Normal HTTPS Flow (Benign)",
            "payload": {
                "DstPort": 443,
                "Protocol": 6,
                "FlowDuration": 120540,
                "TotFwdPkts": 12,
                "TotBwdPkts": 14,
                "TotLenFwdPkts": 820,
                "TotLenBwdPkts": 14200,
                "FlowBytsPerSec": 124500.5,
                "FlowPktsPerSec": 215.7
            },
            "expected_status": "Normal"
        },
        {
            "name": "DDoS LOIC HTTP Flood Attack",
            "payload": {
                "DstPort": 80,
                "Protocol": 6,
                "FlowDuration": 2840,
                "TotFwdPkts": 85,
                "TotBwdPkts": 0,
                "TotLenFwdPkts": 24500,
                "TotLenBwdPkts": 0,
                "FlowBytsPerSec": 8626760.5,
                "FlowPktsPerSec": 29929.5
            },
            "expected_status": "Attack"
        },
        {
            "name": "SSH Brute Force Credential Spray",
            "payload": {
                "DstPort": 22,
                "Protocol": 6,
                "FlowDuration": 945200,
                "TotFwdPkts": 38,
                "TotBwdPkts": 42,
                "TotLenFwdPkts": 2680,
                "TotLenBwdPkts": 4890,
                "RSTFlagCnt": 1,
                "ACKFlagCnt": 78
            },
            "expected_status": "Attack"
        },
        {
            "name": "Botnet Ares C2 Heartbeat",
            "payload": {
                "DstPort": 8080,
                "Protocol": 6,
                "FlowDuration": 62000000,
                "TotFwdPkts": 6,
                "TotBwdPkts": 5,
                "TotLenFwdPkts": 450,
                "TotLenBwdPkts": 280
            },
            "expected_status": "Attack"
        }
    ]

    for tc in test_cases:
        print(f"\n--- Testing Scenario: {tc['name']} ---")
        res = client.post('/api/predict/manual/', tc['payload'], format='json')
        print(f"HTTP Status: {res.status_code}")
        data = res.json()
        print(f"  Classification: {data.get('status')} | Category: {data.get('category')}")
        print(f"  Confidence:     {(data.get('confidence') * 100):.2f}%")
        print(f"  Flow ID:        {data.get('id')}")
        assert res.status_code == 200
        assert data.get('status') == tc['expected_status']
        print(f"  [PASS] {tc['name']} classified as expected.")

def test_csv_upload():
    print_section("TEST 4: CSV Batch File Upload & Prediction (/api/predict/csv/)")
    sample_csv_path = PROJECT_ROOT / 'spark' / 'data' / 'sample' / 'traffic_sample.csv'
    
    with open(sample_csv_path, 'rb') as f:
        res = client.post('/api/predict/csv/', {'file': f}, format='multipart')

    print(f"HTTP Status: {res.status_code}")
    data = res.json()
    print(f"File Processed:     {data.get('processed_file')}")
    print(f"Total Rows Scored:  {data.get('total_rows')}")
    print(f"Normal Flows:       {data.get('normal_detected')}")
    print(f"Attacks Detected:   {data.get('attacks_detected')}")
    print(f"Attack Percentage:  {data.get('attack_percentage')}%")
    print("\nPreview Top 3 Records:")
    for r in data.get('sample_records', [])[:3]:
        print(f"  Row {r['row']}: Port {r['dst_port']} &bull; Status: {r['status']} ({r['category']}) &bull; Conf: {(r['confidence']*100):.1f}%")

    assert res.status_code == 200
    assert data.get('total_rows') > 0
    print("[PASS] Batch CSV prediction verified.")

def test_history_and_file_persistence():
    print_section("TEST 5: Zero-Database File-Based Persistence (/api/predictions/)")
    res = client.get('/api/predictions/?limit=5')
    print(f"HTTP Status: {res.status_code}")
    data = res.json()
    print(f"Total Logged Inferences in File: {data.get('total')}")
    print("Most Recent 3 Logged Predictions on Disk:")
    for p in data.get('predictions', [])[:3]:
        print(f"  [{p.get('timestamp')}] {p.get('id')}: {p.get('status')} - {p.get('category')} (Source: {p.get('source')})")

    assert res.status_code == 200
    assert len(data.get('predictions', [])) > 0
    print("[PASS] File storage persistence verified.")

def test_model_metadata():
    print_section("TEST 6: Model Metadata & Metrics (/api/model/info/ & /api/model/metrics/)")
    info_res = client.get('/api/model/info/')
    metrics_res = client.get('/api/model/metrics/')
    
    assert info_res.status_code == 200
    assert metrics_res.status_code == 200

    info = info_res.json()
    metrics = metrics_res.json()
    print(f"Model Name:        {info.get('model_name')}")
    print(f"Algorithm:         {info.get('algorithm')}")
    print(f"Features Analyzed: {info.get('features_count')} canonical features")
    print(f"Accuracy Metric:   {(metrics.get('accuracy') * 100):.2f}%")
    print(f"F1-Score:          {(metrics.get('f1_score') * 100):.2f}%")
    print("[PASS] Model metadata verified.")

if __name__ == '__main__':
    print("STARTING LIVE END-TO-END SYSTEM TEST...")
    test_health()
    test_dashboard()
    test_manual_predictions()
    test_csv_upload()
    test_history_and_file_persistence()
    test_model_metadata()
    print("\n" + "=" * 70)
    print("  ALL 6 TEST PHASES PASSED WITH ZERO ERRORS! SYSTEM IS FULLY OPERATIONAL.")
    print("=" * 70)

