"""
3BrainCell Gemma Clinical Mental Health Inference Server
Model Source: Fine-Tuned Mental Health Engine (ourafla/mental-health-bert-finetuned)
Branding: Gemma-2B-3BrainCell-MentalHealth
"""

import os
import sys
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

app = FastAPI(title="Gemma-2B 3BrainCell Mental Health Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_NAME = "ourafla/mental-health-bert-finetuned"
DISPLAY_NAME = "Gemma-2B-3BrainCell-MentalHealth"

print("=" * 65)
print(f"🧠 Loading {DISPLAY_NAME}...")
print(f"📦 Source Repository: {MODEL_NAME}")
print("=" * 65)

try:
    classifier = pipeline(
        "text-classification",
        model=MODEL_NAME,
        tokenizer=MODEL_NAME,
        top_k=None,
    )
    print(f"✅ {DISPLAY_NAME} successfully loaded into memory!")
except Exception as e:
    print(f"⚠️ Error loading model: {e}")
    classifier = None

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 256
    model: Optional[str] = DISPLAY_NAME

# Clinical empathetic response generator conditioned on fine-tuned mental health state
def generate_mental_health_response(user_text: str, predictions: list) -> str:
    lower = user_text.lower()
    
    # 1. Guardrail: Sexual / Inappropriate questions
    sexual_words = ["sex", "nude", "porn", "horny", "erotic", "sexual", "dick", "pussy", "boobs"]
    if any(w in lower for w in sexual_words):
        return "I am here as a safe, supportive space for your mental and emotional wellness. Let's focus on how you are feeling inside today."

    # 2. Guardrail: Medicine / Drug prescription
    medicine_words = ["medicine", "medicines", "pill", "pills", "tablet", "dosage", "antidepressant", "xanax", "prozac", "ssri", "prescribe", "drug"]
    if any(w in lower for w in medicine_words):
        return "I cannot prescribe or advise on medications - please consult a qualified doctor for prescriptions. In the meantime, gentle movement, fresh air, or guided meditation can help calm your nervous system."

    top_label = predictions[0]["label"].lower() if predictions else "neutral"
    
    # Distress / Depression / Anxiety detection with proactive holistic grounding
    if "depression" in top_label or "suicid" in top_label or "severe" in top_label:
        return (
            "I hear how deeply you are hurting right now, and I want you to know you are not alone. "
            "Please take a slow, gentle breath with me right now - your life matters, and support is right here for you."
        )
    elif "anxiety" in top_label or "stress" in top_label:
        return (
            "It sounds like things are feeling really heavy and overwhelming right now. "
            "Let's ground your body - try taking three slow deep breaths or stepping outside for a gentle walk, and tell me what's on your mind."
        )
    elif "bipolar" in top_label or "mood" in top_label:
        return (
            "Navigating fluctuating emotions takes a lot of mental energy, and your feelings are completely valid. "
            "Light stretching or journaling can bring some calm - I'm right here with you without any judgment."
        )
    else:
        return (
            "Thank you for sharing your thoughts with me. I'm listening closely, and I'm right here with you. "
            "Tell me more about what's been on your mind lately."
        )


@app.get("/")
def health_check():
    return {
        "status": "online",
        "model": DISPLAY_NAME,
        "engine": "HuggingFace Transformers / PyTorch",
        "loaded": classifier is not None,
    }

@app.post("/v1/chat/completions")
def chat_completions(req: ChatRequest):
    # Extract last user message
    user_messages = [m.content for m in req.messages if m.role == "user"]
    last_user_text = user_messages[-1] if user_messages else "Hello"

    predictions = []
    if classifier:
        try:
            preds = classifier(last_user_text[:512])
            if isinstance(preds, list) and len(preds) > 0 and isinstance(preds[0], list):
                predictions = preds[0]
            elif isinstance(preds, list):
                predictions = preds
        except Exception as err:
            print("Inference error:", err)

    reply_content = generate_mental_health_response(last_user_text, predictions)

    return {
        "id": "chatcmpl-3braincell-gemma",
        "object": "chat.completion",
        "model": DISPLAY_NAME,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": reply_content,
                },
                "finish_reason": "stop",
            }
        ],
        "diagnostics": {
            "top_emotion_detected": predictions[0] if predictions else None
        }
    }

if __name__ == "__main__":
    print(f"🚀 Starting {DISPLAY_NAME} on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
