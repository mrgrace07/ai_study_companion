import os
from dotenv import load_dotenv


from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

from langchain_groq import ChatGroq

import pyttsx3



load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in .env")



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

from datetime import datetime

AUDIO_DIR = "audio_outputs"
os.makedirs(AUDIO_DIR, exist_ok=True)

def speak(text: str):
    engine = pyttsx3.init()
    engine.setProperty("rate", 170)
    engine.say(text)
    engine.runAndWait()
    engine.stop()

def save_audio(text: str):
    engine = pyttsx3.init()
    engine.setProperty("rate", 170)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    audio_path = os.path.join(AUDIO_DIR, f"response_{timestamp}.wav")

    engine.save_to_file(text, audio_path)
    engine.runAndWait()
    engine.stop()

    print(f"[Audio saved] {audio_path}")

    



def ask_question(chain, query):
    response = chain.invoke(query)
    answer_text = response.content

    print("\nAnswer:\n")
    print(answer_text)
    print("-" * 60)

    speak(answer_text)

    choice = input("Save this response as audio? (y/n): ").strip().lower()

    if choice == "y":
        save_audio(answer_text)



if __name__ == "__main__":
    PDF_PATH = "data/story.pdf"

    print("Loading PDF...")
    docs = load_pdf(PDF_PATH)

    print("Splitting document...")
    chunks = split_docs(docs)

    print("Creating vector store...")
    vectorstore = create_vector_store(chunks)

    print("Loading Groq LLM...")
    llm = load_llm()

    print("Building RAG pipeline...")
    rag_chain = create_rag_chain(vectorstore, llm)

    print("\n RAG system ready!")
    print("Type a question or 'exit'\n")

    while True:
        q = input("Ask: ")
        if q.lower() == "exit":
            print("Bye!")
            break

        ask_question(rag_chain, q)
