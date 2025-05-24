import psycopg2
from psycopg2 import OperationalError
from datetime import datetime
from langchain.schema import Document
from typing import List
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
import os
from dotenv import load_dotenv

class HandleChromaDB:
    def __init__(self, db_path="my_vector_db", embedding_function=None):
        load_dotenv()
        self.db_path = db_path
        self.latest_posted_datetime = None
        self.embeddings = embedding_function or GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.chroma = None

    def _products_to_documents(self, products: List[tuple]) -> List[Document]:
        """Convert PostgreSQL products to LangChain Documents"""
        documents = []
        for prod in products:
            (prod_id, title, desc, price, seller, sellerId, category, condition, location, postedDate, image_url) = prod
            doc_text = f"""Product ID: {prod_id}\nTitle: {title}\nDescription: {desc}\nPrice: {price}\nSeller: {seller}\nCategory: {category}\nCondition: {condition}\nLocation: {location}\nImage URL: {image_url}\n"""
            metadata = {
                "id": prod_id,  # Use 'id' for compatibility with Rag
                "title": title,
                "price": price,
                "seller": seller,
                "sellerId": sellerId,
                "category": category,
                "condition": condition,
                "location": location,
                "postedDate": postedDate.isoformat() if isinstance(postedDate, datetime) else str(postedDate),
                "image": image_url
            }
            documents.append(Document(page_content=doc_text, metadata=metadata))
        return documents

    def fetch_new_products(self):
        connection_params = {
            'dbname': 'postgres',
            'user': 'postgres',
            'host': 'localhost',
            'port': '5432',
            'password': '1234'
        }
        try:
            connection = psycopg2.connect(**connection_params)
            cursor = connection.cursor()
            if self.latest_posted_datetime:
                cursor.execute("""
                    SELECT id, title, description, price, seller, sellerId, category, condition, location, postedDate, image
                    FROM products
                    WHERE postedDate > %s
                    ORDER BY postedDate ASC;
                """, (self.latest_posted_datetime,))
            else:
                cursor.execute("""
                    SELECT id, title, description, price, seller, sellerId, category, condition, location, postedDate, image
                    FROM products
                    ORDER BY postedDate ASC;
                """)
            products = cursor.fetchall()
            cursor.close()
            connection.close()
            return products
        except OperationalError as e:
            print(f"Database connection error: {e}")
            return []
        except Exception as e:
            print(f"Error: {e}")
            return []

    def sync_to_chroma(self):
        """Fetch all products and sync to Chroma vector DB using LangChain API."""
        products = self.fetch_new_products()
        if not products:
            print("No new products found.")
            return
        documents = self._products_to_documents(products)
        if not documents:
            print("No documents to add to ChromaDB.")
            return
        # Use LangChain Chroma.from_documents to create/update the vector DB
        self.chroma = Chroma.from_documents(
            documents,
            embedding=self.embeddings,
            persist_directory=self.db_path
        )
        self.chroma.persist()
        # Update latest_posted_datetime
        max_posted_datetime = max(
            datetime.fromisoformat(doc.metadata["postedDate"]) if isinstance(doc.metadata["postedDate"], str)
            else doc.metadata["postedDate"]
            for doc in documents
        )
        self.latest_posted_datetime = max_posted_datetime
        print(f"Synced {len(documents)} products to ChromaDB. Latest postedDateTime: {self.latest_posted_datetime}")

    def print_all_product_ids(self):
        if not self.chroma:
            print("ChromaDB not initialized. Call sync_to_chroma() first.")
            return
        try:
            results = self.chroma._collection.get()
            ids = results.get('ids', [])
            print("Product IDs in ChromaDB:")
            for pid in ids:
                print(pid)
            print(f"Total products in ChromaDB: {len(ids)}")
        except Exception as e:
            print(f"Error fetching product ids: {e}")

    def get_retriever(self, k=3):
        """Get a retriever for similarity search"""
        if not self.chroma:
            self.sync_to_chroma()
            
        # ChromaDB's native retriever
        return self.chroma.as_retriever(k=k)

    def search_products(self, query: str, k: int = 3):
        """Search products using vector similarity"""
        results = self.get_retriever(k)(query)
        return results
