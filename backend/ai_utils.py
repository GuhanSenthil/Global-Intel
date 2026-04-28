from textblob import TextBlob

def analyze_sentiment(text: str):
    """
    Returns sentiment score and category: positive, negative, or neutral.
    Uses TextBlob for lightweight, offline sentiment analysis.
    """
    if not text:
        return {"score": 0, "category": "neutral"}
    
    analysis = TextBlob(text)
    score = analysis.sentiment.polarity
    
    if score > 0.1:
        category = "positive"
    elif score < -0.1:
        category = "negative"
    else:
        category = "neutral"
        
    return {"score": score, "category": category}

def summarize_text(text: str, max_sentences=2):
    """
    Provides a simple summary by extracting the first few sentences.
    """
    if not text:
        return ""
    
    blob = TextBlob(text)
    sentences = blob.sentences
    
    summary = " ".join([str(s) for s in sentences[:max_sentences]])
    return summary

def classify_category(text: str) -> str:
    """
    Classify text into a simple category based on keywords.
    Categories: Technology, Politics, Government, Economy, News
    """
    text_lower = text.lower()
    
    tech_keywords = ['technology', 'ai', 'software', 'tech', 'app', 'internet', 'digital', 'innovation', 'startup']
    politics_keywords = ['election', 'politics', 'diplomat', 'international relations', 'treaty', 'foreign', 'ambassador']
    government_keywords = ['government', 'minister', 'president', 'policy', 'law', 'regulation', 'senate', 'parliament', 'court', 'supreme']
    economy_keywords = ['market', 'stock', 'economy', 'finance', 'inflation', 'bank', 'trade', 'investment', 'gdp', 'revenue']
    cyber_keywords = ['cyber', 'hack', 'breach', 'ransomware', 'malware', 'phishing', 'data leak', 'cybersecurity', 'attack']
    conflict_keywords = ['war', 'military', 'border', 'defense', 'tension', 'conflict', 'missile', 'army', 'troop', 'alliance']
    
    # Priority matching
    if any(k in text_lower for k in cyber_keywords):
        return "Cyber Security"
    elif any(k in text_lower for k in conflict_keywords):
        return "Conflict"
    elif any(k in text_lower for k in tech_keywords):
        return "Technology"
    elif any(k in text_lower for k in government_keywords):
        return "Government"
    elif any(k in text_lower for k in politics_keywords):
        return "Politics"
    elif any(k in text_lower for k in economy_keywords):
        return "Economy"
    
    return "News"

def generate_country_summary(news_items: list) -> str:
    """
    Generates a 4-5 line cohesive AI summary based on the fetched categorized items.
    """
    if not news_items:
        return "No recent data available to generate a summary."
        
    sentences = []
    # Pick top sentence from a few items
    for item in news_items[:4]:
        # get the first sentence of the summary
        blob = TextBlob(item['summary'])
        if blob.sentences:
            sentences.append(str(blob.sentences[0]))
            
    if not sentences:
        return "No text available to summarize."
        
    return " ".join(sentences)

