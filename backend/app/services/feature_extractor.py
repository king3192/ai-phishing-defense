import re
from urllib.parse import urlparse

def extract_url_features(url: str):
    parsed = urlparse(url if url.startswith(('http://', 'https://')) else 'http://' + url)
    netloc = parsed.netloc or parsed.path.split('/')[0]
    
    length = len(url)
    num_dots = url.count('.')
    num_hyphens = url.count('-')
    num_at = url.count('@')
    num_question = url.count('?')
    num_equal = url.count('=')
    num_digits = sum(c.isdigit() for c in url)
    is_https = 1 if url.startswith('https://') else 0
    has_ip = 1 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', netloc) else 0
    
    suspicious_keywords = ['login', 'verify', 'update', 'account', 'secure', 'bank', 'pay', 'claim', 'kyc', 'free', 'win', 'reward', 'otp', 'cancel']
    keyword_count = sum(1 for kw in suspicious_keywords if kw in url.lower())
    
    tld = netloc.split('.')[-1] if '.' in netloc else ''
    suspicious_tld = 1 if tld in ['xyz', 'top', 'site', 'cc', 'info', 'biz', 'co', 'work', 'tk', 'ml', 'ga', 'cf', 'gq'] else 0
    
    return [
        length, num_dots, num_hyphens, num_at, num_question, num_equal,
        num_digits, is_https, has_ip, keyword_count, suspicious_tld
    ]

def analyze_url_heuristics(url: str):
    """Detailed explainability signal extractor for URL scanning"""
    parsed = urlparse(url if url.startswith(('http://', 'https://')) else 'http://' + url)
    netloc = parsed.netloc or parsed.path.split('/')[0]
    signals = []
    score_penalty = 0

    if not url.startswith('https://'):
        signals.append("Insecure HTTP protocol (missing SSL certificate)")
        score_penalty += 20
    
    if len(url) > 75:
        signals.append(f"Excessively long URL ({len(url)} characters)")
        score_penalty += 15
        
    if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', netloc):
        signals.append("URL uses direct IP address instead of domain name")
        score_penalty += 35
        
    tld = netloc.split('.')[-1] if '.' in netloc else ''
    if tld in ['xyz', 'top', 'site', 'cc', 'info', 'biz', 'work']:
        signals.append(f"High-risk top-level domain (.{tld}) commonly abused in phishing")
        score_penalty += 25

    if url.count('-') >= 2:
        signals.append(f"Multiple hyphens ({url.count('-')}) in domain name (brand spoofing risk)")
        score_penalty += 15

    for keyword in ['sbi', 'hdfc', 'icici', 'paytm', 'phonepe', 'gpay', 'amazon', 'fedex', 'google', 'facebook', 'instagram']:
        if keyword in url.lower() and not netloc.endswith(f"{keyword}.com") and not netloc.endswith(f"{keyword}.in") and not netloc.endswith(f"{keyword}.co.in"):
            signals.append(f"Domain appears to spoof brand name: '{keyword}'")
            score_penalty += 30
            
    if 'login' in url.lower() or 'verify' in url.lower() or 'update' in url.lower() or 'kyc' in url.lower():
        signals.append("Contains sensitive action keywords ('login', 'verify', 'update', 'kyc')")
        score_penalty += 15

    return signals, score_penalty

def analyze_text_heuristics(text: str):
    """Detailed explainability signal extractor for Email/SMS scanning"""
    signals = []
    score_penalty = 0
    text_lower = text.lower()

    urgency_words = ['urgent', 'immediately', 'suspended', 'expire', '24 hours', 'blocked', 'deactivated', 'penalty', 'today']
    detected_urgency = [w for w in urgency_words if w in text_lower]
    if detected_urgency:
        signals.append(f"High-urgency emotional trigger language detected: '{', '.join(detected_urgency)}'")
        score_penalty += 25

    financial_terms = ['bank', 'account', 'otp', 'upi pin', 'card ending', 'cashback', 'lakhs', 'refund', 'deposit', 'reward']
    detected_financial = [w for w in financial_terms if w in text_lower]
    if detected_financial:
        signals.append(f"Financial transaction / credential keywords requested: '{', '.join(detected_financial)}'")
        score_penalty += 25

    if re.search(r'http[s]?://[^\s]+', text):
        signals.append("Contains embedded unverified hyper-link")
        score_penalty += 15

    if 'pay' in text_lower and ('fee' in text_lower or 'charge' in text_lower or 'shipping' in text_lower):
        signals.append("Advance fee payment request before service delivery")
        score_penalty += 20

    if 'otp' in text_lower and ('share' in text_lower or 'provide' in text_lower or 'agent' in text_lower):
        signals.append("Direct request to share OTP or secret authorization code")
        score_penalty += 35

    return signals, score_penalty
