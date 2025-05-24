import os
from dotenv import load_dotenv
from langchain.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate

class Rag:
    def __init__(self, persist_directory="my_vector_db"):
        load_dotenv()
        self.persist_directory = persist_directory
        print(f"Chroma is using persist directory: {self.persist_directory}")
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set.")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=self.api_key
        )
        self.chroma = Chroma(persist_directory=self.persist_directory, embedding_function=self.embeddings)
        self.retriever = self.chroma.as_retriever()

        # Add LLM and custom prompt
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.api_key,
            temperature=0.3,
            top_p=1,
            top_k=40,
            max_output_tokens=2048
        )
        prompt_template = """You are a helpful assistant with knowledge about a product catalog.\n\nUse the following product data to answer the question. If you don't know the answer, say you don't know.\n\n{context}\n\nQuestion: {question}\n\nAnswer:"""
        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": PROMPT}
        )

    def print_collection_contents(self):
        """Debugging: Show first 3 documents in Chroma"""
        docs = self.chroma.get(include=['documents', 'metadatas'])
        for i, (doc, meta) in enumerate(zip(docs['documents'], docs['metadatas'])):
            print(f"\nDocument {i+1}:")
            print("Content:", doc)
            print("Metadata:", meta)

    def retrieve_products(self, query: str, n: int = 3):
        """Improved with query expansion"""
        expanded_query = f"{query}"
        results = self.chroma.similarity_search(expanded_query, k=n)
        product_ids = []
        for doc in results:
            # Look for 'id' in metadata (change from 'product_id')
            if hasattr(doc, 'metadata') and 'id' in doc.metadata:
                product_ids.append(doc.metadata['id'])
        return product_ids

    def retrieve_all_queried_products(self, query: str, threshold: float = 0.8, k: int = 10):
        """Retrieve all products above a similarity threshold. Lower distance = more similar."""
        expanded_query = f"{query}"
        # Get documents, metadatas, and distances
        results = self.chroma.similarity_search_with_score(expanded_query, k=k)
        filtered = []
        for doc, score in results:
            # Print similarity for each item
            id_str = doc.metadata.get('id', doc.metadata.get('title', 'Unknown'))
            print(f"Item: {id_str} | Similarity (distance): {score}")
            # Chroma returns cosine distance, so lower is better. Threshold is max allowed distance.
            if score <= threshold:
                filtered.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "distance": score
                })
        return filtered

    def ask_question(self, query: str):
        """Mimic reference code's QA functionality"""
        result = self.qa_chain({"query": query})
        return {
            "answer": result["result"],
            "sources": result["source_documents"]
        }
