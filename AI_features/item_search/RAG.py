import os
import psycopg2
from dotenv import load_dotenv
from langchain.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.schema import Document

# Step 1: Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")

# Step 2: Connect to PostgreSQL and load product data
def fetch_products():
    connection_params = {
        'dbname': 'postgres',
        'user': 'postgres',
        'host': 'localhost',
        'port': '5432',
        'password': '1234'
    }

    conn = psycopg2.connect(**connection_params)
    cursor = conn.cursor()

    cursor.execute("SELECT id, product_title, product_name, product_description, image_url FROM products")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    # Create a list of LangChain Documents
    documents = []
    for row in rows:
        doc_text = f"""Product ID: {row[0]}
Title: {row[1]}
Name: {row[2]}
Description: {row[3]}
Image URL: {row[4]}
"""
        metadata = {"product_id": row[0], "product_name": row[2]}
        documents.append(Document(page_content=doc_text, metadata=metadata))

    return documents

# Step 3: Create embeddings and a retriever
documents = fetch_products()

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=GOOGLE_API_KEY
)

retriever = Chroma.from_documents(documents, embedding=embeddings).as_retriever(search_kwargs={"k": 3})

# Step 4: Set up the prompt and LLM
prompt_template = """You are a helpful assistant with knowledge about a product catalog.

Use the following product data to answer the question. If you don't know the answer, say you don't know.

{context}

Question: {question}

Answer:"""

PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash", 
    google_api_key=GOOGLE_API_KEY,
    temperature=0.3,
    top_p=1,
    top_k=40,
    max_output_tokens=2048
)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT}
)

# Step 5: Ask a question
query = "Which product is best for gaming and what is its description?"
result = qa_chain({"query": query})

# Step 6: Print result
print("\nQuery:", query)
print("\nAnswer:", result["result"])
print("\nRelevant Products:")
for doc in result["source_documents"]:
    print("-" * 40)
    print(doc.page_content)
