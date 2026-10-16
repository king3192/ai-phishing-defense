"""
Model Training Script for AI Phishing Defense Platform
Trains TF-IDF NLP Text Classifier & URL Feature Classifier using Scikit-Learn
Exports binary models to .pkl files for fast inference in FastAPI backend.
"""

import os
import re
import pickle
import pandas as pd
import numpy as np
from urllib.parse import urlparse

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

from generate_dataset import generate_csv_files

def extract_url_features(url):
    """Lexical & structural URL feature extraction"""
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

def train_and_save():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    generate_csv_files(base_dir)
    
    # 1. Train Text Classifier (Email / SMS / WhatsApp)
    print("\n--- Training Text Phishing Classifier ---")
    text_df = pd.read_csv(os.path.join(base_dir, "text_dataset.csv"), keep_default_na=False)
    text_df["scam_type"] = text_df["scam_type"].fillna("None").astype(str)
    
    tfidf = TfidfVectorizer(ngram_range=(1, 2), max_features=3000)
    X_text = tfidf.fit_transform(text_df["text"])
    
    label_encoder = LabelEncoder()
    y_scam = label_encoder.fit_transform(text_df["scam_type"])
    
    text_model = LogisticRegression(max_iter=1000, C=1.5)
    text_model.fit(X_text, y_scam)
    
    text_acc = accuracy_score(y_scam, text_model.predict(X_text))
    print(f"Text Classifier Accuracy: {text_acc * 100:.2f}%")
    
    # 2. Train URL Classifier
    print("\n--- Training URL Phishing Classifier ---")
    url_df = pd.read_csv(os.path.join(base_dir, "url_dataset.csv"), keep_default_na=False)
    url_df["scam_type"] = url_df["scam_type"].fillna("None").astype(str)
    
    X_url = np.array([extract_url_features(u) for u in url_df["url"]])
    y_url_verdict = (url_df["verdict"] == "Phishing").astype(int)
    
    url_model = RandomForestClassifier(n_estimators=100, random_state=42)
    url_model.fit(X_url, y_url_verdict)
    
    url_acc = accuracy_score(y_url_verdict, url_model.predict(X_url))
    print(f"URL Classifier Accuracy: {url_acc * 100:.2f}%")
    
    # 3. Save Model Artifacts
    artifacts = {
        "text_model.pkl": text_model,
        "url_model.pkl": url_model,
        "tfidf_vectorizer.pkl": tfidf,
        "label_encoder.pkl": label_encoder,
    }
    
    for filename, obj in artifacts.items():
        filepath = os.path.join(base_dir, filename)
        with open(filepath, "wb") as f:
            pickle.dump(obj, f)
        print(f"Saved: {filepath}")
        
    print("\n[SUCCESS] ML Models trained & persisted successfully!")

if __name__ == "__main__":
    train_and_save()
