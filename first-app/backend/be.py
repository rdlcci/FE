from fastapi import FastAPI, Request
from light_client import LIGHTClient
from typing import Dict, Optional
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="SQL API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS = {
     "url"  : "https://api.cortex.lilly.com",
     "model"  : "text2sql"
    }

class AnalysisSummaryRequest(BaseModel):
    question: str
    hint: Optional[str] = None
    db_type: str

@app.post("/api/analysis/summarize")
async def get_summary(request:Request, body: AnalysisSummaryRequest):
    prompt = f"""
    if the statement below is not related to HCPs (health care providers, doctors) or meetings or sales or medicines or marktes or prescriptions then reply only explain why or else reply "YES"
    
    ## Statement
    {body.question}

    ## OUTPUT
    """
    summary = ask_llm(request, MODELS, prompt)
    return summary

def ask_llm(request, model_config : Dict, prompt : str) -> str:
    '''
    To connect to cortex and get reply from llm
    '''
    # client = requests.Session()
    client = LIGHTClient()
    auth_token = request.headers.get("cats-app-auth", "")
    model = model_config["model"]#"text2sql"
    CORTEX_BASE = model_config["url"]
    # CORTEX_BASE = "https://dev.api.cortex.lilly.com"
    # result = client.get(f"{CORTEX_BASE}/model/ask/{model}", params = {"q": prompt}, headers={"Authorization" : f"{auth_token}"} )
    result = client.get(f"{CORTEX_BASE}/model/ask/{model}", params = {"q": prompt} )
    # print(result.content)
    # return result.json()
    print(result.status_code, result.text)
    return result.json()["message"]


if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server...")
    try:
        # uvicorn.run(app, host="0.0.0.0", port=8000)  # Changed from localhost to 0.0.0.0
        uvicorn.run(app, host="localhost", port=8000)  # Changed from localhost to 0.0.0.0

    except Exception as e:
        print(f"Failed to start server: {e}")