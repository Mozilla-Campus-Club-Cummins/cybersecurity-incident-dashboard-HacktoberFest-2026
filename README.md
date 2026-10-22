# AI-Powered Cybersecurity Incident Dashboard

An AI-powered web application for monitoring, analyzing, and managing cybersecurity incidents. The project combines a React frontend, FastAPI backend, SQLite database, and machine learning-based anomaly detection to help users manage incidents and identify potentially suspicious activity.

## Overview

The Cybersecurity Incident Dashboard provides a centralized interface for monitoring security incidents, assessing risk, and tracking incident status.

Users can register, log in, create incidents, view incident details, update incident statuses, and analyze security trends through visualizations.

## Features

- **Incident Management:** Create, view, and delete cybersecurity incidents.
- **Risk Assessment:** Calculate risk scores based on incident severity and detected anomalies.
- **Anomaly Detection:** Use a machine learning model to identify potentially unusual security activity.
- **Authentication:** Register and log in securely using password hashing and JWT-based authentication.
- **Incident Tracking:** View incident details, severity levels, risk scores, and statuses.
- **Status Management:** Update incident statuses to Open or Closed.
- **Analytics:** Explore security trends using charts and visualizations.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| UI and Charts | CSS, Recharts, Lucide React |
| Backend | Python, FastAPI |
| Database | SQLite, SQLAlchemy |
| Machine Learning | Scikit-learn, Isolation Forest |
| Authentication | JWT, Password Hashing |
| Testing | Pytest, HTTPX |

## Project Structure

```text
cybersecurity-incident-dashboard-HacktoberFest-2026/
├── .github/
├── backend/
│   ├── app/
│   │   ├── ml/
│   │   │   ├── detector.py
│   │   │   └── train.py
│   │   ├── auth.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── data/
│   │   ├── incidents.csv
│   │   └── security_events.csv
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## System Architecturegit diff --check

The React frontend communicates with the FastAPI backend through HTTP requests. The backend handles authentication, incident management, database operations, anomaly detection, and risk scoring.

```text
             React Frontend
                   |
                   | HTTP Requests
                   v
             FastAPI Backend
                   |
          +--------+---------+
          |        |         |
          v        v         v
     Authentication SQLite  ML Anomaly
        (JWT)      Database  Detection
                               |
                               v
                         Risk Score
                           (0-100)
```

## Prerequisites

Before running the application, install the following:

- Python 3.10 or later
- Node.js and npm
- Git

## Installation and Setup

### 1. Clone the Repository

Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>
cd cybersecurity-incident-dashboard-HacktoberFest-2026
```

Replace `<repository-url>` with the Git URL of the repository.

### 2. Set Up the Backend

Open a terminal in the project root and navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows using PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

On macOS or Linux, use:

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

### 3. Train the Machine Learning Model

Run the following command from inside the `backend` directory:

```bash
python -m app.ml.train
```

This command trains an Isolation Forest model using the dataset in `data/security_events.csv` and saves the trained model for anomaly detection.

**Important:** The backend requires the trained model file before it can start. Run the training command whenever the required model file is missing.

### 4. Start the Backend Server

Remain in the `backend` directory and run:

```bash
uvicorn app.main:app --reload
```

The backend API will be available at:

- **API Base URL:** http://127.0.0.1:8000
- **Interactive API Documentation:** http://127.0.0.1:8000/docs

Keep this terminal running.

### 5. Set Up the Frontend

Open a second terminal in the project root. Navigate to the frontend directory:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal. The default Vite development URL is usually:

http://localhost:5173

Keep this terminal running while using the application.

## API Endpoints

The backend provides the following main endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check whether the API is running |
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user and obtain an access token |
| GET | `/me` | Retrieve the authenticated user's information |
| POST | `/incidents` | Create a new incident |
| GET | `/incidents` | Retrieve incidents |
| GET | `/incidents/{incident_id}` | Retrieve a specific incident |
| PATCH | `/incidents/{incident_id}/status` | Update an incident's status |
| DELETE | `/incidents/{incident_id}` | Delete an incident |

Most incident endpoints require authentication. After logging in, the client can use the returned access token to authorize protected requests.

## Machine Learning and Risk Scoring

The application uses the Isolation Forest algorithm from Scikit-learn to identify potentially anomalous security activity.

The model evaluates the following features:

- Failed login attempts
- Request count
- Connection count
- Bytes transferred

### Risk Score Calculation

The base risk score depends on the incident severity:

| Severity | Base Risk Score |
|---|---:|
| Low | 20 |
| Medium | 50 |
| High | 80 |
| Critical | 95 |

When an anomaly is detected, 10 points are added to the base risk score. The final score is capped at 100.

## Running Tests

To run the backend tests, activate the Python virtual environment and navigate to the `backend` directory.

Run:

```bash
python -m pytest
```

The tests are located in the `backend/tests/` directory.

## Troubleshooting

- **Machine learning model not found:** Run `python -m app.ml.train` from the `backend` directory.
- **Frontend cannot connect to the backend:** Confirm that the backend is running at `http://127.0.0.1:8000`.
- **Frontend dependencies are missing:** Run `npm install` inside the `frontend` directory.
- **Backend dependencies fail to install:** Check the error message and verify the package names in `backend/requirements.txt`.
- **Port already in use:** Stop the process using the required port or configure an available port.
- **PowerShell virtual environment activation fails:** Check your PowerShell execution policy or use an appropriate activation method for your environment.

## Continuous Integration

The repository contains a `.github` directory for GitHub-related configuration. Check the workflow files in that directory for the configured automated checks.

## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and test them where possible.
4. Commit and push your changes.
5. Open a pull request describing your contribution.

## License

Refer to the repository for license information.
