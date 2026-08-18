# ☀️ Solar IoT Monitoring System (Backend API)

## 📌 Overview
A robust backend REST API built with **Node.js** and **Express**, engineered to serve as the core communication hub for a distributed Solar IoT network. This system is responsible for ingesting, processing, and serving real-time telemetry data from solar hardware nodes, ensuring optimal service connectivity and reliable data flow.

Designed with operational stability in mind, the architecture facilitates deep visibility into node statuses, making it easier to track network configurations, monitor uptime, and conduct root cause analysis on backend errors or disconnected devices.

> **🖥️ Frontend Integration:** This API powers the interactive client dashboard. You can find the frontend repository here: [Dashboard Solar IoT Frontend](https://github.com/samirabarrera/Solar_IoTMonitoring_Fronend)

## ✨ Key Features
*   **IoT Telemetry Ingestion:** Secure endpoints designed to receive and process continuous data streams (such as energy output and battery levels) from solar hardware nodes.
*   **Robust System Logging:** Maintains detailed system logs and tracks node connectivity states, enabling rapid troubleshooting and root cause analysis for any network or hardware provisioning issues.
*   **RESTful Architecture:** Clean, well-documented routes that allow the frontend dashboard to fetch real-time metrics and historical data effortlessly.
*   **Cross-Origin Resource Sharing (CORS):** Configured to securely accept requests from the dedicated frontend client.

## 🛠️ Tech Stack
*   **Runtime Environment:** Node.js
*   **Web Framework:** Express.js
*   **Database:** PostgreSQL
*   **Hardware Communication:** HTTP

## 🚀 Getting Started

### Installation & Setup

1. Clone the repository:
   ```bash
   git clone [https://github.com/samirabarrera/Solar_IoTMonitoring_Backend.git](https://github.com/samirabarrera/Solar_IoTMonitoring_Backend.git)
