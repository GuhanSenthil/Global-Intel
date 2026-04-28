# AI Global Intelligence Dashboard

A full-stack, beginner-friendly web application for visualizing global events on a 3D globe with sentiment analysis.

## Features
- 🌍 3D interactive Globe using `react-globe.gl`
- 🧠 Lightweight sentiment analysis using `TextBlob`
- 🤖 Simple query Chatbot
- 🔐 Secure JWT Authentication with SQLite
- ⚡ Fast backend with `FastAPI`
- 🎨 Modern UI with `Tailwind CSS v4`

## Prerequisites
- Node.js (v18+)
- Python (v3.9+)

## How to Run Locally

### 1. Start the Backend
Open a terminal and run the following commands:
```bash
cd backend
pip install -r requirements.txt
python -m textblob.download_corpora  # Needed for sentiment analysis
python -m uvicorn main:app --reload
```
The backend will run on `http://localhost:8000`.

### 2. Start the Frontend
Open a **new** terminal and run:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`. Open it in your browser.

## Usage
1. You will be greeted by the Login page. Click "Need an account? Sign up".
2. Create a username and password. You will be automatically logged in.
3. Interact with the 3D Globe:
   - Green countries: Positive news
   - Red countries: Negative news
   - Blue countries: Neutral/No data
4. Click on a country to see recent news and summarized sentiment.
5. Click the Chat icon on the bottom right to ask questions.

## Notes
- To use live Reddit data, you can extend `data_fetcher.py` and input PRAW credentials.
- The project uses `sqlite3` which automatically creates a `news_dashboard.db` file in your `backend` folder.
