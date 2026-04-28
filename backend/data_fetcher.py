import feedparser
import yfinance as yf
import requests
import time
from datetime import datetime
from ai_utils import analyze_sentiment, summarize_text, classify_category, generate_country_summary

# In a real app, you would fetch per country. Here we use some sample RSS feeds and mock data for simplicity.
COUNTRY_FEEDS = {
    "US": "http://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
    "GB": "http://feeds.bbci.co.uk/news/uk/rss.xml",
    "IN": "http://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
    "CN": "http://feeds.bbci.co.uk/news/world/asia/china/rss.xml",
    "RU": "http://feeds.bbci.co.uk/news/world/europe/rss.xml", # Approx
    "BR": "http://feeds.bbci.co.uk/news/world/latin_america/rss.xml",
    "FR": "http://feeds.bbci.co.uk/news/world/europe/rss.xml",
    "DE": "http://feeds.bbci.co.uk/news/world/europe/rss.xml",
}

GLOBAL_FEED = "http://feeds.bbci.co.uk/news/world/rss.xml"

CURRENCY_MAP = {
    "US": {"code": "USD", "name": "US Dollar"},
    "GB": {"code": "GBP", "name": "British Pound"},
    "IN": {"code": "INR", "name": "Indian Rupee"},
    "CN": {"code": "CNY", "name": "Chinese Yuan"},
    "RU": {"code": "RUB", "name": "Russian Ruble"},
    "BR": {"code": "BRL", "name": "Brazilian Real"},
    "FR": {"code": "EUR", "name": "Euro"},
    "DE": {"code": "EUR", "name": "Euro"},
}

def get_currency_data(country_code: str):
    info = CURRENCY_MAP.get(country_code, {"code": "USD", "name": "US Dollar"})
    if info["code"] == "USD":
        return {"name": info["name"], "code": info["code"], "rate": 1.0}
    try:
        res = requests.get("https://open.er-api.com/v6/latest/USD")
        data = res.json()
        rate = data.get("rates", {}).get(info["code"], "N/A")
        return {"name": info["name"], "code": info["code"], "rate": rate}
    except Exception as e:
        print(f"Currency fetch error: {e}")
        return {"name": info["name"], "code": info["code"], "rate": "N/A"}

# Simple in-memory cache to prevent permanent storage and API exhaustion
_CACHE = {}
CACHE_TTL = 600  # 10 minutes in seconds

def fetch_reddit_news(country_code: str):
    """Safely fetch top 3 recent posts from Reddit /r/worldnews regarding the country"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Dashboard/1.0'}
        country_names = {"US": "USA", "IN": "India", "CN": "China", "RU": "Russia", "GB": "UK", "FR": "France", "DE": "Germany", "BR": "Brazil"}
        name = country_names.get(country_code, "Global")
        url = f"https://www.reddit.com/r/worldnews/search.json?q={name}&restrict_sr=1&sort=new&limit=3"
        res = requests.get(url, headers=headers, timeout=5)
        data = res.json()
        
        reddit_items = []
        for child in data.get('data', {}).get('children', []):
            post = child['data']
            reddit_items.append({
                "title": post.get('title', ''),
                "summary": "Reddit Discussion: " + post.get('title', ''),
                "link": post.get('url', '#'),
                "timestamp": "Recent",
                "is_reddit": True
            })
        return reddit_items
    except Exception as e:
        print(f"Reddit fetch error: {e}")
        return []

def fetch_country_data(country_code: str):
    """
    Fetches news from an RSS feed, applies sentiment analysis, and returns grouped intelligence data.
    Uses in-memory caching to ensure real-time responsiveness without database storage.
    """
    current_time = time.time()
    
    # Check Cache First
    if country_code in _CACHE:
        cached_entry = _CACHE[country_code]
        if current_time - cached_entry["time"] < CACHE_TTL:
            print(f"CACHE HIT for {country_code}")
            return cached_entry["data"]
            
    print(f"FETCHING LIVE DATA for {country_code}")
    
    feed_url = COUNTRY_FEEDS.get(country_code, GLOBAL_FEED)
    
    intelligence = {
        "Conflict": [],
        "Politics": [],
        "Government": [],
        "Economy": [],
        "Technology": [],
        "Cyber Security": [],
        "News": []
    }
    
    all_news_items = []
    overall_sentiment = "neutral"
    
    # Fetch from secondary cyber feed to ensure we have cyber news
    cyber_feed_url = "https://feeds.feedburner.com/TheHackersNews"
    
    if feed_url:
        feed = feedparser.parse(feed_url)
        cyber_feed = feedparser.parse(cyber_feed_url)
        
        # Combine standard news with some top cyber news
        combined_entries = feed.entries[:15] + cyber_feed.entries[:5]
        
        total_score = 0
        
        # Parse entries to get enough data for all categories
        for entry in combined_entries:
            title = entry.title
            summary_raw = entry.get('summary', '')
            timestamp = entry.get('published', 'Unknown Date')
            
            # Use AI utils to summarize and get sentiment
            ai_summary = summarize_text(summary_raw)
            sentiment_data = analyze_sentiment(title + " " + summary_raw)
            category = classify_category(title + " " + summary_raw)
            
            total_score += sentiment_data["score"]
            
            item = {
                "title": title,
                "summary": ai_summary if ai_summary else title,
                "sentiment": sentiment_data["category"],
                "category": category,
                "link": entry.link,
                "timestamp": timestamp
            }
            all_news_items.append(item)
            
            if category in intelligence:
                intelligence[category].append(item)
            else:
                intelligence["News"].append(item)
                
        # Integrate Reddit Data
        reddit_posts = fetch_reddit_news(country_code)
        for post in reddit_posts:
            # Analyze sentiment and category for Reddit posts too
            sentiment_data = analyze_sentiment(post["title"])
            category = classify_category(post["title"])
            
            item = {
                "title": "[Reddit] " + post["title"],
                "summary": post["summary"],
                "sentiment": sentiment_data["category"],
                "category": category,
                "link": post["link"],
                "timestamp": post["timestamp"]
            }
            all_news_items.append(item)
            if category in intelligence:
                intelligence[category].append(item)
            else:
                intelligence["News"].append(item)
            
            total_score += sentiment_data["score"]
            
        # Determine overall sentiment for the country
        if len(all_news_items) > 0:
            avg_score = total_score / len(all_news_items)
            if avg_score > 0.05:
                overall_sentiment = "positive"
            elif avg_score < -0.05:
                overall_sentiment = "negative"
            else:
                overall_sentiment = "neutral"
                
    else:
        # Failsafe empty data if feed_url is somehow entirely blank
        pass
        
    ai_summary = generate_country_summary(all_news_items)
    cyber_ai_summary = generate_country_summary(intelligence["Cyber Security"])
    
    # Cyber Threat Level Calculation
    cyber_count = len(intelligence["Cyber Security"])
    cyber_score = sum(analyze_sentiment(item["summary"])["score"] for item in intelligence["Cyber Security"])
    
    cyber_threat_level = "Low"
    if cyber_count >= 2 and cyber_score < 0:
        cyber_threat_level = "High"
    elif cyber_count >= 1 or cyber_score < 0:
        cyber_threat_level = "Medium"
        
    # Conflict Level Calculation
    conflict_count = len(intelligence["Conflict"])
    conflict_score = sum(analyze_sentiment(item["summary"])["score"] for item in intelligence["Conflict"])
    conflict_ai_summary = generate_country_summary(intelligence["Conflict"])
    
    conflict_level = "Low"
    if conflict_count >= 3 or conflict_score < -0.1:
        conflict_level = "High"
    elif conflict_count >= 1:
        conflict_level = "Medium"
        
    # Mock Alliances and Opponents
    alliances_map = {
        "US": {"allies": ["United Kingdom", "France", "Germany", "Japan"], "opponents": ["Russia", "North Korea"]},
        "GB": {"allies": ["United States", "France", "Germany"], "opponents": ["Russia"]},
        "IN": {"allies": ["United States", "Russia", "France", "Japan"], "opponents": ["Pakistan", "China (Border Tension)"]},
        "CN": {"allies": ["Russia", "Pakistan", "North Korea"], "opponents": ["United States (Economic)"]},
        "RU": {"allies": ["China", "Belarus"], "opponents": ["United States", "NATO"]},
    }
    geopolitics = alliances_map.get(country_code, {"allies": ["Regional Neighbors"], "opponents": ["None active"]})
        
    # Financial indicator
    finance = get_market_data() if country_code == "US" else get_market_data("^FTSE") if country_code == "GB" else get_market_data()
    
    # Currency
    currency = get_currency_data(country_code)
        
    result = {
        "country": country_code,
        "intelligence": intelligence,
        "ai_summary": ai_summary,
        "overall_sentiment": overall_sentiment,
        "finance": finance,
        "currency": currency,
        "cyber_threat_level": cyber_threat_level,
        "cyber_ai_summary": cyber_ai_summary,
        "conflict_level": conflict_level,
        "conflict_ai_summary": conflict_ai_summary,
        "allies": geopolitics["allies"],
        "opponents": geopolitics["opponents"]
    }
    
    # Store in temporary cache
    _CACHE[country_code] = {
        "time": current_time,
        "data": result
    }
    
    return result

def get_market_data(ticker="^GSPC"):
    """
    Fetches basic stock market data. ^GSPC is S&P 500.
    Returns the latest price and historical data for charting.
    """
    try:
        tkr = yf.Ticker(ticker)
        data = tkr.history(period="1mo")
        if not data.empty:
            history = []
            for date, row in data.iterrows():
                history.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "price": round(row['Close'], 2)
                })
            close_price = data['Close'].iloc[-1]
            return {"ticker": ticker, "price": round(close_price, 2), "history": history}
    except Exception as e:
        print(f"Error fetching stock data: {e}")
    return {"ticker": ticker, "price": "N/A", "history": []}
