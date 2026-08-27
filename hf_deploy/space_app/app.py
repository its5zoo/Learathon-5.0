from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
from llama_cpp import Llama
from huggingface_hub import hf_hub_download

app = FastAPI(title="3BrainCell Gemma Mental Health API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_REPO_ID = os.environ.get("HF_REPO_ID", "its5zoo/gemma-mentalhealth-3braincell")
MODEL_FILENAME = os.environ.get("MODEL_FILENAME", "gemma-mentalhealth-trained-by-three-brain-cell-2026-learathon.gguf")

print(f"📥 Downloading/Caching GGUF Model from {HF_REPO_ID}...")
try:
    model_path = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename=MODEL_FILENAME,
    )
    print(f"✅ Model downloaded to: {model_path}")
    print("🧠 Initializing Llama-CPP Inference Engine...")
    llm = Llama(
        model_path=model_path,
        n_ctx=2048,
        n_threads=2,
        n_batch=512,
        verbose=False
    )
    print("🚀 Model successfully loaded and ready for inference!")
except Exception as e:
    print(f"⚠️ Model load error: {e}")
    llm = None

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 300

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "model": "Gemma-2B-3BrainCell-MentalHealth",
        "engine": "llama.cpp",
        "loaded": llm is not None
    }

@app.post("/v1/chat/completions")
def chat_completions(req: ChatRequest):
    if llm is None:
        raise HTTPException(status_code=503, detail="Model is still loading or failed to load.")

    # Convert chat messages to Gemma Turn Tokens
    formatted_prompt = ""
    for msg in req.messages:
        if msg.role == "system":
            formatted_prompt += f"<start_of_turn>user\nSystem Instruction: {msg.content}\n"
        elif msg.role == "user":
            formatted_prompt += f"<start_of_turn>user\n{msg.content}<end_of_turn>\n"
        elif msg.role == "assistant":
            formatted_prompt += f"<start_of_turn>model\n{msg.content}<end_of_turn>\n"

    formatted_prompt += "<start_of_turn>model\n"

    try:
        output = llm(
            formatted_prompt,
            max_tokens=req.max_tokens or 256,
            temperature=req.temperature or 0.7,
            stop=["<end_of_turn>", "<start_of_turn>"]
        )

        reply_text = output["choices"][0]["text"].strip()

        return {
            "id": "chatcmpl-3braincell",
            "object": "chat.completion",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": reply_text
                    },
                    "finish_reason": "stop"
                }
            ],
            "model": "Gemma-2B-3BrainCell-MentalHealth"
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
