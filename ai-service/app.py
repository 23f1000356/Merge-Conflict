from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os

app = Flask(__name__)
CORS(app)

# Mock model path
MODEL_PATH = 'risk_model.joblib'

def calculate_risk(data):
    # This is a mock implementation of the AI processing
    # In a real scenario, this would load a trained model and predict
    
    memory_score = data.get('memoryScore', 50)
    reaction_time = data.get('reactionTime', 500)
    attention_score = data.get('attentionScore', 50)
    typing_speed = data.get('typingSpeed', 30)
    voice_score = data.get('voiceScore', 50)
    
    # Simple logic for mock risk assessment
    # Cognitive Index: higher is better
    cognitive_index = (memory_score * 0.3) + (attention_score * 0.2) + (typing_speed * 0.2) + (voice_score * 0.3)
    
    # Brain Age: lower is better (baseline ~ actual age)
    # Let's assume average age is 40 for mock
    base_age = 40
    brain_age_offset = (500 - reaction_time) / 100 + (cognitive_index - 70) / 10
    brain_age = base_age - brain_age_offset
    
    # Risk Probability: lower is better
    risk_prob = 100 - cognitive_index
    if reaction_time > 800:
        risk_prob += 10
    if voice_score < 40:
        risk_prob += 5
    
    risk_prob = max(0, min(100, risk_prob))
    
    return {
        'riskProbability': round(risk_prob, 2),
        'brainAge': round(max(18, brain_age), 1),
        'cognitiveIndex': round(cognitive_index, 2),
        'riskLevel': 'High' if risk_prob > 70 else 'Moderate' if risk_prob > 30 else 'Low'
    }

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    results = calculate_risk(data)
    return jsonify(results)

@app.route('/retrain', methods=['POST'])
def retrain():
    # Placeholder for model retraining logic
    return jsonify({'message': 'Model retraining triggered successfully', 'accuracy': 0.92})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_version': '1.0.0'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
