from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

import database
import auth
from data_fetcher import fetch_country_data, get_market_data

app = FastAPI(title="Global Intelligence Dashboard API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def secure_headers_middleware(request: Request, call_next):
    """
    Adds enterprise-grade security headers to prevent cyber attacks.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Pydantic models for request/response
class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatMessage(BaseModel):
    message: str

# Endpoints
@app.post("/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(database.User).filter(database.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = database.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(database.User).filter(database.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/globe-data")
def get_globe_data():
    """
    Returns a sample list of countries with overall sentiment.
    In a real app, you would aggregate this or fetch it on a schedule.
    """
    # Sample data to color the globe and show notifications
    # Red -> negative, Green -> positive, Blue -> neutral
    countries = [
        {"iso": "US", "sentiment": "neutral", "lat": 39.0, "lng": -98.0, "notifications": 0},
        {"iso": "GB", "sentiment": "negative", "lat": 55.0, "lng": -3.0, "notifications": 1},
        {"iso": "IN", "sentiment": "positive", "lat": 20.0, "lng": 77.0, "notifications": 2},
        {"iso": "CN", "sentiment": "neutral", "lat": 35.0, "lng": 105.0, "notifications": 0},
        {"iso": "RU", "sentiment": "negative", "lat": 60.0, "lng": 100.0, "notifications": 3},
        {"iso": "BR", "sentiment": "positive", "lat": -14.0, "lng": -51.0, "notifications": 0},
        {"iso": "FR", "sentiment": "neutral", "lat": 46.0, "lng": 2.0, "notifications": 0},
        {"iso": "DE", "sentiment": "positive", "lat": 51.0, "lng": 9.0, "notifications": 4},
    ]
    return {"countries": countries}

@app.get("/api/country/{iso_code}")
def get_country_details(iso_code: str):
    """
    Fetch specific news for a country.
    """
    data = fetch_country_data(iso_code.upper())
    return data

@app.post("/api/chat")
def chat_with_bot(chat: ChatMessage):
    """
    A simple rule-based chatbot for demonstration.
    """
    msg = chat.message.lower()
    reply = "I'm a simple AI bot. Try asking about 'India', 'AI', or 'markets'."
    
    if "india" in msg:
        reply = "India is experiencing rapid growth in the tech sector, with major investments in AI and infrastructure."
    elif "ai" in msg or "artificial intelligence" in msg:
        reply = "AI continues to evolve rapidly. Recent news highlights advancements in generative models and new regulatory frameworks."
    elif "market" in msg or "stock" in msg:
        market_info = get_market_data()
        reply = f"The current market status for {market_info['ticker']} is at {market_info['price']}."
    
    return {"reply": reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
