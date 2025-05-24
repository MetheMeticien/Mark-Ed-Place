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
    def __init__(self, db_path="my_vector_db", embedding_function=None, db_credentials=None):
        load_dotenv()
        self.db_path = db_path
        self.latest_posted_datetime = None
        self.embeddings = embedding_function or GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.chroma = None
        self.db_credentials = db_credentials or {
            'dbname': os.getenv("DB_NAME", "coderushdb"),
            'user': os.getenv("DB_USER", "rifat"),
            'host': os.getenv("DB_HOST", "localhost"),
            'port': os.getenv("DB_PORT", "5432"),
            'password': os.getenv("DB_PASSWORD", "1234")
        }

    def _products_to_documents(self, products: List[tuple]) -> List[Document]:
        """Convert PostgreSQL products to LangChain Documents"""
        documents = []
        for prod in products:
            (prod_id, title, desc, price, seller_id, category, condition,
             location, university_id, visibility, image, stock,
             created_at, updated_at, avg_rating, num_of_ratings) = prod

            # Format single image or fallback
            image_str = image if isinstance(image, str) and image else "No images"

            doc_text = f"""Product ID: {prod_id}
Title: {title}
Description: {desc}
Price: ${price}
Category: {category}
Condition: {condition}
Location: {location}
Stock: {stock}
Rating: {avg_rating}/5 ({num_of_ratings} ratings)
Image: {image_str}
"""
            metadata = {
                "id": prod_id,
                "title": title,
                "description": desc,
                "price": price,
                "seller_id": seller_id,
                "category": category,
                "condition": condition,
                "location": location,
                "university_id": university_id,
                "visibility": visibility,
                # store image as primitive string
                "image": image_str,
                "stock": stock,
                "created_at": created_at.isoformat() if isinstance(created_at, datetime) else str(created_at),
                "updated_at": updated_at.isoformat() if isinstance(updated_at, datetime) else str(updated_at),
                "avg_rating": avg_rating,
                "num_of_ratings": num_of_ratings
            }
            documents.append(Document(page_content=doc_text, metadata=metadata))
        return documents

    def fetch_new_products(self):
        connection_params = self.db_credentials
        try:
            connection = psycopg2.connect(**connection_params)
            cursor = connection.cursor()
            if self.latest_posted_datetime:
                cursor.execute("""
                    SELECT id, title, description, price, seller_id, category,
                           condition, location, university_id, visibility, image,
                           stock, created_at, updated_at, avg_rating, num_of_ratings
                    FROM products
                    WHERE created_at > %s
                    ORDER BY created_at ASC;
                """, (self.latest_posted_datetime,))
            else:
                cursor.execute("""
                    SELECT id, title, description, price, seller_id, category,
                           condition, location, university_id, visibility, image,
                           stock, created_at, updated_at, avg_rating, num_of_ratings
                    FROM products
                    ORDER BY created_at ASC;
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

        # create/update the vector DB
        self.chroma = Chroma.from_documents(
            documents,
            embedding=self.embeddings,
            persist_directory=self.db_path
        )
        self.chroma.persist()

        # Update latest_posted_datetime
        max_posted_datetime = max(
            datetime.fromisoformat(doc.metadata["created_at"])
            if isinstance(doc.metadata["created_at"], str)
            else doc.metadata["created_at"]
            for doc in documents
        )
        self.latest_posted_datetime = max_posted_datetime
        print(f"Synced {len(documents)} products to ChromaDB. "
              f"Latest created_at: {self.latest_posted_datetime}")

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
        return self.chroma.as_retriever(k=k)

    def search_products(self, query: str, k: int = 3):
        """Search products using vector similarity"""
        retriever = self.get_retriever(k)
        return retriever(query)


if __name__ == "__main__":
    # Instantiate handler, sync data, and print stored IDs
    handler = HandleChromaDB(db_path="my_vector_db")
    handler.sync_to_chroma()
    handler.print_all_product_ids()
