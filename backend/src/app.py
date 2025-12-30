import os
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional
import base64

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq

import pyttsx3

load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="RAG System API",
    description="Question-answering system with PDF processing and text-to-speech",
    version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

# Middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store the RAG chain
vectorstore = None
rag_chain = None
current_pdf_name = None

AUDIO_DIR = "audio_outputs"
UPLOAD_DIR = "uploads"
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic models for request/response
class QuestionRequest(BaseModel):
    question: str
    save_audio: bool = False

class QuestionResponse(BaseModel):
    question: str
    answer: str
    audio_file: Optional[str] = None

class StatusResponse(BaseModel):
    status: str
    message: str
    pdf_loaded: Optional[str] = None

# Helper functions
def load_pdf(pdf_path: str):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found at: {pdf_path}")
    loader = PyPDFLoader(pdf_path)
    return loader.load()

def split_docs(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    return splitter.split_documents(documents)

def create_vector_store(chunks):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )
    return vectorstore

def load_llm():
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not found in .env")
    
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.3
    )
    return llm

def create_rag_chain(vectorstore, llm):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    prompt = ChatPromptTemplate.from_template(
        """
        Answer the question using ONLY the context below.
        If the answer is not present in the context, say "I don't know".

        Context:
        {context}

        Question:
        {question}
        """
    )
    
    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
    )
    
    return rag_chain

def save_audio(text: str) -> str:
    engine = pyttsx3.init()
    engine.setProperty("rate", 170)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    audio_path = os.path.join(AUDIO_DIR, f"response_{timestamp}.wav")
    
    engine.save_to_file(text, audio_path)
    engine.runAndWait()
    engine.stop()
    
    return audio_path

# API Endpoints

@app.get("/", response_model=StatusResponse)
async def root():
    """Root endpoint - check API status"""
    return StatusResponse(
        status="online",
        message="RAG System API is running",
        pdf_loaded=current_pdf_name
    )

@app.post("/upload-pdf", response_model=StatusResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload and process a PDF file.
    This creates the vector store and initializes the RAG chain.
    """
    global vectorstore, rag_chain, current_pdf_name
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file
        pdf_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(pdf_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process PDF
        docs = load_pdf(pdf_path)
        chunks = split_docs(docs)
        vectorstore = create_vector_store(chunks)
        
        # Initialize LLM and RAG chain
        llm = load_llm()
        rag_chain = create_rag_chain(vectorstore, llm)
        
        current_pdf_name = file.filename
        
        return StatusResponse(
            status="success",
            message=f"PDF processed successfully. {len(chunks)} chunks created.",
            pdf_loaded=current_pdf_name
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """
    Ask a question about the loaded PDF.
    Optionally save the response as audio.
    """
    global rag_chain
    
    if rag_chain is None:
        raise HTTPException(
            status_code=400,
            detail="No PDF loaded. Please upload a PDF first using /upload-pdf"
        )
    
    try:
        # Get answer from RAG chain
        response = rag_chain.invoke(request.question)
        answer_text = response.content
        
        audio_file = None
        if request.save_audio:
            audio_path = save_audio(answer_text)
            audio_file = os.path.basename(audio_path)
        
        return QuestionResponse(
            question=request.question,
            answer=answer_text,
            audio_file=audio_file
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """
    Download a generated audio file.
    """
    audio_path = os.path.join(AUDIO_DIR, filename)
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        audio_path,
        media_type="audio/wav",
        filename=filename
    )

@app.get("/list-audio")
async def list_audio_files():
    """
    List all generated audio files.
    """
    if not os.path.exists(AUDIO_DIR):
        return {"audio_files": []}
    
    files = [f for f in os.listdir(AUDIO_DIR) if f.endswith('.wav')]
    files.sort(reverse=True)  # Most recent first
    
    return {
        "audio_files": files,
        "count": len(files)
    }

@app.delete("/audio/{filename}")
async def delete_audio(filename: str):
    """
    Delete a specific audio file.
    """
    audio_path = os.path.join(AUDIO_DIR, filename)
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    try:
        os.remove(audio_path)
        return {"status": "success", "message": f"Deleted {filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")

@app.get("/status", response_model=StatusResponse)
async def get_status():
    """
    Get current system status.
    """
    return StatusResponse(
        status="ready" if rag_chain is not None else "no_pdf_loaded",
        message="System ready for questions" if rag_chain is not None else "Upload a PDF to start",
        pdf_loaded=current_pdf_name
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)