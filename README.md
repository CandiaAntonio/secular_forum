# The Secular Forum Dashboard

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.0%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0%2B-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## Executive Summary

The Secular Forum Dashboard is a sophisticated analytical engine designed to extract "Signal from Noise" from a proprietary dataset of Bloomberg Investment Outlooks spanning 2019-2026. By leveraging advanced data processing and a responsive user interface, the platform empowers financial professionals to identify long-term secular trends amidst short-term market volatility.

## Architecture

This project adopts a **Decoupled Monorepo** architecture to ensure separation of concerns and independent scalability.

*   **Backend (`backend/`):** Built with **FastAPI**, serving as the high-performance API layer. It utilizes **Pandas** for robust ETL (Extract, Transform, Load) operations on financial datasets and **OpenPyXL** for direct interaction with Excel-based data sources.
*   **Frontend (`frontend/`):** A modern SPA (Single Page Application) built with **React** and **Vite**. The UI is styled using **Tailwind CSS** for a professional, utility-first design system, and enhanced with **Framer Motion** for fluid, intuitive user interactions.

## Prerequisites

Ensure your development environment meets the following requirements:

*   **Python:** 3.10 or higher
*   **Node.js:** 18 or higher

## Installation & Quick Start

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate

    # macOS/Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Start the development server:
    ```bash
    python -m uvicorn main:app --reload
    ```
    The backend API will be running at `http://localhost:8000`.

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend application will be accessible via the local URL provided in the terminal (typically `http://localhost:5173`).

## Project Structure

```text
secular_forum/
│
├── backend/            # Python/FastAPI application
│   ├── app/            # Application source code
│   ├── main.py         # Entry point
│   └── requirements.txt
│
├── frontend/           # React/Vite application
│   ├── src/            # Frontend source code
│   ├── public/         # Static assets
│   └── package.json
│
├── data/               # Proprietary datasets (Excel/CSV)
│
└── README.md           # Project documentation
```

## API Documentation

Once the backend server is running, you can access the interactive Swagger UI documentation at:

**[http://localhost:8000/docs](http://localhost:8000/docs)**
