import os
import pickle
import numpy as np
from app.services.feature_extractor import extract_url_features, analyze_url_heuristics, analyze_text_heuristics

class MLService:
    def __init__(self):
        self.text_model = None
        self.url_model = None
        self.tfidf = None
        self.label_encoder = None
        self.is_loaded = False

    def load_models(self):
        candidates = []
        if os.environ.get("ML_MODEL_DIR"):
            candidates.append(os.environ["ML_MODEL_DIR"])
        # Check backend/ml_model
        candidates.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml_model")))
        # Check root ml_model
        candidates.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml_model")))

        base_dir = None
        for c in candidates:
            if os.path.exists(os.path.join(c, "text_model.pkl")):
                base_dir = c
                break

        if not base_dir:
            base_dir = candidates[0]
            print(f"[ML Engine] Model files missing. Executing train_models.py in {base_dir}...")
            import sys
            sys.path.append(base_dir)
            from train_models import train_and_save
            train_and_save()

        try:
            with open(os.path.join(base_dir, "text_model.pkl"), "rb") as f:
                self.text_model = pickle.load(f)
            with open(os.path.join(base_dir, "url_model.pkl"), "rb") as f:
                self.url_model = pickle.load(f)
            with open(os.path.join(base_dir, "tfidf_vectorizer.pkl"), "rb") as f:
                self.tfidf = pickle.load(f)
            with open(os.path.join(base_dir, "label_encoder.pkl"), "rb") as f:
                self.label_encoder = pickle.load(f)
            
            self.is_loaded = True
            print(f"[ML Engine] All machine learning models loaded successfully from: {base_dir}")
        except Exception as e:
            print(f"[ML Engine ERROR] Failed to load ML models: {e}")

    def scan_text(self, text: str):
        """Scans email/SMS text content and returns (verdict, threat_score, scam_type, explainability)"""
        if not self.is_loaded:
            self.load_models()

        signals, heuristic_penalty = analyze_text_heuristics(text)
        
        # NLP TF-IDF prediction
        vectorized = self.tfidf.transform([text])
        pred_class_idx = self.text_model.predict(vectorized)[0]
        probabilities = self.text_model.predict_proba(vectorized)[0]
        
        predicted_scam_val = self.label_encoder.inverse_transform([pred_class_idx])[0]
        predicted_scam = str(predicted_scam_val) if (predicted_scam_val is not None and not (isinstance(predicted_scam_val, float) and np.isnan(predicted_scam_val))) else "None"
        if predicted_scam.lower() in ["none", "nan"]:
            predicted_scam = "None"
        max_prob = float(np.max(probabilities))

        if predicted_scam == "None":
            ml_score = (1.0 - max_prob) * 40.0
            scam_type = "None"
        else:
            ml_score = max_prob * 100.0
            scam_type = predicted_scam

        total_threat_score = min(100.0, max(0.0, (ml_score * 0.7) + (heuristic_penalty * 0.3)))

        if total_threat_score < 30.0:
            verdict = "Safe"
            scam_type = "None"
            if not signals:
                signals.append("Normal language structure with no suspicious urgency or financial triggers.")
        elif total_threat_score < 65.0:
            verdict = "Suspicious"
            if scam_type == "None":
                scam_type = "Other/Unclassified scam"
        else:
            verdict = "Phishing"
            if scam_type == "None":
                scam_type = "Other/Unclassified scam"

        return {
            "verdict": verdict,
            "threat_score": round(total_threat_score, 1),
            "scam_type": scam_type,
            "explainability": signals
        }

    def scan_url(self, url: str):
        """Scans URL string and returns (verdict, threat_score, scam_type, explainability)"""
        if not self.is_loaded:
            self.load_models()

        signals, heuristic_penalty = analyze_url_heuristics(url)
        features = extract_url_features(url)
        
        url_prob = float(self.url_model.predict_proba([features])[0][1])
        ml_score = url_prob * 100.0

        total_threat_score = min(100.0, max(0.0, (ml_score * 0.6) + (heuristic_penalty * 0.4)))

        # Also pass URL through text classifier to identify scam sub-category
        vectorized = self.tfidf.transform([url])
        pred_class_idx = self.text_model.predict(vectorized)[0]
        predicted_scam_val = self.label_encoder.inverse_transform([pred_class_idx])[0]
        predicted_scam = str(predicted_scam_val) if (predicted_scam_val is not None and not (isinstance(predicted_scam_val, float) and np.isnan(predicted_scam_val))) else "None"
        if predicted_scam.lower() in ["none", "nan"]:
            predicted_scam = "None"

        if total_threat_score < 30.0:
            verdict = "Safe"
            scam_type = "None"
            if not signals:
                signals.append("Domain exhibits valid HTTPS configuration and standard lexical parameters.")
        elif total_threat_score < 65.0:
            verdict = "Suspicious"
            scam_type = predicted_scam if predicted_scam != "None" else "Other/Unclassified scam"
        else:
            verdict = "Phishing"
            scam_type = predicted_scam if predicted_scam != "None" else "Banking scam"

        return {
            "verdict": verdict,
            "threat_score": round(total_threat_score, 1),
            "scam_type": scam_type,
            "explainability": signals
        }

ml_service = MLService()
