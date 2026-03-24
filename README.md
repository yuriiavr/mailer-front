# 🚀 Full-Stack Email Marketing Engine

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

**EmailSender** is a high-performance platform for automated email campaigns and mail infrastructure management. Engineered with a focus on scalability, message queuing, and granular control over SMTP server health.

---

## 🏗 Architectural Highlights

> **Note:** The core of the system leverages **Redis** for asynchronous message queuing. This ensures the main application remains non-blocking even when processing thousands of emails simultaneously.

### ✨ Key Features

#### 🖥 SMTP Infrastructure Dashboard
A centralized hub for managing mailing resources:
* **Dynamic SMTP Management:** Add and configure multiple custom SMTP accounts.
* **Smart Rate Limiting:** Define `Daily Limits` for each server to prevent blacklisting.
* **Real-time Status Monitoring:** Live tracking of server health: `FREE`, `BUSY`, `STOPPED`, and automatic `BAN` detection.

#### ⏱ Redis-Powered Scheduler
* **Asynchronous Processing:** Background email dispatching via Redis queues.
* **Scheduled Sending:** Set exact dates and times for campaigns using persistent jobs.
* **Fault Tolerance:** Guaranteed queue processing even after server restarts.

#### 📊 Advanced Analytics
* **Delivery Tracking:** Real-time status updates for every single email sent.
* **Open Rate Monitoring:** User engagement tracking via embedded **tracking pixels**.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, React Router, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Queue/Cache** | Redis (Bull.js / Better-queue) |
| **Database** | MongoDB / PostgreSQL |
| **Protocols** | SMTP, REST API |

---

## 📥 Getting Started

### 1. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install
```

### 2. Run the Application

```bash
# Run both server and client (if using concurrently)
npm start
```