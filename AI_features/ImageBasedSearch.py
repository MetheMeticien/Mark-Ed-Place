from Rag import Rag
import pathlib  
import os
from dotenv import load_dotenv
import google.generativeai as genai



class ImageBasedSearch:
    def __init__(self, model_name='gemini-1.5-flash'):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
        self.rag = Rag()
    
    def findItems(self, image_path, n=3):
        image_path = pathlib.Path(image_path)
        image_data = image_path.read_bytes()
        response = self.model.generate_content([
            "Caption this Image while giving specific descriptions. Nothing else",
            {"mime_type": "image/jpeg", "data": image_data}
        ])
        caption = response.text.strip()
        print(f"Image Caption: {caption}")
        found_items = self.rag.retrieve_all_queried_products(caption, k=n)
        print(f"Found item IDs: {found_items}")
        return found_items

if __name__ == "__main__":
    imageSearch = ImageBasedSearch()
    imageSearch.findItems('calculator.jpg')
