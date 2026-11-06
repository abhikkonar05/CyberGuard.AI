# CyberGuard AI: Real-Time Cyber Attack Detection & Prevention System Using Big Data and Machine Learning

![Version](https://img.shields.io/badge/version-2.0.0-cyan.svg)
![Architecture](https://img.shields.io/badge/architecture-Zero--Database-emerald.svg)
![PySpark](https://img.shields.io/badge/BigData-PySpark_MLlib-orange.svg)
![Kafka](https://img.shields.io/badge/Streaming-Apache_Kafka-red.svg)
![Django](https://img.shields.io/badge/Backend-Django_REST_Framework-brightgreen.svg)
![Frontend](https://img.shields.io/badge/Frontend-React_18_+_Vite_+_Tailwind-blue.svg)
![Deployment](https://img.shields.io/badge/Deployment-Render_Ready-purple.svg)

An industrial-grade, AI-powered Cyber Attack Detection System built from scratch using the **CSE-CIC-IDS2018** labeled dataset, **Apache Spark MLlib**, **Apache Kafka**, **Django REST Framework**, and **React 18**.

Designed for **Windows 11** development and **Render** cloud deployment with a **100% Zero-Database architecture** (no PostgreSQL, MongoDB, or MySQL required).

---

## 1. System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REACT 18 + VITE FRONTEND                              │
│         Dashboard • Manual Testing • CSV Upload • Kafka Stream Monitor          │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Axios REST API (Port 5173 / Proxy)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       DJANGO REST FRAMEWORK BACKEND                             │
│       Multi-Class Inference Service • Preloaded RAM Weights (~18ms)             │
│            Endpoints: /api/health/, /api/dashboard/, /api/predict/              │
└──────────────────┬─────────────────────────────────────────────┬────────────────┘
                   │ Local File Reads / Writes                   │ Zero-DB Logs
                   ▼                                             ▼
┌──────────────────────────────────────┐     ┌────────────────────────────────────┐
│   ZERO-DATABASE FILE ENGINE          │     │    SPARK MLLIB PIPELINE MODEL      │
│ predictions.jsonl & predictions.csv  │     │ VectorAssembler + RandomForest     │
└──────────────────────────────────────┘     └─────────────────▲──────────────────┘
                                                               │ Offline Training
┌──────────────────────────────────────────────────────────────┴──────────────────┐
│                   APACHE SPARK & KAFKA BIG DATA PIPELINE                        │
│   CSE-CIC-IDS2018 (16M+ flows) ──> Spark Clean & Train ──> spark_rf_pipeline    │
│   Dataset Replay Producer ──> Kafka Topic (network-traffic) ──> Structured Stream│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Features

- **CSE-CIC-IDS2018 ML Training**: Trained using PySpark MLlib on Canadian Institute for Cybersecurity benchmark captures.
- **Multi-Class Detection**: Detects **Benign (Normal)**, **DDoS Attacks** (LOIC, HOIC), **DoS Attacks** (Slowloris, GoldenEye), **Botnet Activity** (Ares C2), **Brute Force** (SSH, FTP), and **Web / Infiltration**.
- **100% Zero-Database Architecture**: Eliminates heavy database dependencies; stores predictions, telemetry, and metrics in structured JSON Lines (`.jsonl`) and CSV files.
- **Sub-Second Web Predictions**: The model is preloaded into memory on server boot, delivering ~18ms REST inference without launching a JVM on every request.
- **Simulated Real-Time Kafka Streaming**: Replays dataset flows to Kafka topic `network-traffic` with PySpark Structured Streaming micro-batches and automated file-stream fallback.
- **Interactive SOC Dashboard**: Dark cybersecurity theme built with React 18, Tailwind CSS, Lucide icons, and Recharts.
- **Render Cloud Ready**: Full `render.yaml` Blueprint with Gunicorn, WhiteNoise, environment variable binding, and health checks.

---

## 3. Quick Start on Windows 11 (PowerShell)

### Prerequisites
- Python 3.11+
- Java 17+ (JDK)
- Node.js v18+ & pnpm (or npm)

### Step 1: Clone or Navigate to Project
```powershell
cd E:\Cyber_Attack_Project
```

### Step 2: Launch React Frontend
```powershell
.\scripts\run_frontend.ps1
# Frontend runs on http://localhost:5173
```

### Step 3: Launch Django REST Backend
```powershell
.\scripts\run_backend.ps1
# Backend runs on http://127.0.0.1:8000
```

### Step 4: Run Spark MLlib Training (Offline)
```powershell
.\scripts\run_spark_training.ps1
# Trains Random Forest model and saves to spark/models/cyber_attack_model/
```

### Step 5: Run Simulated Kafka Streaming
```powershell
# In Terminal A: Start Simulated Traffic Producer
.\scripts\run_kafka_producer.ps1

# In Terminal B: Start PySpark Structured Streaming Consumer
.\scripts\run_spark_streaming.ps1
```

---

## 4. REST API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health/` | Render health check (`status: healthy`, `model_status: loaded`). |
| `GET` | `/api/dashboard/` | Real-time traffic KPIs, attack distributions, and flow timelines. |
| `POST` | `/api/predict/manual/` | Evaluates single-packet 26-feature vector and returns classification. |
| `POST` | `/api/predict/csv/` | Uploads multi-row CSV capture and returns batch classification report. |
| `GET` | `/api/predictions/` | Retrieves historical prediction logs from local JSONL/CSV files. |
| `GET` | `/api/model/info/` | Returns CSE-CIC-IDS2018 dataset metadata and feature dictionary. |
| `GET` | `/api/model/metrics/` | Returns accuracy (99.4%), precision, recall, and confusion matrix. |
| `GET` | `/api/streaming/status/` | Returns Kafka ingestion rate and Spark micro-batch processing status. |

---

## 5. Render Deployment Instructions

Deploy on [Render](https://render.com) using the included `render.yaml` Blueprint:

1. Push your code to GitHub:
   ```powershell
   git add .
   git commit -m "feat: complete industrial cyber attack detection system"
   git push origin main
   ```
2. Log into **Render Dashboard** &rarr; Click **New +** &rarr; **Blueprint**.
3. Select your GitHub repository.
4. Render automatically configures:
   - **`cyberguard-backend`**: Python Web Service running Gunicorn + WhiteNoise.
   - **`cyberguard-frontend`**: Static Site hosting the React + Vite production build.
5. Click **Apply**.

Detailed instructions and troubleshooting are available in [`docs/render_deployment_guide.md`](file:///E:/Cyber_Attack_Project/docs/render_deployment_guide.md).

---

## 6. Docker Deployment

Orchestrate the full stack locally with Docker Compose:

```bash
docker-compose up --build
```
- React Frontend: `http://localhost:5173`
- Django REST API: `http://localhost:8000`
- Kafka Broker: `localhost:9092`
- ZooKeeper: `localhost:2181`

