"""
SoulSpace Local LLM Server for Fine-Tuned Gemma 2B GGUF Model
Loads: C:\\Users\\OMEN\\OneDrive\\Desktop\\llm\\gemma-mentalhealth-trained-by-three-brain-cell-2026-learathon.gguf
Exposes:
  - POST /api/chat (Ollama compatible format)
  - POST /v1/chat/completions (OpenAI format)
  - GET /api/health
"""

import os
import sys

# Force UTF-8 on Windows console
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from llama_cpp import Llama

MODEL_PATH = r"C:\Users\OMEN\OneDrive\Desktop\llm\gemma-mentalhealth-trained-by-three-brain-cell-2026-learathon.gguf"
PORT = 11434

print(f"[SoulSpace] Initializing Gemma 2B Mental Health model from: {MODEL_PATH}")

if not os.path.exists(MODEL_PATH):
    print(f"[SoulSpace] Error: Model file not found at: {MODEL_PATH}")
    sys.exit(1)

# Initialize Llama model
try:
    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=4096,
        n_threads=os.cpu_count() or 4,
        verbose=False
    )
    print("[SoulSpace] Gemma 2B Mental Health model loaded successfully into memory!")
except Exception as e:
    print(f"[SoulSpace] Failed to load model: {e}")
    sys.exit(1)

app = FastAPI(title="SoulSpace Gemma 2B Inference Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class OllamaChatRequest(BaseModel):
    model: Optional[str] = "gemma-mentalhealth"
    messages: List[ChatMessage]
    stream: Optional[bool] = False
    options: Optional[Dict[str, Any]] = None

@app.get("/api/health")
def health_check():
    return {"status": "ok", "model": "gemma-mentalhealth-trained-by-three-brain-cell-2026-learathon"}

@app.get("/api/tags")
def list_models():
    return {
        "models": [
            {
                "name": "gemma-mentalhealth",
                "model": "gemma-mentalhealth",
                "details": {"family": "gemma", "format": "gguf"}
            }
        ]
    }

@app.post("/api/chat")
async def chat_ollama(req: OllamaChatRequest):
    try:
        formatted_messages = [{"role": m.role, "content": m.content} for m in req.messages]
        
        response = llm.create_chat_completion(
            messages=formatted_messages,
            temperature=0.7,
            top_p=0.9,
            max_tokens=1024
        )
        
        content = response["choices"][0]["message"]["content"]
        
        return {
            "model": req.model or "gemma-mentalhealth",
            "message": {
                "role": "assistant",
                "content": content
            },
            "done": True
        }
    except Exception as e:
        print(f"[SoulSpace] Error in chat completion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/chat/completions")
async def chat_openai(req: Dict[str, Any]):
    try:
        messages = req.get("messages", [])
        response = llm.create_chat_completion(
            messages=messages,
            temperature=req.get("temperature", 0.7),
            max_tokens=req.get("max_tokens", 1024)
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print(f"[SoulSpace] Server starting on http://localhost:{PORT}")
    uvicorn.run(app, host="127.0.0.1", port=PORT)
